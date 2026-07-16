"use client"

import { useState } from "react"
import { createOfferCheckoutSession } from "@/app/actions/offer"
import type { WinbackTier } from "@/lib/products"
import { ConsentModal } from "./consent-modal"

export function OfferTiers({ token, tiers }: { token: string; tiers: WinbackTier[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5 gap-y-5">
      {tiers.map((tier) => (
        <OfferTier key={tier.id} token={token} tier={tier} />
      ))}
    </div>
  )
}

function OfferTier({ token, tier }: { token: string; tier: WinbackTier }) {
  const [loading, setLoading] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)

  const price = tier.priceInCents / 100
  const originalPrice = tier.originalPriceInCents / 100
  const percentOff = Math.round((1 - tier.priceInCents / tier.originalPriceInCents) * 100)

  const handleSubscribe = async (consent: { email: boolean; sms: boolean }) => {
    setLoading(true)
    try {
      const { url } = await createOfferCheckoutSession(token, tier.id, consent)
      if (url) window.location.href = url
    } catch (error) {
      console.error("Checkout error:", error)
      alert(error instanceof Error ? error.message : "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
      setShowConsentModal(false)
    }
  }

  return (
    <>
      <article
        className={`relative rounded-[28px] p-6 min-h-[320px] flex flex-col border ${
          tier.featured ? "bg-cream/[0.14] border-gold" : "bg-cream/[0.08] border-cream/15"
        }`}
      >
        <div className="absolute -top-3 left-5.5 bg-gold text-teal2 text-xs font-extrabold rounded-full px-2.5 py-1.5">
          {percentOff}% Off
        </div>
        <div className="font-heading text-[1.35rem] text-gold2 leading-tight mt-1">{tier.label}</div>
        <div className="text-base text-cream/75 mt-0.5">
          {tier.entries} {tier.entries === 1 ? "Entry" : "Entries"}
        </div>
        <div className="flex items-baseline gap-2 my-2.5">
          <span className="font-heading text-[3.4rem] leading-none">
            ${price}
            <small className="font-heading text-base">/mo</small>
          </span>
        </div>
        <div className="flex items-center gap-2 mb-3.5">
          <span className="text-cream/50 line-through decoration-2">${originalPrice}/mo</span>
          <span className="text-gold2 font-bold text-sm">${tier.pricePerEntry}/entry</span>
        </div>
        <p className="text-cream/80 text-[0.94rem]">{tier.description}</p>
        <button
          onClick={() => setShowConsentModal(true)}
          disabled={loading}
          className="mt-auto w-full rounded-full px-4 py-3 text-sm font-bold text-teal2 transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          style={{
            background: "linear-gradient(135deg, var(--gold), var(--gold2))",
            boxShadow: "0 12px 30px rgba(200,155,92,0.32)",
          }}
        >
          {loading ? "Processing..." : "Keep My Subscription"}
        </button>
      </article>

      <ConsentModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onSubmit={handleSubscribe}
        planDetails={{ entries: tier.entries, price, isOneTime: false }}
      />
    </>
  )
}
