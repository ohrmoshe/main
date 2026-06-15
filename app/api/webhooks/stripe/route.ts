import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { donations } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import Stripe from "stripe"

// Lazy load Resend only when needed and API key is available
async function getResend() {
  if (!process.env.RESEND_API_KEY) {
    return null
  }
  const { Resend } = await import("resend")
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

async function sendDonorConfirmation(data: {
  name: string
  email: string
  entries: number
  amount: number
  isOneTime: boolean
}) {
  if (!data.email) return

  const subject = "You're entered! Your Watch & Learn drawing details"
  const entryText = `${data.entries} ${data.entries === 1 ? "entry" : "entries"}`
  const planText = data.isOneTime
    ? `${entryText} in this month's drawing`
    : `${entryText} in every monthly drawing`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background-color: #0e2a2a; color: #f5efe6; padding: 32px; border-radius: 12px;">
      <h1 style="color: #c89b5c; font-size: 26px; margin: 0 0 8px;">Thank You, ${data.name}!</h1>
      <p style="color: #e8e0d2; font-size: 16px; line-height: 1.6;">
        Your ${data.isOneTime ? "one-time donation" : "monthly donation"} has been received and you now have
        <strong style="color: #d9b87a;">${planText}</strong>. Good luck!
      </p>

      <div style="background-color: #143434; border: 1px solid rgba(200,155,92,0.3); border-radius: 10px; padding: 20px; margin: 24px 0;">
        <h2 style="color: #c89b5c; font-size: 18px; margin: 0 0 12px;">Join the Live Drawing on Zoom</h2>
        <p style="color: #e8e0d2; font-size: 15px; line-height: 1.6; margin: 0 0 12px;">
          The winner is announced live each month. Join us:
        </p>
        <p style="margin: 0 0 8px;">
          <a href="https://us05web.zoom.us/j/8346375415?pwd=WTe0FDM1XOsbl5trcaFH6QyI7dxQfX.1&omn=83760257446"
             style="color: #d9b87a; font-size: 15px; word-break: break-all;">
            https://us05web.zoom.us/j/8346375415
          </a>
        </p>
        <p style="color: #e8e0d2; font-size: 15px; margin: 4px 0;"><strong>Meeting ID:</strong> 834 637 5415</p>
        <p style="color: #e8e0d2; font-size: 15px; margin: 4px 0;"><strong>Passcode:</strong> ohrmoshe</p>
      </div>

      <p style="color: #b9b0a2; font-size: 13px; line-height: 1.6;">
        A project by Kollel Ohr Moshe. Thank you for supporting Torah education.
      </p>
    </div>
  `

  try {
    const resend = await getResend()
    if (!resend) {
      console.log(`[EMAIL SKIPPED] No RESEND_API_KEY configured - donor confirmation not sent`)
      return
    }
    await resend.emails.send({
      from: "Watch & Learn <notifications@watchnlearn.org>",
      to: data.email,
      subject,
      html,
    })
    console.log(`[EMAIL SENT] Donor confirmation to ${data.email}`)
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send donor confirmation:`, error)
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
    const resend = await getResend()
    if (!resend) {
      console.log(`[EMAIL SKIPPED] No RESEND_API_KEY configured - ${type} notification not sent`)
      return
    }
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
