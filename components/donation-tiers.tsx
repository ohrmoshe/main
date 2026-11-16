"use client"

import { useState, useEffect } from "react"
import { createCheckoutSession } from "@/app/actions/stripe"
import { SUBSCRIPTION_TIERS, WHEEL_MAX } from "@/lib/products"
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

type EntryChoice = "monthly" | "one-time"

const ENTRY_CHOICES: { value: EntryChoice; label: string; detail: string }[] = [
  { value: "monthly", label: "Monthly Entry", detail: `From $${SUBSCRIPTION_TIERS[0].priceInCents / 100}/mo` },
  { value: "one-time", label: "One-Time Entry", detail: `$1–$${WHEEL_MAX}` },
]

function entryChoiceForHash(hash: string): EntryChoice | null {
  if (hash === "#prize-wheel") return "one-time"
  if (hash === "#donate") return "monthly"
  return null
}

// Phones are too narrow to show the tiers and the wheel next to each other, so
// below md only the chosen one is shown. Links to #donate / #prize-wheel
// anywhere on the page (hero buttons, navbar, sticky button) pick the matching
// option; a document listener is used because next/link hash navigation does
// not fire `hashchange`.
function useEntryChoice() {
  const [choice, setChoice] = useState<EntryChoice>("monthly")
  useEffect(() => {
    const initial = entryChoiceForHash(window.location.hash)
    if (initial) setChoice(initial)

    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return
      const link = event.target.closest("a[href*='#']")
      if (!(link instanceof HTMLAnchorElement)) return
      const next = entryChoiceForHash(link.hash)
      if (next) setChoice(next)
    }
    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [])
  return [choice, setChoice] as const
}

function EntryChoiceSwitch({
  choice,
  onChange,
}: {
  choice: EntryChoice
  onChange: (choice: EntryChoice) => void
}) {
  return (
    <div
      role="group"
      aria-label="Choose how to enter"
      className="md:hidden grid grid-cols-2 gap-1.5 rounded-[26px] border border-cream/15 bg-cream/[0.08] p-1.5 mb-7"
    >
      {ENTRY_CHOICES.map((option) => {
        const selected = option.value === choice
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-[20px] px-2 py-3 text-center transition-colors ${
              selected ? "text-teal2" : "text-cream"
            }`}
            style={selected ? { background: "linear-gradient(135deg, var(--gold), var(--gold2))" } : undefined}
          >
            <span className="text-xs font-extrabold uppercase tracking-[0.1em]">{option.label}</span>
            <span className={`font-heading text-xl leading-tight ${selected ? "" : "text-gold2"}`}>
              {option.detail}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function DonationTiers() {
  const dealActive = useDealActive()
  const [choice, setChoice] = useEntryChoice()
  const showMonthly = choice === "monthly"
  return (
    <>
      {/* Monthly plans and the one-time prize wheel share one green band. From
          md up they sit side by side, and the subgrid rows line the two
          headings up and start the tiers and the wheel at the same height.
          Below md the switch shows one of them at a time. */}
      <section className="py-16 md:py-20 px-5 lg:px-0 bg-teal text-cream" id="donate">
        <div className="w-full max-w-[1180px] mx-auto">
          <DealBanner />

          {/* #prize-wheel sits on this always-visible wrapper so the jump works
              on phones even while the wheel panel itself is hidden. */}
          <div id="prize-wheel" className="scroll-mt-24">
          <EntryChoiceSwitch choice={choice} onChange={setChoice} />

          <div className="grid grid-cols-1 md:grid-cols-[1.15fr_1fr] gap-x-6 gap-y-7">
            <div
              className={`min-w-0 grid-cols-1 gap-y-7 md:col-start-1 md:row-start-1 md:row-span-2 md:grid-rows-subgrid ${
                showMonthly ? "grid" : "hidden md:grid"
              }`}
            >
              <div className="text-center md:text-left md:pt-5 lg:pt-7">
                <div className="text-[0.76rem] font-extrabold tracking-[0.16em] uppercase text-gold mb-2.5">
                  Monthly Entry
                </div>
                <h2 className="font-heading text-[clamp(2rem,3.5vw,3rem)] font-light leading-none tracking-[-0.035em] mb-3">
                  Monthly Donation Plans
                </h2>
                <p className="text-cream/75 text-[1.02rem] leading-relaxed">
                  Join our monthly giving program and automatically enter every drawing. The more you give, the more
                  you save.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 auto-rows-fr gap-4">
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
            </div>

            <div className={`min-w-0 md:col-span-2 md:row-start-3 ${showMonthly ? "" : "hidden md:block"}`}>
              <MonthlyCustomAmount />

              <p className="text-center text-cream/70 mt-6 text-sm">
                Cancel anytime · All donations are subject to partial tax deduction · Kollel Ohr Moshe is a 501(c)(3) organization
              </p>
            </div>

            <div
              className={`min-w-0 grid-cols-1 gap-y-7 rounded-[28px] p-5 lg:p-7 shadow-[0_24px_70px_rgba(18,54,54,0.16)] md:col-start-2 md:row-start-1 md:row-span-2 md:grid-rows-subgrid ${
                showMonthly ? "hidden md:grid" : "grid"
              }`}
              style={{ background: "linear-gradient(135deg, #fff8ed, #efe3d2)" }}
            >
              <div>
                <div className="text-[0.76rem] font-extrabold tracking-[0.16em] uppercase text-gold mb-2.5">
                  One-Time Entry
                </div>
                <h2 className="font-heading text-[clamp(2rem,3.5vw,3rem)] font-light text-foreground leading-none mb-3">
                  Spin the Prize Wheel
                </h2>
                <p className="text-muted-foreground text-[1.02rem] leading-relaxed">
                  Not ready to commit monthly? Pre-authorize your card, give the wheel a spin, and get charged the
                  exact amount it lands on — from $1 to 299 max.{" "}
                  {dealActive && (
                    <span className="font-semibold text-gold">
                      Today only, every spin is 50% off — you pay half of whatever it lands on.
                    </span>
                  )}{" "}
                  Every spin earns you one entry into this month&apos;s drawing.
                </p>
              </div>

              <PrizeWheel />
            </div>
          </div>
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
  // First month is 50% off during the deal; entries are unchanged.
  const firstMonthPrice = dealActive ? Math.round(price * 50) / 100 : price

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
        className={`relative rounded-[28px] p-6 md:p-5 xl:p-6 min-h-[310px] flex flex-col border ${
          featured ? "bg-cream/[0.14] border-gold" : "bg-cream/[0.08] border-cream/15"
        }`}
      >
        {(featured || bestValue) && (
          <div className="absolute -top-3 left-5.5 bg-gold text-teal2 text-xs font-extrabold rounded-full px-2.5 py-1.5">
            {featured ? "Most Popular" : "Best Value"}
          </div>
        )}
        {dealActive ? (
          <div className="text-[0.78rem] font-extrabold uppercase tracking-wide bg-gold text-teal2 rounded-full px-2 py-0.5 self-start">
            50% Off 1st Month
          </div>
        ) : (
          savings && <div className="text-[0.78rem] font-extrabold text-gold2">Save {savings}</div>
        )}
        <div className="font-heading text-[1.35rem] text-gold2 leading-tight mt-1">{label}</div>
        <div className="text-base text-cream/75 mt-0.5">
          {entries} {entries === 1 ? "Entry" : "Entries"}
        </div>
        {dealActive ? (
          <div className="my-2.5">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-heading text-[3.4rem] md:text-[3rem] xl:text-[3.4rem] leading-none text-gold2">
                ${firstMonthPrice}
              </span>
              <span className="font-heading text-2xl text-cream/45 line-through decoration-2">${price}</span>
            </div>
            <div className="text-cream/70 text-sm font-semibold mt-0.5">
              first month, then ${price}/month
            </div>
          </div>
        ) : (
          <div className="font-heading text-[3.4rem] md:text-[3rem] xl:text-[3.4rem] leading-none my-2.5">
            ${price}
            <small className="font-heading text-base">/month</small>
          </div>
        )}
        <div className="text-cream/70 font-bold mb-3.5">${perEntry}/entry</div>
        <p className="text-cream/80 text-[0.94rem] mb-4">{description}</p>
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
        planDetails={{ entries, price: firstMonthPrice, isOneTime: false, context: tierId, fullMonthlyPrice: price }}
        donorsFundPlan={{ kind: "tier", tierId }}
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
  // Charge the full amount entered; entries = amount ÷ 20 (rounded down).
  // During the deal the FIRST month is 50% off (entries are unchanged).
  const chargeAmount = numericAmount
  const firstMonthCharge = dealActive ? Math.round(chargeAmount * 50) / 100 : chargeAmount
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
    <div className="rounded-[28px] bg-cream/[0.08] border border-cream/15 p-6 md:p-7 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
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
              {entries} entries —{" "}
              <span className="text-gold2">${firstMonthCharge} first month</span>{" "}
              <span className="text-cream/50 line-through decoration-2">${chargeAmount}</span>, then ${chargeAmount}
              /month
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
        planDetails={{
          entries,
          price: firstMonthCharge,
          isOneTime: false,
          context: "monthly-custom",
          fullMonthlyPrice: chargeAmount,
        }}
        donorsFundPlan={{ kind: "custom", amountCents: Math.round(chargeAmount * 100) }}
      />
    </div>
  )
}

