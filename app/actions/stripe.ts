'use server'

import { stripe } from '@/lib/stripe'
import { DONATION_TIERS } from '@/lib/products'

interface DonationParams {
  tierId: string
  customAmount?: number
  subscriberInfo?: {
    email?: string
    phone?: string
    emailOptIn?: boolean
    smsOptIn?: boolean
  }
}

export async function startDonationSession(params: DonationParams) {
  const { tierId, customAmount, subscriberInfo } = params

  const tier = DONATION_TIERS.find((t) => t.id === tierId)
  if (!tier) {
    throw new Error(`Donation tier "${tierId}" not found`)
  }

  const amount = tierId.includes('custom') && customAmount ? customAmount * 100 : tier.priceInCents

  if (amount < 100) {
    throw new Error('Minimum donation amount is $1')
  }

  const isMonthly = tier.frequency === 'monthly'

  // Build metadata with subscription preferences
  const metadata: Record<string, string> = {
    donation_tier: tier.name,
    frequency: tier.frequency,
  }

  if (subscriberInfo) {
    if (subscriberInfo.email) metadata.subscriber_email = subscriberInfo.email
    if (subscriberInfo.phone) metadata.subscriber_phone = subscriberInfo.phone
    metadata.email_opt_in = subscriberInfo.emailOptIn ? 'true' : 'false'
    metadata.sms_opt_in = subscriberInfo.smsOptIn ? 'true' : 'false'
  }

  if (isMonthly) {
    // Create subscription checkout session
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded_page',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tier.name,
              description: `Monthly recurring donation to Kollel Ohr Moshe`,
            },
            unit_amount: amount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      metadata,
    })

    return session.client_secret
  } else {
    // Create one-time payment checkout session
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded_page',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tier.name,
              description: `One-time donation to Kollel Ohr Moshe`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata,
    })

    return session.client_secret
  }
}
