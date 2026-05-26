import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const amount = session.amount_total ? (session.amount_total / 100).toFixed(2) : '0.00'
    const currency = session.currency?.toUpperCase() || 'USD'
    const customerEmail = session.customer_details?.email || 'Not provided'
    const customerName = session.customer_details?.name || 'Anonymous'
    const customerPhone = session.customer_details?.phone || 'Not provided'
    const paymentStatus = session.payment_status
    const isSubscription = session.mode === 'subscription'
    const donationType = isSubscription ? 'Monthly Recurring' : 'One-Time'

    try {
      await resend.emails.send({
        from: 'Kollel Ohr Moshe <donations@kollelohrmoshe.com>',
        to: 'amit@kollelohrmoshe.com',
        subject: `New Donation: $${amount} ${currency} - ${donationType}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8B7355; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">
              New Donation Received
            </h1>
            
            <div style="background-color: #f9f7f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #333; margin-top: 0;">Donation Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 40%;">Amount:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: bold; font-size: 18px;">$${amount} ${currency}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Type:</td>
                  <td style="padding: 8px 0; color: #333;">${donationType}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Status:</td>
                  <td style="padding: 8px 0; color: #22c55e; font-weight: bold;">${paymentStatus === 'paid' ? 'Paid' : paymentStatus}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #fff; padding: 20px; border: 1px solid #e5e5e5; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #333; margin-top: 0;">Donor Information</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 40%;">Name:</td>
                  <td style="padding: 8px 0; color: #333;">${customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Email:</td>
                  <td style="padding: 8px 0; color: #333;">${customerEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Phone:</td>
                  <td style="padding: 8px 0; color: #333;">${customerPhone}</td>
                </tr>
              </table>
            </div>

            <div style="margin-top: 20px; padding: 15px; background-color: #D4AF37; color: #fff; border-radius: 8px; text-align: center;">
              <p style="margin: 0; font-size: 14px;">
                100% of this donation goes directly to Torah scholar stipends.
              </p>
            </div>

            <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">
              Stripe Session ID: ${session.id}<br>
              Received: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}
            </p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError)
      // Don't fail the webhook if email fails
    }
  }

  // Handle subscription payments (for recurring monthly donations)
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice
    
    // Only notify for subscription invoices (not the initial checkout)
    if (invoice.subscription && invoice.billing_reason === 'subscription_cycle') {
      const amount = invoice.amount_paid ? (invoice.amount_paid / 100).toFixed(2) : '0.00'
      const currency = invoice.currency?.toUpperCase() || 'USD'
      const customerEmail = invoice.customer_email || 'Not provided'

      try {
        await resend.emails.send({
          from: 'Kollel Ohr Moshe <donations@kollelohrmoshe.com>',
          to: 'amit@kollelohrmoshe.com',
          subject: `Recurring Donation Received: $${amount} ${currency}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #8B7355; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">
                Monthly Recurring Donation Received
              </h1>
              
              <div style="background-color: #f9f7f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #333; margin-top: 0;">Donation Details</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; width: 40%;">Amount:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: bold; font-size: 18px;">$${amount} ${currency}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Type:</td>
                    <td style="padding: 8px 0; color: #333;">Monthly Recurring</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Donor Email:</td>
                    <td style="padding: 8px 0; color: #333;">${customerEmail}</td>
                  </tr>
                </table>
              </div>

              <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">
                Invoice ID: ${invoice.id}<br>
                Received: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}
              </p>
            </div>
          `,
        })
      } catch (emailError) {
        console.error('Failed to send recurring donation email:', emailError)
      }
    }
  }

  return NextResponse.json({ received: true })
}
