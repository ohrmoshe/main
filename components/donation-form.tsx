'use client'

import { useCallback, useState } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import { startDonationSession } from '@/app/actions/stripe'
import { DONATION_TIERS } from '@/lib/products'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function DonationForm() {
  const [frequency, setFrequency] = useState<'one_time' | 'monthly'>('one_time')
  const [selectedAmount, setSelectedAmount] = useState<number>(180)
  const [customAmount, setCustomAmount] = useState<string>('')
  const [isCustom, setIsCustom] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [emailOptIn, setEmailOptIn] = useState(false)
  const [smsOptIn, setSmsOptIn] = useState(false)

  const amounts = frequency === 'one_time' 
    ? [180, 360, 500, 720, 1250] 
    : [180, 360, 500, 720, 1250]

  const getTierId = () => {
    const prefix = frequency === 'one_time' ? 'one-time' : 'monthly'
    if (isCustom) return `${prefix}-custom`
    return `${prefix}-${selectedAmount}`
  }

  const startCheckoutSessionForDonation = useCallback(async () => {
    const result = await startDonationSession({
      tierId: getTierId(),
      customAmount: isCustom ? parseFloat(customAmount) : undefined,
      subscriberInfo: {
        email: email || undefined,
        phone: phone || undefined,
        emailOptIn,
        smsOptIn,
      },
    })
    return result
  }, [frequency, selectedAmount, isCustom, customAmount, email, phone, emailOptIn, smsOptIn])

  const handleDonate = () => {
    if (isCustom && (!customAmount || parseFloat(customAmount) < 1)) {
      alert('Please enter a valid amount (minimum $1)')
      return
    }
    setShowCheckout(true)
  }

  if (showCheckout) {
    return (
      <div className="w-full">
        <button
          onClick={() => setShowCheckout(false)}
          className="mb-4 text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back to donation options
        </button>
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ fetchClientSecret: startCheckoutSessionForDonation }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Frequency Toggle */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Frequency</Label>
        <div className="flex gap-2">
          <button
            onClick={() => setFrequency('one_time')}
            className={`flex-1 py-3 px-4 rounded-md border text-sm font-medium transition-all ${
              frequency === 'one_time'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-card-foreground border-border hover:border-primary/50'
            }`}
          >
            One Time
          </button>
          <button
            onClick={() => setFrequency('monthly')}
            className={`flex-1 py-3 px-4 rounded-md border text-sm font-medium transition-all ${
              frequency === 'monthly'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-card-foreground border-border hover:border-primary/50'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Amount Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Amount</Label>
        <div className="grid grid-cols-3 gap-2">
          {amounts.map((amount) => (
            <button
              key={amount}
              onClick={() => {
                setSelectedAmount(amount)
                setIsCustom(false)
              }}
              className={`py-3 px-4 rounded-md border text-sm font-medium transition-all ${
                selectedAmount === amount && !isCustom
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-card-foreground border-border hover:border-primary/50'
              }`}
            >
              ${amount}
            </button>
          ))}
          <button
            onClick={() => setIsCustom(true)}
            className={`py-3 px-4 rounded-md border text-sm font-medium transition-all ${
              isCustom
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-card-foreground border-border hover:border-primary/50'
            }`}
          >
            Other
          </button>
        </div>
        
        {isCustom && (
          <div className="mt-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="number"
                min="1"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>
        )}
      </div>

      {/* Contact Info & Subscription */}
      <div className="space-y-4 pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">Stay connected with Kollel updates (optional)</p>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="email" className="text-sm text-foreground">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="phone" className="text-sm text-foreground">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="emailOptIn"
              checked={emailOptIn}
              onCheckedChange={(checked) => setEmailOptIn(checked === true)}
              className="mt-0.5"
            />
            <Label htmlFor="emailOptIn" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
              Subscribe to email updates about Kollel news, events, and Torah insights
            </Label>
          </div>
          
          <div className="flex items-start gap-3">
            <Checkbox
              id="smsOptIn"
              checked={smsOptIn}
              onCheckedChange={(checked) => setSmsOptIn(checked === true)}
              className="mt-0.5"
            />
            <div>
              <Label htmlFor="smsOptIn" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                I agree to receive text message updates from Kollel Ohr Moshe
              </Label>
            </div>
          </div>
          
          {/* SMS Disclosure - Required for Compliance */}
          {smsOptIn && (
            <div className="p-3 bg-muted/50 rounded-md border border-border text-xs text-muted-foreground space-y-2">
              <p>
                <strong>SMS Terms:</strong> By checking the box above, you consent to receive recurring 
                automated promotional and informational text messages from Kollel Ohr Moshe at the phone 
                number provided. Message frequency varies (approximately 2-4 messages per month).
              </p>
              <p>
                <strong>Msg & Data rates may apply.</strong> Message and data rates may apply depending 
                on your mobile carrier plan.
              </p>
              <p>
                <strong>Opt-Out:</strong> You can opt out at any time by replying STOP to any message. 
                After opting out, you will receive one final confirmation message.
              </p>
              <p>
                <strong>Help:</strong> For assistance, reply HELP to any message or contact us at{' '}
                <a href="mailto:amit@kollelohrmoshe.com" className="text-primary hover:underline">
                  amit@kollelohrmoshe.com
                </a>
              </p>
              <p>
                Consent is not a condition of purchase. View our{' '}
                <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
                {' '}and{' '}
                <a href="/terms" className="text-primary hover:underline">Terms & Conditions</a>.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Donate Button */}
      <Button
        onClick={handleDonate}
        className="w-full py-6 text-base font-semibold bg-primary hover:bg-primary/90"
      >
        Donate {isCustom ? (customAmount ? `$${customAmount}` : '') : `$${selectedAmount}`}
        {frequency === 'monthly' ? '/month' : ''}
      </Button>
    </div>
  )
}
