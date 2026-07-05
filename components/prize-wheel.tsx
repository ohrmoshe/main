"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import {
  getWheelStatus,
  createWheelSetupIntent,
  spinAndCharge,
} from "@/app/actions/wheel"
import { WHEEL_MAX } from "@/lib/products"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const SPIN_DURATION = 20000 // matches the reels' staggered stop (last reel ~19.6s)

type Donor = { name: string; email: string; phone: string }
type Consent = { email: boolean; sms: boolean }

export function PrizeWheel() {
  const [status, setStatus] = useState<{ available: number; soldOut: boolean } | null>(null)
  const [phase, setPhase] = useState<"form" | "card">("form")
  const [donor, setDonor] = useState<Donor>({ name: "", email: "", phone: "" })
  const [consent, setConsent] = useState<Consent>({ email: false, sms: false })
  const [authorized, setAuthorized] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getWheelStatus().then((s) => setStatus({ available: s.available, soldOut: s.soldOut }))
  }, [])

  const handleContinue = async () => {
    setError(null)
    if (!donor.name.trim() || !donor.email.trim()) {
      setError("Please enter your name and email.")
      return
    }
    if (!authorized) {
      setError("Please authorize the charge to continue.")
      return
    }
    setLoading(true)
    try {
      const { clientSecret, customerId } = await createWheelSetupIntent({
        name: donor.name,
        email: donor.email,
        phone: donor.phone,
      })
      setClientSecret(clientSecret)
      setCustomerId(customerId)
      setPhase("card")
    } catch (e) {
      console.error(e)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (status === null) {
    return (
      <div className="rounded-[28px] bg-teal text-cream p-8 text-center min-h-[420px] flex items-center justify-center">
        <p className="text-cream/70">Loading the wheel…</p>
      </div>
    )
  }

  if (status.soldOut) {
    return (
      <div className="rounded-[28px] bg-teal text-cream p-8 text-center min-h-[420px] flex flex-col items-center justify-center gap-4">
        <WheelDial spinning={false} displayNumber={WHEEL_MAX} />
        <h3 className="font-heading text-2xl text-gold2">All {WHEEL_MAX} Spots Claimed!</h3>
        <p className="text-cream/75 text-sm max-w-xs">
          Every prize-wheel number has been taken. You can still enter every drawing with a monthly plan above.
        </p>
        <a
          href="#donate"
          className="rounded-full px-6 py-3 text-sm font-bold text-teal2"
          style={{ background: "linear-gradient(135deg, var(--gold), var(--gold2))" }}
        >
          See Monthly Plans
        </a>
      </div>
    )
  }

  return (
    <div className="rounded-[28px] bg-teal text-cream p-7 md:p-8">
      <div className="text-center mb-5">
        <div className="text-[0.7rem] font-extrabold tracking-[0.2em] uppercase text-gold">
          Spin to Donate
        </div>
        <h3 className="font-heading text-[1.8rem] leading-tight text-gold2 mt-1">The Prize Wheel</h3>

        {/* Big tickets-remaining counter */}
        <TicketsRemaining available={status.available} />
      </div>

      {phase === "form" && (
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Full name"
            value={donor.name}
            onChange={(e) => setDonor({ ...donor, name: e.target.value })}
            className="w-full bg-cream/[0.1] border border-cream/25 rounded-xl text-cream py-3 px-4 placeholder:text-cream/40 focus:outline-none focus:border-gold transition-colors"
          />
          <input
            type="email"
            placeholder="Email"
            value={donor.email}
            onChange={(e) => setDonor({ ...donor, email: e.target.value })}
            className="w-full bg-cream/[0.1] border border-cream/25 rounded-xl text-cream py-3 px-4 placeholder:text-cream/40 focus:outline-none focus:border-gold transition-colors"
          />
          <input
            type="tel"
            placeholder="Phone (optional)"
            value={donor.phone}
            onChange={(e) => setDonor({ ...donor, phone: e.target.value })}
            className="w-full bg-cream/[0.1] border border-cream/25 rounded-xl text-cream py-3 px-4 placeholder:text-cream/40 focus:outline-none focus:border-gold transition-colors"
          />

          <label className="flex items-start gap-3 cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={authorized}
              onChange={(e) => setAuthorized(e.target.checked)}
              className="mt-1 w-4 h-4 accent-gold cursor-pointer"
            />
            <span className="text-xs text-cream/80 leading-relaxed">
              I authorize my card to be charged the dollar amount the wheel lands on, between $1 and ${WHEEL_MAX}.
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consent.email}
              onChange={(e) => setConsent({ ...consent, email: e.target.checked })}
              className="mt-1 w-4 h-4 accent-gold cursor-pointer"
            />
            <span className="text-xs text-cream/70 leading-relaxed">
              Email me raffle results, new watch announcements, and Kollel news.
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consent.sms}
              onChange={(e) => setConsent({ ...consent, sms: e.target.checked })}
              className="mt-1 w-4 h-4 accent-gold cursor-pointer"
            />
            <span className="text-xs text-cream/70 leading-relaxed">
              Text me raffle results and announcements. Msg &amp; data rates may apply.
            </span>
          </label>

          {error && <p className="text-gold2 text-sm font-semibold">{error}</p>}

          <button
            onClick={handleContinue}
            disabled={loading}
            className="mt-1 w-full rounded-full px-4 py-3.5 text-sm font-bold text-teal2 transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            style={{
              background: "linear-gradient(135deg, var(--gold), var(--gold2))",
              boxShadow: "0 12px 30px rgba(200,155,92,0.32)",
            }}
          >
            {loading ? "Preparing…" : "Continue to Card"}
          </button>
        </div>
      )}

      {phase === "card" && clientSecret && customerId && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: { theme: "night", variables: { colorPrimary: "#c89b5c" } },
          }}
        >
          <SpinForm
            donor={donor}
            consent={consent}
            customerId={customerId}
            onCharged={() =>
              setStatus((prev) =>
                prev ? { available: Math.max(0, prev.available - 1), soldOut: prev.available - 1 <= 0 } : prev,
              )
            }
          />
        </Elements>
      )}
    </div>
  )
}

function TicketsRemaining({ available }: { available: number }) {
  return (
    <div className="mt-4 flex flex-col items-center">
      <div
        className="font-heading text-[clamp(3.5rem,9vw,5.5rem)] leading-none text-gold2 tabular-nums"
        style={{ textShadow: "0 4px 24px rgba(200,155,92,0.35)" }}
      >
        {available}
      </div>
      <div className="text-[0.72rem] font-extrabold tracking-[0.22em] uppercase text-gold -mt-1">
        Tickets Remaining
      </div>
      <div className="text-cream/55 text-xs mt-1">of {WHEEL_MAX} · land on a number from $1–${WHEEL_MAX}</div>
    </div>
  )
}

function SpinForm({
  donor,
  consent,
  customerId,
  onCharged,
}: {
  donor: Donor
  consent: Consent
  customerId: string
  onCharged: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [spinning, setSpinning] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [displayNumber, setDisplayNumber] = useState(1)
  const [result, setResult] = useState<{ number: number; amount: number } | null>(null)
  const [soldOut, setSoldOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // The reels self-animate (CSS) to the digits of `target`. We just set the
  // target, let the reels roll for SPIN_DURATION, then resolve.
  const runSpinAnimation = useCallback(
    (target: number) =>
      new Promise<void>((resolve) => {
        setDisplayNumber(target)
        setTimeout(resolve, SPIN_DURATION)
      }),
    [],
  )

  const handleSpin = async () => {
    if (!stripe || !elements) return
    setError(null)
    setVerifying(true)

    try {
      // Confirm the card first (saves payment method, handles any 3DS up front).
      const { error: setupError, setupIntent } = await stripe.confirmSetup({
        elements,
        redirect: "if_required",
      })
      if (setupError || !setupIntent?.payment_method) {
        setVerifying(false)
        setError(setupError?.message || "Card could not be verified. Please try again.")
        return
      }

      const paymentMethodId =
        typeof setupIntent.payment_method === "string"
          ? setupIntent.payment_method
          : setupIntent.payment_method.id

      // Reserve a number and charge the card.
      const res = await spinAndCharge({
        customerId,
        paymentMethodId,
        name: donor.name,
        email: donor.email,
        phone: donor.phone,
        consent,
      })

      setVerifying(false)

      if (res.soldOut) {
        setSoldOut(true)
        return
      }

      // Charge succeeded and a number is reserved -> decrement the live counter.
      onCharged()

      // Now run the full 15s spin that lands on the reserved number.
      setSpinning(true)
      await runSpinAnimation(res.number)
      setResult({ number: res.number, amount: res.amount })
      setSpinning(false)
    } catch (e) {
      setVerifying(false)
      setSpinning(false)
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.")
    }
  }

  if (soldOut) {
    return (
      <div className="text-center flex flex-col items-center gap-3 py-4">
        <WheelDial spinning={false} displayNumber={WHEEL_MAX} />
        <h4 className="font-heading text-xl text-gold2">Just Sold Out!</h4>
        <p className="text-cream/75 text-sm max-w-xs">
          The last number was claimed moments ago. Your card was not charged. Try a monthly plan above to enter every
          drawing.
        </p>
      </div>
    )
  }

  if (result) {
    return (
      <div className="text-center flex flex-col items-center gap-3 py-2">
        <WheelDial spinning={false} displayNumber={result.number} landed />
        <h4 className="font-heading text-2xl text-gold2">You landed on #{result.number}!</h4>
        <p className="text-cream/85 text-sm">
          Your card was charged <strong className="text-gold2">${result.amount}</strong> and you have{" "}
          <strong className="text-gold2">1 entry</strong> in this month&apos;s drawing. Good luck!
        </p>
        <div className="mt-2 rounded-xl bg-teal2/60 border border-gold/25 p-4 text-left w-full">
          <p className="text-[0.7rem] font-extrabold tracking-[0.16em] uppercase text-gold mb-1">
            Join the live drawing
          </p>
          <p className="text-cream/80 text-xs leading-relaxed">
            Zoom Meeting ID: 834 637 5415 · Passcode: ohrmoshe. We also emailed you the full link.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
        <WheelDial spinning={spinning} displayNumber={displayNumber} />

      {!spinning && (
        <div className="w-full">
          <p className="text-[0.7rem] font-extrabold tracking-[0.16em] uppercase text-gold mb-2 text-center">
            Enter your card to spin
          </p>
          <PaymentElement />
        </div>
      )}

      {error && <p className="text-gold2 text-sm font-semibold text-center">{error}</p>}

      <button
        onClick={handleSpin}
        disabled={spinning || verifying || !stripe}
        className="w-full rounded-full px-4 py-3.5 text-sm font-bold text-teal2 transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
        style={{
          background: "linear-gradient(135deg, var(--gold), var(--gold2))",
          boxShadow: "0 12px 30px rgba(200,155,92,0.32)",
        }}
      >
        {verifying ? "Verifying card…" : spinning ? "Spinning…" : "Lock In Card & Spin"}
      </button>
      {!spinning && !verifying && (
        <p className="text-cream/55 text-[0.7rem] text-center leading-relaxed">
          Your card is charged automatically once the wheel stops, for the exact amount it lands on.
        </p>
      )}
    </div>
  )
}

// Slot-machine style number reels in the site palette: three dark-teal columns
// (hundreds, tens, ones), each with a gold selection band and cream digits that
// physically roll on a vertical strip. The hundreds reel only cycles 0-2 (max
// is 299); the other two cycle 0-9. Reels stop in a staggered sequence.
const REEL_NAVY = "#123636" // dark teal window (--teal2)
const REEL_BAND = "#c89b5c" // gold selection band (--gold)
const CELL_H = 60 // px per digit cell

// A single digit column that rolls a vertical strip of digits and lands on
// `digit`. `order` staggers the stop time so reels settle left-to-right.
function DigitReel({
  digit,
  max,
  spinning,
  order,
}: {
  digit: number
  max: number
  spinning: boolean
  order: number
}) {
  const cycle = max + 1
  const loops = 60 + order * 16
  const strip = useMemo(
    () => Array.from({ length: loops * cycle }, (_, i) => i % cycle),
    [loops, cycle],
  )
  // Land near the end of the strip so plenty of digits roll past first.
  const finalIndex = (loops - 2) * cycle + digit
  // translateY that centers a given strip index in the middle (row 1 of 3).
  const yFor = (index: number) => -(index * CELL_H) + CELL_H

  const [y, setY] = useState(() => yFor((loops - 2) * cycle + digit))
  const [durationMs, setDurationMs] = useState(0)

  useEffect(() => {
    if (spinning) {
      // Snap to the top instantly, then roll down to the final digit.
      setDurationMs(0)
      setY(yFor(digit))
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setDurationMs(15600 + order * 2000) // staggered: hundreds stop first (~19.6s last)
          setY(yFor(finalIndex))
        }),
      )
    } else {
      // Static: show the target digit immediately.
      setDurationMs(0)
      setY(yFor(finalIndex))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, digit])

  return (
    <div className="relative flex-1 overflow-hidden" style={{ height: CELL_H * 3 }}>
      {/* Rolling strip of digits (transparent; sits over the shared box + band) */}
      <div
        className="absolute left-0 right-0 top-0 flex flex-col items-center will-change-transform"
        style={{
          transform: `translateY(${y}px)`,
          transition: durationMs ? `transform ${durationMs}ms cubic-bezier(0.16,1,0.3,1)` : "none",
        }}
      >
        {strip.map((d, i) => (
          <span
            key={i}
            className="font-heading text-5xl text-white tabular-nums leading-none flex items-center justify-center"
            style={{ height: CELL_H, width: "100%" }}
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  )
}

function WheelDial({
  spinning,
  displayNumber,
  landed = false,
}: {
  spinning: boolean
  displayNumber: number
  landed?: boolean
}) {
  const hundreds = Math.floor(displayNumber / 100) % 10
  const tens = Math.floor(displayNumber / 10) % 10
  const ones = displayNumber % 10

  return (
    <div className="relative w-full max-w-[320px] mx-auto select-none">
      <div
        className={`relative overflow-hidden transition-all ${
          landed ? "shadow-[0_0_44px_rgba(200,155,92,0.55)] scale-[1.02]" : ""
        }`}
        style={{ height: CELL_H * 3, background: REEL_NAVY }}
      >
        {/* Single continuous periwinkle selection band (behind the digits) */}
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ height: CELL_H, background: REEL_BAND }}
        />

        {/* Three independently-rolling digit columns share the box + band */}
        <div className="absolute inset-0 flex items-stretch pl-10">
          <DigitReel digit={hundreds} max={2} spinning={spinning} order={0} />
          <DigitReel digit={tens} max={9} spinning={spinning} order={1} />
          <DigitReel digit={ones} max={9} spinning={spinning} order={2} />
        </div>

        {/* Top/bottom navy fade so neighbor digits recede softly */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(${REEL_NAVY}, transparent 34%, transparent 66%, ${REEL_NAVY})`,
          }}
        />

        {/* Dollar sign, inside the band on the left, on top of everything */}
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 font-heading text-4xl text-white leading-none pointer-events-none"
        >
          $
        </span>
      </div>
    </div>
  )
}
