"use client"

import { useState } from "react"
import { createCheckoutSession, createOneTimeCheckout } from "@/app/actions/stripe"
import { SUBSCRIPTION_TIERS } from "@/lib/products"

export function DonationTiers() {
  return (
    <section className="py-24 px-6 lg:px-16 bg-gradient-to-br from-teal2 to-teal" id="donate">
      {/* One-Time Donation */}
      <div className="text-center max-w-[600px] mx-auto mb-16">
        <div className="text-[0.6rem] tracking-[0.5em] uppercase text-gold mb-3">One-Time Entry</div>
        <h2 className="font-heading text-[clamp(1.8rem,3.5vw,2.8rem)] font-light text-cream leading-[1.15] mb-6">
          Try Your Luck
        </h2>
        <p className="text-sm text-foreground/55 leading-[1.9] mb-8">
          Not ready to commit monthly? Make a one-time $36 donation and get entered into this month&apos;s drawing.
        </p>
        <OneTimeTier />
      </div>

      <div className="border-t border-gold/20 my-16" />

      {/* Monthly Plans */}
      <div className="text-center max-w-[600px] mx-auto">
        <div className="text-[0.6rem] tracking-[0.5em] uppercase text-gold mb-3">Monthly Giving</div>
        <h2 className="font-heading text-[clamp(2rem,4vw,3.2rem)] font-light text-cream leading-[1.15] mb-8">
          Monthly Donation Plans
        </h2>
        <p className="text-sm text-foreground/55 leading-[1.9]">
          Join our monthly giving program and automatically enter every drawing. The more you give, the more you save.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mt-14">
        {SUBSCRIPTION_TIERS.map((tier) => (
          <Tier
            key={tier.id}
            tierId={tier.id}
            entries={`${tier.entries} ${tier.entries === 1 ? "Entry" : "Entries"}`}
            price={tier.priceInCents / 100}
            perEntry={tier.pricePerEntry}
            description={tier.description}
            savings={tier.savings}
            featured={tier.featured}
            bestValue={tier.bestValue}
          />
        ))}
        <CustomTier />
      </div>
      
      <p className="text-center mt-8 text-xs text-foreground/40 tracking-[0.08em]">
        Cancel anytime · All donations are tax-deductible · Kollel Ohr Moshe is a 501(c)(3) organization
      </p>
    </section>
  )
}

function Tier({ 
  tierId,
  entries, 
  price, 
  perEntry,
  description, 
  featured = false,
  savings,
  bestValue = false
}: { 
  tierId: string
  entries: string
  price: number
  perEntry?: number
  description: string
  featured?: boolean
  savings?: string
  bestValue?: boolean
}) {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const { url } = await createCheckoutSession(tierId)
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error("Checkout error:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="relative p-8 border border-gold/30 text-center transition-all cursor-pointer hover:border-gold hover:-translate-y-1 bg-cream"
    >
      {featured && (
        <div className="absolute -top-px left-1/2 -translate-x-1/2 bg-gold text-teal text-[0.55rem] tracking-[0.3em] uppercase px-4 py-1 whitespace-nowrap">
          Most Popular
        </div>
      )}
      {bestValue && (
        <div className="absolute -top-px left-1/2 -translate-x-1/2 bg-gold text-teal text-[0.55rem] tracking-[0.3em] uppercase px-4 py-1 whitespace-nowrap">
          Best Value
        </div>
      )}
      {savings && (
        <div className="absolute top-3 right-3 bg-teal/90 text-gold text-[0.5rem] tracking-[0.15em] uppercase px-2 py-1 rounded">
          Save {savings}
        </div>
      )}
      
      <div className="text-[0.6rem] tracking-[0.4em] uppercase text-teal/70 mb-3">{entries}</div>
      <div className="font-heading text-4xl font-light text-teal leading-none">
        <sup className="text-base align-top mt-2 text-gold">$</sup>
        {price}
      </div>
      <div className="text-[0.6rem] tracking-[0.2em] uppercase text-teal/50 mt-1">/month</div>
      {perEntry && <div className="text-[0.55rem] tracking-[0.15em] text-gold mt-2">${perEntry}/entry</div>}
      <div className="text-xs text-teal/60 leading-[1.7] my-4">{description}</div>
      <button 
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full py-3 border border-teal/30 bg-teal text-gold text-[0.65rem] tracking-[0.3em] uppercase cursor-pointer transition-all hover:bg-teal2 hover:border-teal disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : "Subscribe"}
      </button>
    </div>
  )
}

function CustomTier() {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const PRICE_PER_ENTRY = 18
  
  const numericAmount = parseFloat(amount) || 0
  const exactEntries = numericAmount / PRICE_PER_ENTRY
  const roundDown = Math.floor(exactEntries)
  const roundUp = Math.ceil(exactEntries)
  
  const roundDownAmount = roundDown * PRICE_PER_ENTRY
  const roundUpAmount = roundUp * PRICE_PER_ENTRY
  
  const showOptions = numericAmount >= PRICE_PER_ENTRY && roundDown !== roundUp
  const showExact = numericAmount >= PRICE_PER_ENTRY && roundDown === roundUp && roundDown > 0

  const handleSubscribe = async (amountDollars: number) => {
    setLoading(true)
    try {
      const { url } = await createCheckoutSession("custom", amountDollars * 100)
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error("Checkout error:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="relative p-8 border border-dashed border-gold/50 text-center transition-all hover:border-gold bg-cream">
      <div className="text-[0.6rem] tracking-[0.4em] uppercase text-teal/70 mb-3">Custom Amount</div>
      
      <div className="relative mb-2">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold font-heading text-lg">$</span>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full bg-white border border-teal/20 text-teal font-heading text-2xl text-center py-3 pl-8 pr-4 placeholder:text-teal/30 placeholder:text-base focus:outline-none focus:border-gold transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
      <div className="text-[0.6rem] tracking-[0.2em] uppercase text-teal/50">/month</div>
      <div className="text-[0.55rem] tracking-[0.15em] text-gold mt-1">$18 per entry</div>
      
      {showOptions && (
        <div className="mt-4 space-y-2">
          <button 
            onClick={() => handleSubscribe(roundDownAmount)}
            disabled={loading}
            className="w-full py-3 border border-teal/30 bg-teal text-gold text-[0.6rem] tracking-[0.2em] uppercase cursor-pointer transition-all hover:bg-teal2 disabled:opacity-50"
          >
            {roundDown} entries — ${roundDownAmount}/mo
          </button>
          <button 
            onClick={() => handleSubscribe(roundUpAmount)}
            disabled={loading}
            className="w-full py-3 border border-teal/30 bg-teal text-gold text-[0.6rem] tracking-[0.2em] uppercase cursor-pointer transition-all hover:bg-teal2 disabled:opacity-50"
          >
            {roundUp} entries — ${roundUpAmount}/mo
          </button>
        </div>
      )}
      
      {showExact && (
        <div className="mt-4">
          <button 
            onClick={() => handleSubscribe(roundDownAmount)}
            disabled={loading}
            className="w-full py-3 border border-teal/30 bg-teal text-gold text-[0.6rem] tracking-[0.2em] uppercase cursor-pointer transition-all hover:bg-teal2 disabled:opacity-50"
          >
            {roundDown} entries — ${roundDownAmount}/mo
          </button>
        </div>
      )}
      
      {!showOptions && !showExact && (
        <div className="text-xs text-teal/50 leading-[1.7] mt-4">
          Enter your monthly budget and we&apos;ll show you the closest entry options.
        </div>
      )}
    </div>
  )
}

function OneTimeTier() {
  const [loading, setLoading] = useState(false)

  const handleOneTime = async () => {
    setLoading(true)
    try {
      const { url } = await createOneTimeCheckout()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error("Checkout error:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[320px] mx-auto p-8 border border-gold/40 bg-cream text-center">
      <div className="text-[0.6rem] tracking-[0.4em] uppercase text-teal/70 mb-3">1 Entry</div>
      <div className="font-heading text-5xl font-light text-teal leading-none">
        <sup className="text-lg align-top mt-2 text-gold">$</sup>
        36
      </div>
      <div className="text-[0.6rem] tracking-[0.2em] uppercase text-teal/50 mt-1">one-time</div>
      <div className="text-xs text-teal/60 leading-[1.7] my-4">
        Single entry into this month&apos;s watch drawing
      </div>
      <button 
        onClick={handleOneTime}
        disabled={loading}
        className="w-full py-3 border border-teal/30 bg-teal text-gold text-[0.65rem] tracking-[0.3em] uppercase cursor-pointer transition-all hover:bg-teal2 hover:border-teal disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : "Donate Now"}
      </button>
    </div>
  )
}
