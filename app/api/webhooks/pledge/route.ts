import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { db } from "@/lib/db"
import { donations } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
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

    // Pledger gifts are one-time, so grant entries at the one-time rate
    // ($42/entry, floored). Gifts under $42 are recorded with 0 entries.
    const tier = calculateCustomTier(amountCents)
    const entries = tier?.entries ?? 0

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
        status: "one_time",
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
      type: "one_time",
      status: "paid",
      referralCode: "pledger",
      chargedAt: new Date(),
    })

    await sendAdminNotification("one_time", {
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
        isOneTime: true,
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
