"use client"

import { useState, useEffect } from "react"
import { createCheckoutSession } from "@/app/actions/stripe"
import { SUBSCRIPTION_TIERS } from "@/lib/products"
import { isDealActive } from "@/lib/deal"
import { ConsentModal } from "./consent-modal"
import { DealBanner } from "./deal-banner"
import { PrizeWheel } from "./prize-wheel"

// Client-side hook: tracks whether the double-entry deal is currently active.
// Computed after mount (and re-checked each second) to avoid hydration mismatch.
function useDealActive() {
  const [active, setActive] = useState(false)
  useEffect(() => {
    const tick = () => setActive(isDealActive())
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])
  return active
}

const MONTHLY_CUSTOM_PRICE_PER_ENTRY = 20
const MONTHLY_CUSTOM_MIN_AMOUNT = 360

export function DonationTiers() {
  return (
    <>
      {/* Monthly Plans — green band */}
      <section className="py-16 md:py-20 px-5 lg:px-0 bg-teal text-cream" id="donate">
        <div className="w-full max-w-[1180px] mx-auto">
          <DealBanner />

          <div className="text-center max-w-[740px] mx-auto mb-10">
            <div className="text-[0.76rem] font-extrabold tracking-[0.16em] uppercase text-gold mb-2.5">
              Monthly Giving
            </div>
            <h2 className="font-heading text-[clamp(2.2rem,4vw,4rem)] font-light leading-none tracking-[-0.035em] mb-3.5">
              Monthly Donation Plans
            </h2>
            <p className="text-cream/75 text-[1.05rem]">
              Join our monthly giving program and automatically enter every drawing. The more you give, the more you
              save.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5 gap-y-5">
            {SUBSCRIPTION_TIERS.map((tier) => (
              <Tier
                key={tier.id}
                tierId={tier.id}
                label={tier.label}
                entries={tier.entries}
                price={tier.priceInCents / 100}
                perEntry={tier.pricePerEntry}
                description={tier.description}
                savings={tier.savings}
                featured={tier.featured}
                bestValue={tier.bestValue}
              />
            ))}
          </div>

          <MonthlyCustomAmount />

          <p className="text-center text-cream/70 mt-6 text-sm">
            Cancel anytime · All donations are subject to partial tax deduction · Kollel Ohr Moshe is a 501(c)(3) organization
          </p>
        </div>
      </section>

      {/* One-Time + Custom — cream band */}
      <section id="prize-wheel" className="py-16 md:py-20 px-5 lg:px-0 bg-cream">
        <div className="w-full max-w-[1180px] mx-auto">
          <div
            className="rounded-[34px] p-8 md:p-11 grid grid-cols-1 lg:grid-cols-[1.1fr_.9fr] gap-6 items-center shadow-[0_24px_70px_rgba(18,54,54,0.16)]"
            style={{ background: "linear-gradient(135deg, #fff8ed, #efe3d2)" }}
          >
            <div>
              <div className="text-[0.76rem] font-extrabold tracking-[0.16em] uppercase text-gold mb-2.5">
                One-Time Entry
              </div>
              <h2 className="font-heading text-[clamp(2rem,3.5vw,3rem)] font-light text-text leading-none mb-3">
                Spin the Prize Wheel
              </h2>
              <p className="text-muted-foreground text-[1.02rem] leading-relaxed">
                Not ready to commit monthly? Pre-authorize your card, give the wheel a spin, and get charged the
                exact amount it lands on — from $1 to 299 max. Every spin earns you one entry into this
                month&apos;s drawing.
              </p>
            </div>

            <PrizeWheel />
          </div>
        </div>
      </section>
    </>
  )
}

function Tier({
  tierId,
  label,
  entries,
  price,
  perEntry,
  description,
  featured = false,
  savings,
  bestValue = false,
}: {
  tierId: string
  label: string
  entries: number
  price: number
  perEntry: number
  description: string
  featured?: boolean
  savings?: string
  bestValue?: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const dealActive = useDealActive()
  const displayedEntries = dealActive ? entries * 2 : entries

  const handleSubscribe = async (consent: { email: boolean; sms: boolean }) => {
    setLoading(true)
    try {
      const { url } = await createCheckoutSession(tierId, undefined, consent)
      if (url) window.location.href = url
    } catch (error) {
      console.error("Checkout error:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
      setShowConsentModal(false)
    }
  }

  return (
    <>
      <article
        className={`relative rounded-[28px] p-6 min-h-[310px] flex flex-col border ${
          featured ? "bg-cream/[0.14] border-gold" : "bg-cream/[0.08] border-cream/15"
        }`}
      >
        {(featured || bestValue) && (
          <div className="absolute -top-3 left-5.5 bg-gold text-teal2 text-xs font-extrabold rounded-full px-2.5 py-1.5">
            {featured ? "Most Popular" : "Best Value"}
          </div>
        )}
        {savings && <div className="text-[0.78rem] font-extrabold text-gold2">Save {savings}</div>}
        <div className="font-heading text-[1.35rem] text-gold2 leading-tight mt-1">{label}</div>
        {dealActive ? (
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-base text-red-400 line-through decoration-2">
              {entries} {entries === 1 ? "Entry" : "Entries"}
            </span>
            <span className="text-base font-bold text-gold2">
              {displayedEntries} {displayedEntries === 1 ? "Entry" : "Entries"}
            </span>
            <span className="text-[0.62rem] font-extrabold uppercase tracking-wide bg-gold text-teal2 rounded-full px-1.5 py-0.5">
              2x
            </span>
          </div>
        ) : (
          <div className="text-base text-cream/75 mt-0.5">
            {entries} {entries === 1 ? "Entry" : "Entries"}
          </div>
        )}
        <div className="font-heading text-[3.4rem] leading-none my-2.5">
          ${price}
          <small className="font-heading text-base">/month</small>
        </div>
        <div className="text-cream/70 font-bold mb-3.5">${perEntry}/entry</div>
        <p className="text-cream/80 text-[0.94rem]">{description}</p>
        <button
          onClick={() => setShowConsentModal(true)}
          disabled={loading}
          className="mt-auto w-full rounded-full px-4 py-3 text-sm font-bold text-teal2 transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          style={{
            background: "linear-gradient(135deg, var(--gold), var(--gold2))",
            boxShadow: "0 12px 30px rgba(200,155,92,0.32)",
          }}
        >
          {loading ? "Processing..." : "Subscribe"}
        </button>
      </article>

      <ConsentModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onSubmit={handleSubscribe}
        planDetails={{ entries: displayedEntries, price, isOneTime: false }}
      />
    </>
  )
}

function MonthlyCustomAmount() {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)

  const dealActive = useDealActive()
  const numericAmount = parseFloat(amount) || 0
  const entries = Math.floor(numericAmount / MONTHLY_CUSTOM_PRICE_PER_ENTRY)
  const displayedEntries = dealActive ? entries * 2 : entries
  // Charge the full amount entered; entries = amount ÷ 20 (rounded down)
  const chargeAmount = numericAmount
  const isValid = numericAmount > MONTHLY_CUSTOM_MIN_AMOUNT && entries >= 1
  const showTooLow = numericAmount > 0 && numericAmount <= MONTHLY_CUSTOM_MIN_AMOUNT

  const handleSubscribe = async (consent: { email: boolean; sms: boolean }) => {
    setLoading(true)
    try {
      const { url } = await createCheckoutSession("custom", Math.round(chargeAmount * 100), consent)
      if (url) window.location.href = url
    } catch (error) {
      console.error("Checkout error:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
      setShowConsentModal(false)
    }
  }

  return (
    <div className="mt-7 rounded-[28px] bg-cream/[0.08] border border-cream/15 p-6 md:p-7 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
      <div className="flex-1">
        <div className="text-[0.72rem] font-extrabold tracking-[0.16em] uppercase text-gold mb-1.5">
          Custom Monthly Amount
        </div>
        <p className="text-cream/80 text-[0.96rem]">
          Give a custom monthly gift above ${MONTHLY_CUSTOM_MIN_AMOUNT} and earn an entry for every $
          {MONTHLY_CUSTOM_PRICE_PER_ENTRY} donated.
          {isValid && !dealActive && (
            <span className="text-gold2 font-semibold">
              {" "}
              {entries} entries for ${chargeAmount}/month
            </span>
          )}
          {isValid && dealActive && (
            <span className="font-semibold">
              {" "}
              <span className="text-red-400 line-through decoration-2">{entries} entries</span>{" "}
              <span className="text-gold2">{displayedEntries} entries</span> for ${chargeAmount}/month
            </span>
          )}
        </p>
        <p className="text-cream/65 text-sm mt-2.5">
          Want to do more? Sponsor a full learning session — $1,260 (First &amp; Second Seder) or $1,800 (Full Time)
        </p>
        {showTooLow && (
          <p className="text-gold2 text-sm font-semibold mt-2.5">Please select one of the tiers above</p>
        )}
      </div>
      <div className="flex gap-2.5 md:w-[360px]">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold font-heading text-lg">$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Over $360"
            className="w-full bg-cream/[0.1] border border-cream/25 rounded-full text-cream font-heading text-xl py-2.5 pl-8 pr-4 placeholder:text-cream/40 placeholder:text-base placeholder:font-sans focus:outline-none focus:border-gold transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <button
          onClick={() => isValid && setShowConsentModal(true)}
          disabled={loading || !isValid}
          className="rounded-full px-6 py-3 text-sm font-bold text-teal2 transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0 whitespace-nowrap"
          style={{
            background: "linear-gradient(135deg, var(--gold), var(--gold2))",
            boxShadow: "0 12px 30px rgba(200,155,92,0.32)",
          }}
        >
          {loading ? "..." : "Subscribe"}
        </button>
      </div>

      <ConsentModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onSubmit={handleSubscribe}
        planDetails={{ entries: displayedEntries, price: chargeAmount, isOneTime: false }}
      />
    </div>
  )
}

