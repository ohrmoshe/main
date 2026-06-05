import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { donations } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import Stripe from "stripe"
import { Resend } from "resend"

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

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
          })

          // Send notification email to admin
          await sendAdminNotification("one_time", {
            name: customer?.name || session.customer_details?.name || "Unknown",
            email: customer?.email || session.customer_details?.email || "",
            entries,
            amount: amountCents / 100,
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
          })

          // Send notification email to admin
          await sendAdminNotification("new_subscription", {
            name: customer.name || session.customer_details?.name || "Unknown",
            email: customer.email || session.customer_details?.email || "",
            entries,
            amount: amountCents / 100,
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

async function sendAdminNotification(
  type: "new_subscription" | "cancellation" | "one_time",
  data: { name: string; email: string; entries: number; amount: number }
) {
  const adminEmail = "amit@watchnlearn.org"
  
  const subject = type === "new_subscription" 
    ? `New Subscription: ${data.name} - ${data.entries} entries ($${data.amount}/mo)` 
    : type === "one_time"
    ? `New One-Time Donation: ${data.name} - $${data.amount}`
    : `Subscription Cancelled: ${data.name}`

  const html = type === "new_subscription"
    ? `
      <h2>New Monthly Subscription</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Entries:</strong> ${data.entries}</p>
      <p><strong>Amount:</strong> $${data.amount}/month</p>
      <p>This donor has been automatically added to the raffle database.</p>
    `
    : type === "one_time"
    ? `
      <h2>New One-Time Donation</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Entries:</strong> ${data.entries}</p>
      <p><strong>Amount:</strong> $${data.amount}</p>
      <p>This donor has been added to this month's raffle.</p>
    `
    : `
      <h2>Subscription Cancelled</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Entries:</strong> ${data.entries}</p>
      <p><strong>Amount:</strong> $${data.amount}/month</p>
      <p>This donor has been marked as cancelled and will not be entered in future raffles.</p>
    `

  try {
    const resend = getResend()
    await resend.emails.send({
      from: "Watch & Learn <notifications@watchnlearn.org>",
      to: adminEmail,
      subject,
      html,
    })
    console.log(`[EMAIL SENT] ${type} notification to ${adminEmail}`)
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send ${type} notification:`, error)
  }
}
