import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { donations } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import Stripe from "stripe"
import { sendDonorConfirmation, sendAdminNotification } from "@/lib/email"

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
        
        // Handle one-time payment
        if (session.mode === "payment") {
          const customer = session.customer 
            ? await stripe.customers.retrieve(session.customer as string) as Stripe.Customer
            : null

          const entries = parseInt(session.metadata?.entries || "1")
          const amountCents = parseInt(session.metadata?.amountCents || "3600")
          const emailConsent = session.metadata?.emailConsent === "true"
          const smsConsent = session.metadata?.smsConsent === "true"
          const referralCode = session.metadata?.referralCode || null

          await db.insert(donations).values({
            stripeCustomerId: session.customer as string || `onetime_${session.id}`,
            stripeSubscriptionId: `onetime_${session.id}`,
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
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )
          
          const customer = await stripe.customers.retrieve(
            session.customer as string
          ) as Stripe.Customer

          const entries = parseInt(session.metadata?.entries || "1")
          const amountCents = parseInt(session.metadata?.amountCents || "0")
          const emailConsent = session.metadata?.emailConsent === "true"
          const smsConsent = session.metadata?.smsConsent === "true"
          const referralCode = session.metadata?.referralCode || null

          await db.insert(donations).values({
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
            entries,
            amountCents,
            status: "active",
            emailConsent,
            smsConsent,
            referralCode,
          })

          // Send notification email to admin
          await sendAdminNotification("new_subscription", {
            name: customer.name || session.customer_details?.name || "Unknown",
            email: customer.email || session.customer_details?.email || "",
            entries,
            amount: amountCents / 100,
          })

          // Send confirmation with Zoom details to the donor
          await sendDonorConfirmation({
            name: customer.name || session.customer_details?.name || "there",
            email: customer.email || session.customer_details?.email || "",
            entries,
            amount: amountCents / 100,
            isOneTime: false,
          })
        }
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
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
