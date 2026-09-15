import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { db } from "@/lib/db"
import { donations } from "@/lib/db/schema"
import { calculateCustomTier } from "@/lib/products"
import { recordTransaction } from "@/lib/transactions"
import { sendDonorConfirmation, sendAdminNotification } from "@/lib/email"

// Pledge.to ("Pledger") donations happen entirely on Pledge.to's hosted widget,
// so Stripe never sees them. Pledge.to instead POSTs a webhook here whenever a
// donation is created/updated. We verify it, then reconcile the completed gift
// into the same `donations` + `transactions` tables the Stripe flow uses, so
// Pledger donors show up in the admin and earn raffle entries.
//
// Setup required in the Pledge.to dashboard/API:
//   • Register a webhook pointing at: https://<your-domain>/api/webhooks/pledge
//   • Store your Pledge.to PRIMARY API KEY as the PLEDGE_API_KEY env var — it is
//     the shared secret used to sign/verify the payload.
export const runtime = "nodejs"

// Pledge.to signs the raw request body with HMAC-SHA256 using the primary API
// key as the secret and sends the digest in the `Pledgeling-Signature` header.
// Accept either hex or base64 encodings and compare in constant time.
function verifySignature(rawBody: string, header: string | null, secret: string): boolean {
  if (!header) return false
  const hmac = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest()
  const candidates = [hmac.toString("hex"), hmac.toString("base64")]
  return candidates.some((expected) => {
    if (expected.length !== header.length) return false
    try {
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(header))
    } catch {
      return false
    }
  })
}

// We stamp custom metadata on each gift via the widget's `data-x-*` attributes
// (see PledgerModal). Pledge.to echoes those back under the donation's metadata,
// but the exact key casing/prefix that survives the round trip is unspecified
// (x_entries, x-entries, data-x-entries, xEntries, …). Normalize every key to
// bare alphanumerics so `x_entries`/`data-x-entries`/`xEntries` all resolve to
// the same logical name ("xentries").
function normalizeMeta(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {}
  if (!raw || typeof raw !== "object") return out
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (v == null) continue
    const key = k.toLowerCase().replace(/[^a-z0-9]/g, "")
    out[key] = String(v)
  }
  return out
}

// Read a value from the first matching key path, tolerating the small shape
// differences between Pledge.to payload versions (donation at top level vs.
// wrapped in `data`, snake_case vs. nested donor object, etc.).
function pick<T = unknown>(obj: Record<string, any>, paths: string[]): T | undefined {
  for (const path of paths) {
    let cur: any = obj
    let ok = true
    for (const part of path.split(".")) {
      if (cur == null || typeof cur !== "object" || !(part in cur)) {
        ok = false
        break
      }
      cur = cur[part]
    }
    if (ok && cur != null && cur !== "") return cur as T
  }
  return undefined
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  const secret = process.env.PLEDGE_API_KEY
  if (!secret) {
    console.error("[v0] Pledge webhook: PLEDGE_API_KEY is not set; cannot verify signature")
    // Nothing we can safely do with an unverifiable event. Ack so Pledge.to
    // does not retry forever; the admin backfill can recover later.
    return NextResponse.json({ received: true, error: "not_configured" })
  }

  const signature = request.headers.get("pledgeling-signature") || request.headers.get("Pledgeling-Signature")
  if (!verifySignature(rawBody, signature, secret)) {
    console.error("[v0] Pledge webhook: signature verification failed")
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    const payload = JSON.parse(rawBody) as Record<string, any>
    // The donation may be at the top level or nested under `data`/`donation`.
    const donation: Record<string, any> = payload.data || payload.donation || payload

    const donationId = pick<string>(donation, ["id", "uuid", "donation_id", "transaction_id"])
    if (!donationId) {
      console.error("[v0] Pledge webhook: no donation id in payload")
      return NextResponse.json({ received: true, error: "no_id" })
    }

    // Only reconcile completed gifts. Pledge.to marks in-flight donations with
    // pending=true or status !== "completed"/"success". Skip those.
    const pending = pick<boolean>(donation, ["pending"])
    const status = (pick<string>(donation, ["status", "state"]) || "").toLowerCase()
    const isCompleted =
      pending === false || ["completed", "complete", "success", "succeeded", "paid"].includes(status)
    // If neither field is present we optimistically treat it as completed,
    // since Pledge.to typically only fires for successful donations.
    const hasStatusInfo = pending !== undefined || status !== ""
    if (hasStatusInfo && !isCompleted) {
      return NextResponse.json({ received: true, skipped: "not_completed" })
    }

    // Pledge.to amounts are decimal dollars. Convert to cents.
    const amountDollars = Number(pick<number | string>(donation, ["amount", "donation_amount", "total"]) ?? 0)
    const amountCents = Math.round(amountDollars * 100)
    if (!amountCents || amountCents <= 0) {
      console.error("[v0] Pledge webhook: non-positive amount", { donationId, amountDollars })
      return NextResponse.json({ received: true, error: "bad_amount" })
    }

    // Donor identity — try a nested donor object and flat fields.
    const first = pick<string>(donation, ["first_name", "donor.first_name", "donor_first_name"]) || ""
    const last = pick<string>(donation, ["last_name", "donor.last_name", "donor_last_name"]) || ""
    const fullName =
      pick<string>(donation, ["name", "donor.name", "donor_name"]) || `${first} ${last}`.trim() || "Pledger Donor"
    const email = pick<string>(donation, ["email", "donor.email", "donor_email"]) || ""

    // Metadata we stamped on the gift before the donor paid. `xentries` is the
    // entry count for the tier / wheel result the donor picked on the site, so
    // it is authoritative — it makes a Pledger gift "match the tier the donor
    // picked" instead of being re-derived from the amount (which can't tell a
    // 1-entry wheel spin apart from a 3-entry tier at the same dollar amount).
    const meta = normalizeMeta(pick(donation, ["metadata", "meta", "custom_fields", "customFields"]))
    const metaEntries = meta.xentries !== undefined ? Number.parseInt(meta.xentries, 10) : NaN
    const plan = meta.xplan === "monthly" ? "monthly" : meta.xplan === "one_time" ? "one_time" : ""
    const context = meta.xcontext || ""

    // Prefer the picked-tier entries; fall back to the one-time $42/entry rate
    // only when the metadata is missing (e.g. a donation made straight from the
    // Pledge.to hosted page, outside our flow).
    const entries =
      Number.isFinite(metaEntries) && metaEntries >= 0 ? metaEntries : (calculateCustomTier(amountCents)?.entries ?? 0)

    // Monthly gifts recur; treat them like the subscription flow. Everything
    // else (one-time, wheel, unknown) is recorded as a one-time gift.
    const isMonthly = plan === "monthly"
    const donationStatus = isMonthly ? "active" : "one_time"
    const txType = isMonthly ? "subscription_initial" : "one_time"

    console.log("[v0] Pledge webhook reconciling", { donationId, entries, plan, context, amountCents })

    // Dedupe key shared across both tables. Pledge.to re-delivers on retries.
    const dedupeId = `pledge_${donationId}`

    const inserted = await db
      .insert(donations)
      .values({
        stripeCustomerId: dedupeId,
        stripeSubscriptionId: dedupeId,
        name: fullName,
        email,
        entries,
        amountCents,
        status: donationStatus,
        emailConsent: false,
        smsConsent: false,
        referralCode: "pledger",
      })
      .onConflictDoNothing({ target: donations.stripeSubscriptionId })
      .returning({ id: donations.id })

    // Already recorded (retry / concurrent delivery) — ack and stop.
    if (inserted.length === 0) {
      return NextResponse.json({ received: true, duplicate: true })
    }

    await recordTransaction({
      stripePaymentIntentId: dedupeId,
      name: fullName,
      email,
      amountCents,
      entries,
      type: txType,
      status: "paid",
      referralCode: "pledger",
      chargedAt: new Date(),
    })

    await sendAdminNotification(isMonthly ? "new_subscription" : "one_time", {
      name: fullName,
      email,
      entries,
      amount: amountCents / 100,
    })

    if (email) {
      await sendDonorConfirmation({
        name: fullName || "there",
        email,
        entries,
        amount: amountCents / 100,
        isOneTime: !isMonthly,
      })
    }

    return NextResponse.json({ received: true, entries })
  } catch (error) {
    // Signature is already verified, so this is a genuine Pledge.to event.
    // Ack with 2xx to avoid an infinite retry loop; log for investigation.
    console.error("[v0] Pledge webhook processing error (acknowledged):", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ received: true, processingError: true })
  }
}
