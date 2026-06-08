"use client"

import { useState } from "react"
import { createCheckoutSession, createOneTimeCheckout } from "@/app/actions/stripe"
import { SUBSCRIPTION_TIERS } from "@/lib/products"
import { ConsentModal } from "./consent-modal"

const CUSTOM_PRICE_PER_ENTRY = 42
const ONE_TIME_PRICE = 42

export function DonationTiers() {
  return (
    <>
      {/* Monthly Plans — green band */}
      <section className="py-16 md:py-20 px-5 lg:px-0 bg-teal text-cream" id="donate">
        <div className="w-full max-w-[1180px] mx-auto">
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

          <p className="text-center text-cream/70 mt-6 text-sm">
            Cancel anytime · All donations are tax-deductible · Kollel Ohr Moshe is a 501(c)(3) organization
          </p>
        </div>
      </section>

      {/* One-Time + Custom — cream band */}
      <section className="py-16 md:py-20 px-5 lg:px-0 bg-cream">
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
                Try Your Luck
              </h2>
              <p className="text-muted-foreground text-[1.02rem] leading-relaxed">
                Not ready to commit monthly? Make a one-time ${ONE_TIME_PRICE} donation and get entered into this
                month&apos;s drawing — or choose a custom amount at ${CUSTOM_PRICE_PER_ENTRY} per entry.
              </p>
              <CustomAmount />
            </div>

            <OneTimeCard />
          </div>
        </div>
      </section>
    </>
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
  bestValue = false,
}: {
  tierId: string
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
        <div className="text-base text-cream/75 mt-1">
          {entries} {entries === 1 ? "Entry" : "Entries"}
        </div>
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
        planDetails={{ entries, price, isOneTime: false }}
      />
    </>
  )
}

function OneTimeCard() {
  const [loading, setLoading] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)

  const handleOneTime = async (consent: { email: boolean; sms: boolean }) => {
    setLoading(true)
    try {
      const { url } = await createOneTimeCheckout(consent)
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
      <div className="rounded-[28px] bg-teal text-cream p-8 text-center">
        <div className="text-cream/80">1 Entry</div>
        <div className="font-heading text-[3.4rem] leading-none my-1 text-gold2">${ONE_TIME_PRICE}</div>
        <p className="text-cream/70 text-sm">one-time</p>
        <p className="text-cream/80 text-sm my-3">Single entry into this month&apos;s watch drawing</p>
        <button
          onClick={() => setShowConsentModal(true)}
          disabled={loading}
          className="w-full rounded-full px-4 py-3 text-sm font-bold text-teal2 transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          style={{
            background: "linear-gradient(135deg, var(--gold), var(--gold2))",
            boxShadow: "0 12px 30px rgba(200,155,92,0.32)",
          }}
        >
          {loading ? "Processing..." : "Donate Now"}
        </button>
      </div>

      <ConsentModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onSubmit={handleOneTime}
        planDetails={{ entries: 1, price: ONE_TIME_PRICE, isOneTime: true }}
      />
    </>
  )
}

function CustomAmount() {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)

  const numericAmount = parseFloat(amount) || 0
  const entries = Math.floor(numericAmount / CUSTOM_PRICE_PER_ENTRY)
  const chargeAmount = entries * CUSTOM_PRICE_PER_ENTRY
  const isValid = entries >= 1

  const handleDonate = async (consent: { email: boolean; sms: boolean }) => {
    setLoading(true)
    try {
      const { url } = await createOneTimeCheckout(consent, chargeAmount * 100)
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
    <div className="mt-6 max-w-[360px]">
      <label className="text-[0.7rem] font-extrabold tracking-[0.16em] uppercase text-gold block mb-2">
        Custom Amount
      </label>
      <div className="flex gap-2.5">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold font-heading text-lg">$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="w-full bg-white border border-teal/20 rounded-full text-text font-heading text-xl py-2.5 pl-8 pr-4 placeholder:text-text/30 placeholder:text-base placeholder:font-sans focus:outline-none focus:border-gold transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
          {loading ? "..." : "Donate"}
        </button>
      </div>
      <p className="text-muted-foreground text-xs mt-2">
        ${CUSTOM_PRICE_PER_ENTRY} per entry.{" "}
        {isValid && (
          <span className="text-teal font-semibold">
            {entries} {entries === 1 ? "entry" : "entries"} for ${chargeAmount}
          </span>
        )}
      </p>

      <ConsentModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onSubmit={handleDonate}
        planDetails={{ entries, price: chargeAmount, isOneTime: true }}
      />
    </div>
  )
}
