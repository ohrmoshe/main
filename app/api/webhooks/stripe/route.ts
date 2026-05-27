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

    console.log('[v0] Webhook received - checkout.session.completed')
    console.log('[v0] Customer email:', customerEmail)
    console.log('[v0] Amount:', amount)
    console.log('[v0] RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)

    try {
      // Send notification to admin
      console.log('[v0] Attempting to send admin notification email...')
      const adminEmailResult = await resend.emails.send({
        from: 'Kollel Ohr Moshe <amit@kollelohrmoshe.org>',
        to: 'amit@kollelohrmoshe.org',
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
      console.log('[v0] Admin email result:', JSON.stringify(adminEmailResult))
    } catch (emailError) {
      console.error('[v0] Failed to send notification email:', emailError)
      // Don't fail the webhook if email fails
    }

    // Send confirmation email to donor
    if (customerEmail && customerEmail !== 'Not provided') {
      try {
        console.log('[v0] Attempting to send donor confirmation email to:', customerEmail)
        const donorEmailResult = await resend.emails.send({
          from: 'Kollel Ohr Moshe <amit@kollelohrmoshe.org>',
          to: customerEmail,
          subject: `Thank You for Your Donation to Kollel Ohr Moshe`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <div style="text-align: center; padding: 30px 20px; background-color: #f9f7f4;">
                <img src="https://kollelohrmoshe.org/images/logo-gold-black.png" alt="Kollel Ohr Moshe" style="max-width: 180px; height: auto;">
              </div>
              
              <div style="padding: 30px 20px;">
                <h1 style="color: #8B7355; text-align: center; border-bottom: 2px solid #D4AF37; padding-bottom: 15px; margin-top: 0;">
                  Thank You for Your Generosity
                </h1>
                
                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                  Dear ${customerName},
                </p>
                
                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                  Thank you for your generous ${donationType.toLowerCase()} donation of <strong>$${amount} ${currency}</strong> to Kollel Ohr Moshe.
                </p>
                
                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                  Your support directly enables our 35 Avreichim to dedicate themselves to full-time Torah study. 
                  <strong>100% of your donation goes to Torah scholar stipends</strong> — no overhead, no facility expenses, just pure Torah learning.
                </p>

                <div style="background-color: #f9f7f4; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #D4AF37;">
                  <h3 style="color: #8B7355; margin-top: 0;">Your Donation Receipt</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #666;">Amount:</td>
                      <td style="padding: 8px 0; color: #333; font-weight: bold;">$${amount} ${currency}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #666;">Type:</td>
                      <td style="padding: 8px 0; color: #333;">${donationType}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #666;">Date:</td>
                      <td style="padding: 8px 0; color: #333;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #666;">Tax ID (EIN):</td>
                      <td style="padding: 8px 0; color: #333; font-weight: bold;">33-3914717</td>
                    </tr>
                  </table>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <img src="https://kollelohrmoshe.org/images/beit-midrash-wide.jpg" alt="Torah Learning at Kollel Ohr Moshe" style="max-width: 100%; height: auto; border-radius: 8px;">
                  <p style="color: #666; font-size: 12px; margin-top: 8px; font-style: italic;">Torah learning at Kollel Ohr Moshe</p>
                </div>

                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                  May you be blessed with health, happiness, and success in all your endeavors. Your partnership in Torah learning creates eternal merit.
                </p>

                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                  With gratitude and blessings,<br>
                  <strong>Rabbi Amit Turgeman</strong><br>
                  Kollel Ohr Moshe
                </p>
              </div>

              <div style="padding: 20px; background-color: #8B7355; color: #fff; text-align: center;">
                <p style="margin: 0 0 10px 0; font-size: 14px;">
                  Kollel Ohr Moshe is a 501(c)(3) tax-exempt organization.
                </p>
                <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">
                  Tax ID (EIN): 33-3914717
                </p>
                <p style="margin: 0; font-size: 12px; opacity: 0.9;">
                  Please retain this email as your donation receipt for tax purposes.
                </p>
              </div>

              <div style="padding: 20px; text-align: center; color: #999; font-size: 12px; background-color: #f9f7f4;">
                <p style="margin: 0 0 10px 0;">
                  Questions? Contact us at <a href="mailto:amit@kollelohrmoshe.org" style="color: #8B7355;">amit@kollelohrmoshe.org</a> or (818) 744-2970
                </p>
                <p style="margin: 0;">
                  <a href="https://kollelohrmoshe.org" style="color: #8B7355;">kollelohrmoshe.org</a>
                </p>
              </div>
            </div>
          `,
        })
        console.log('[v0] Donor email result:', JSON.stringify(donorEmailResult))
      } catch (donorEmailError) {
        console.error('[v0] Failed to send donor confirmation email:', donorEmailError)
      }
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
          from: 'Kollel Ohr Moshe <amit@kollelohrmoshe.org>',
          to: 'amit@kollelohrmoshe.org',
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
