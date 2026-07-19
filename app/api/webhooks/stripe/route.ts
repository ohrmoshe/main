import { NextRequest, NextResponse } from "next/server"
import { stripe, SITE_ID } from "@/lib/stripe"
import { db } from "@/lib/db"
import { donations, offerLinks } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"
import Stripe from "stripe"
import { sendDonorConfirmation, sendAdminNotification } from "@/lib/email"
import { recordTransaction } from "@/lib/transactions"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        // This Stripe account is shared with our other websites. Ignore any
        // checkout that this app did not create (i.e. not tagged for this site).
        if (session.metadata?.site !== SITE_ID) break

        // Handle one-time payment
        if (session.mode === "payment") {
          // Idempotency: Stripe re-delivers the same event on timeouts/retries.
          // The donations row is keyed on stripeSubscriptionId (unique), so if we
          // already recorded this checkout, acknowledge (200) and do nothing else.
          // Without this, the duplicate insert throws and we return 500 forever.
          const oneTimeSubId = `onetime_${session.id}`
          const [existingOneTime] = await db
            .select({ id: donations.id })
            .from(donations)
            .where(eq(donations.stripeSubscriptionId, oneTimeSubId))
            .limit(1)
          if (existingOneTime) break

          const customer = session.customer 
            ? await stripe.customers.retrieve(session.customer as string) as Stripe.Customer
            : null

          const entries = parseInt(session.metadata?.entries || "1")
          const amountCents = parseInt(session.metadata?.amountCents || "3600")
          const emailConsent = session.metadata?.emailConsent === "true"
          const smsConsent = session.metadata?.smsConsent === "true"
          const referralCode = session.metadata?.referralCode || null

          const insertedOneTime = await db
            .insert(donations)
            .values({
              stripeCustomerId: session.customer as string || oneTimeSubId,
              stripeSubscriptionId: oneTimeSubId,
              name: customer?.name || session.customer_details?.name || "Unknown",
              email: customer?.email || session.customer_details?.email || "",
              phone: session.customer_details?.phone || null,
              addressLine1: session.customer_details?.address?.line1 || null,
              addressCity: session.customer_details?.address?.city || null,
              addressState: session.customer_details?.address?.state || null,
              addressPostalCode: session.customer_details?.address?.postal_code || null,
              addressCountry: session.customer_details?.address?.country || null,
              entries,
              amountCents,
              status: "one_time",
              emailConsent,
              smsConsent,
              referralCode,
            })
            .onConflictDoNothing({ target: donations.stripeSubscriptionId })
            .returning({ id: donations.id })

          // A concurrent re-delivery won the race and already inserted this row.
          // Skip the transaction + emails so we don't duplicate them.
          if (insertedOneTime.length === 0) break

          // Record this charge as its own transaction (one-time payments do not
          // generate Stripe invoices, so we log it here from the checkout session).
          await recordTransaction({
            stripePaymentIntentId: (session.payment_intent as string) || null,
            stripeCustomerId: (session.customer as string) || null,
            name: customer?.name || session.customer_details?.name || "Unknown",
            email: customer?.email || session.customer_details?.email || "",
            amountCents,
            entries,
            type: "one_time",
            status: "paid",
            referralCode,
            chargedAt: new Date(),
          })

          // Send notification email to admin
          await sendAdminNotification("one_time", {
            name: customer?.name || session.customer_details?.name || "Unknown",
            email: customer?.email || session.customer_details?.email || "",
            entries,
            amount: amountCents / 100,
          })

          // Send confirmation with Zoom details to the donor
          await sendDonorConfirmation({
            name: customer?.name || session.customer_details?.name || "there",
            email: customer?.email || session.customer_details?.email || "",
            entries,
            amount: amountCents / 100,
            isOneTime: true,
          })
        }
        // Handle subscription
        else if (session.mode === "subscription" && session.subscription) {
          // Idempotency: bail out if this subscription was already recorded so a
          // re-delivered event doesn't hit the unique constraint and 500.
          const [existingSub] = await db
            .select({ id: donations.id })
            .from(donations)
            .where(eq(donations.stripeSubscriptionId, session.subscription as string))
            .limit(1)
          if (existingSub) break

          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )
          
          const customer = await stripe.customers.retrieve(
            session.customer as string
          ) as Stripe.Customer

          // Total entries for this drawing (display); base = permanent monthly weight.
          const totalEntries = parseInt(session.metadata?.entries || "1")
          const baseEntries = parseInt(session.metadata?.baseEntries || session.metadata?.entries || "1")
          const bonusEntries = parseInt(session.metadata?.bonusEntries || "0")
          const bonusUntilRaw = session.metadata?.bonusUntil || ""
          const bonusEntriesUntil = bonusUntilRaw ? new Date(bonusUntilRaw) : null
          const amountCents = parseInt(session.metadata?.amountCents || "0")
          const emailConsent = session.metadata?.emailConsent === "true"
          const smsConsent = session.metadata?.smsConsent === "true"
          const referralCode = session.metadata?.referralCode || null

          const insertedSub = await db
            .insert(donations)
            .values({
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscription.id,
              name: customer.name || session.customer_details?.name || "Unknown",
              email: customer.email || session.customer_details?.email || "",
              phone: session.customer_details?.phone || null,
              addressLine1: session.customer_details?.address?.line1 || null,
              addressCity: session.customer_details?.address?.city || null,
              addressState: session.customer_details?.address?.state || null,
              addressPostalCode: session.customer_details?.address?.postal_code || null,
              addressCountry: session.customer_details?.address?.country || null,
              entries: baseEntries,
              bonusEntries,
              bonusEntriesUntil,
              amountCents,
              status: "active",
              emailConsent,
              smsConsent,
              referralCode,
            })
            .onConflictDoNothing({ target: donations.stripeSubscriptionId })
            .returning({ id: donations.id })

          // A concurrent re-delivery already inserted this subscription; don't
          // send duplicate notification emails.
          if (insertedSub.length === 0) break

          // Win-back offer: if this checkout came from a one-time offer link,
          // burn the link so it can never be used again. The `redeemed=false`
          // guard makes this a no-op if it was already consumed (idempotent).
          const offerToken = session.metadata?.offerToken
          if (offerToken) {
            await db
              .update(offerLinks)
              .set({
                redeemed: true,
                redeemedEmail: customer.email || session.customer_details?.email || null,
                redeemedSubscriptionId: subscription.id,
                redeemedAt: new Date(),
              })
              .where(and(eq(offerLinks.token, offerToken), eq(offerLinks.redeemed, false)))
          }

          // Send notification email to admin
          await sendAdminNotification("new_subscription", {
            name: customer.name || session.customer_details?.name || "Unknown",
            email: customer.email || session.customer_details?.email || "",
            entries: totalEntries,
            amount: amountCents / 100,
          })

          // Send confirmation with Zoom details to the donor
          await sendDonorConfirmation({
            name: customer.name || session.customer_details?.name || "there",
            email: customer.email || session.customer_details?.email || "",
            entries: totalEntries,
            amount: amountCents / 100,
            isOneTime: false,
          })
        }
        break
      }

      // Every successful invoice — the initial subscription charge AND every
      // recurring monthly renewal — lands here. This is what was missing: the
      // old webhook only handled checkout.session.completed (initial signup),
      // so renewals never appeared in the admin. We record one transaction per
      // invoice, deduped by invoice id.
      case "invoice.payment_succeeded":
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice

        const amountCents = invoice.amount_paid ?? invoice.amount_due ?? 0
        if (amountCents <= 0) break

        // Field locations shift between Stripe API versions, so read defensively.
        const inv = invoice as any
        const subscriptionId: string | null =
          (typeof inv.subscription === "string" ? inv.subscription : null) ||
          inv.parent?.subscription_details?.subscription ||
          inv.lines?.data?.[0]?.subscription ||
          inv.lines?.data?.[0]?.parent?.subscription_item_details?.subscription ||
          null

        // Only subscription invoices become transactions here; one-time payments
        // are handled in checkout.session.completed above.
        if (!subscriptionId) break

        const paymentIntentId: string | null =
          typeof inv.payment_intent === "string" ? inv.payment_intent : null
        const chargeId: string | null =
          typeof inv.charge === "string" ? inv.charge : null
        const customerId: string | null =
          typeof invoice.customer === "string" ? invoice.customer : null

        // subscription_create = first charge, otherwise it's a renewal.
        const isInitial = invoice.billing_reason === "subscription_create"

        // Pull entry count from the donor record when we have it.
        const [donor] = subscriptionId
          ? await db
              .select()
              .from(donations)
              .where(eq(donations.stripeSubscriptionId, subscriptionId))
          : []

        // Shared Stripe account: only record charges that belong to this site.
        // A charge is ours if the donor already exists in our table, or if the
        // subscription is tagged with our site marker. Metadata may be embedded
        // on the invoice; if not, retrieve the subscription to confirm.
        let ownedByThisSite = Boolean(donor)
        if (!ownedByThisSite) {
          const embeddedMeta =
            inv.subscription_details?.metadata ||
            inv.parent?.subscription_details?.metadata ||
            null
          if (embeddedMeta?.site === SITE_ID) {
            ownedByThisSite = true
          } else {
            try {
              const sub = await stripe.subscriptions.retrieve(subscriptionId)
              ownedByThisSite = sub.metadata?.site === SITE_ID
            } catch {
              ownedByThisSite = false
            }
          }
        }
        if (!ownedByThisSite) break

        const paidAt = invoice.status_transitions?.paid_at
          ? new Date(invoice.status_transitions.paid_at * 1000)
          : new Date((invoice.created || Math.floor(Date.now() / 1000)) * 1000)

        await recordTransaction({
          stripeInvoiceId: invoice.id,
          stripePaymentIntentId: paymentIntentId,
          stripeChargeId: chargeId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          name: donor?.name || invoice.customer_name || "Unknown",
          email: donor?.email || invoice.customer_email || "",
          amountCents,
          entries: donor?.entries ?? 0,
          type: isInitial ? "subscription_initial" : "subscription_renewal",
          status: "paid",
          referralCode: donor?.referralCode ?? null,
          chargedAt: paidAt,
        })
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        
        await db
          .update(donations)
          .set({
            status: "cancelled",
            cancelledAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(donations.stripeSubscriptionId, subscription.id))

        // Get donor info for notification
        const [donor] = await db
          .select()
          .from(donations)
          .where(eq(donations.stripeSubscriptionId, subscription.id))

        if (donor) {
          await sendAdminNotification("cancellation", {
            name: donor.name,
            email: donor.email,
            entries: donor.entries,
            amount: donor.amountCents / 100,
          })
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        
        // Update status based on subscription status
        const newStatus = subscription.status === "active" ? "active" : "cancelled"
        
        await db
          .update(donations)
          .set({
            status: newStatus,
            updatedAt: new Date(),
            ...(newStatus === "cancelled" ? { cancelledAt: new Date() } : {}),
          })
          .where(eq(donations.stripeSubscriptionId, subscription.id))
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    // IMPORTANT: acknowledge with a 2xx even when our own processing fails.
    // The signature was already verified above, so this is a genuine Stripe
    // event — returning 500 here makes Stripe retry the SAME event over and
    // over (this is what triggered 800+ failed deliveries and got the endpoint
    // disabled). Our handlers are idempotent and the admin "Sync from Stripe"
    // backfill can recover any transaction we miss, so it is safe to ack and
    // log rather than force an infinite retry loop.
    console.error("[v0] Webhook processing error (acknowledged to stop retries):", {
      eventId: event.id,
      eventType: event.type,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ received: true, processingError: true })
  }
}
