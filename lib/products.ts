export interface DonationTier {
  id: string
  name: string
  description: string
  priceInCents: number
  frequency: 'one_time' | 'monthly'
}

export const DONATION_TIERS: DonationTier[] = [
  {
    id: 'one-time-180',
    name: 'Supporter',
    description: 'One-time donation of $180 - directly supports Torah scholars',
    priceInCents: 18000,
    frequency: 'one_time',
  },
  {
    id: 'one-time-360',
    name: 'Partner',
    description: 'One-time donation of $360 - directly supports Torah scholars',
    priceInCents: 36000,
    frequency: 'one_time',
  },
  {
    id: 'one-time-500',
    name: 'Benefactor',
    description: 'One-time donation of $500 - directly supports Torah scholars',
    priceInCents: 50000,
    frequency: 'one_time',
  },
  {
    id: 'one-time-720',
    name: 'Pillar',
    description: 'One-time donation of $720 - directly supports Torah scholars',
    priceInCents: 72000,
    frequency: 'one_time',
  },
  {
    id: 'one-time-1250',
    name: 'Patron',
    description: 'One-time donation of $1,250 - directly supports Torah scholars',
    priceInCents: 125000,
    frequency: 'one_time',
  },
  {
    id: 'one-time-custom',
    name: 'Custom Amount',
    description: 'Custom one-time donation - 100% goes to Torah scholar stipends',
    priceInCents: 0,
    frequency: 'one_time',
  },
  {
    id: 'monthly-180',
    name: 'Monthly Supporter',
    description: 'Monthly donation of $180 - directly supports Torah scholars',
    priceInCents: 18000,
    frequency: 'monthly',
  },
  {
    id: 'monthly-360',
    name: 'Monthly Partner',
    description: 'Monthly donation of $360 - directly supports Torah scholars',
    priceInCents: 36000,
    frequency: 'monthly',
  },
  {
    id: 'monthly-500',
    name: 'Monthly Benefactor',
    description: 'Monthly donation of $500 - directly supports Torah scholars',
    priceInCents: 50000,
    frequency: 'monthly',
  },
  {
    id: 'monthly-720',
    name: 'Monthly Pillar',
    description: 'Monthly donation of $720 - directly supports Torah scholars',
    priceInCents: 72000,
    frequency: 'monthly',
  },
  {
    id: 'monthly-custom',
    name: 'Monthly Custom Amount',
    description: 'Custom monthly donation - 100% goes to Torah scholar stipends',
    priceInCents: 0,
    frequency: 'monthly',
  },
]
