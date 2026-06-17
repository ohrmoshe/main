"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import {
  getWheelStatus,
  createWheelSetupIntent,
  spinAndCharge,
} from "@/app/actions/wheel"
import { WHEEL_MAX } from "@/lib/products"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const SPIN_DURATION = 15000 // 15 seconds

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
      <div className="text-center mb-4">
        <div className="text-[0.7rem] font-extrabold tracking-[0.2em] uppercase text-gold">
          Spin to Donate
        </div>
        <h3 className="font-heading text-[1.8rem] leading-tight text-gold2 mt-1">The Prize Wheel</h3>
        <p className="text-cream/70 text-sm mt-1.5">
          {status.available} of {WHEEL_MAX} numbers left · land on a number from $1–${WHEEL_MAX}
        </p>
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
          <SpinForm donor={donor} consent={consent} customerId={customerId} />
        </Elements>
      )}
    </div>
  )
}

function SpinForm({
  donor,
  consent,
  customerId,
}: {
  donor: Donor
  consent: Consent
  customerId: string
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [spinning, setSpinning] = useState(false)
  const [displayNumber, setDisplayNumber] = useState(1)
  const [result, setResult] = useState<{ number: number; amount: number } | null>(null)
  const [soldOut, setSoldOut] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const flickerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopFlicker = useCallback(() => {
    if (flickerRef.current) {
      clearInterval(flickerRef.current)
      flickerRef.current = null
    }
  }, [])

  useEffect(() => () => stopFlicker(), [stopFlicker])

  const handleSpin = async () => {
    if (!stripe || !elements) return
    setError(null)
    setSpinning(true)

    // Start the visual flicker immediately
    flickerRef.current = setInterval(() => {
      setDisplayNumber(Math.floor(Math.random() * WHEEL_MAX) + 1)
    }, 60)
    const startTime = Date.now()

    try {
      // Confirm the card (saves payment method, handles any 3DS up front)
      const { error: setupError, setupIntent } = await stripe.confirmSetup({
        elements,
        redirect: "if_required",
      })
      if (setupError || !setupIntent?.payment_method) {
        stopFlicker()
        setSpinning(false)
        setError(setupError?.message || "Card could not be verified. Please try again.")
        return
      }

      const paymentMethodId =
        typeof setupIntent.payment_method === "string"
          ? setupIntent.payment_method
          : setupIntent.payment_method.id

      const res = await spinAndCharge({
        customerId,
        paymentMethodId,
        name: donor.name,
        email: donor.email,
        phone: donor.phone,
        consent,
      })

      // Keep the wheel spinning for the full dramatic duration
      const elapsed = Date.now() - startTime
      if (elapsed < SPIN_DURATION) {
        await new Promise((r) => setTimeout(r, SPIN_DURATION - elapsed))
      }
      stopFlicker()

      if (res.soldOut) {
        setSoldOut(true)
        setSpinning(false)
        return
      }

      setDisplayNumber(res.number)
      setResult({ number: res.number, amount: res.amount })
      setSpinning(false)
    } catch (e) {
      stopFlicker()
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
            Enter your card
          </p>
          <PaymentElement />
        </div>
      )}

      {error && <p className="text-gold2 text-sm font-semibold text-center">{error}</p>}

      <button
        onClick={handleSpin}
        disabled={spinning || !stripe}
        className="w-full rounded-full px-4 py-3.5 text-sm font-bold text-teal2 transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
        style={{
          background: "linear-gradient(135deg, var(--gold), var(--gold2))",
          boxShadow: "0 12px 30px rgba(200,155,92,0.32)",
        }}
      >
        {spinning ? "Spinning…" : "Lock In Card & Spin"}
      </button>
      {!spinning && (
        <p className="text-cream/55 text-[0.7rem] text-center leading-relaxed">
          Your card is charged automatically once the wheel stops, for the exact amount it lands on.
        </p>
      )}
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
  return (
    <div className="relative w-44 h-44 flex items-center justify-center">
      {/* Rotating outer ring */}
      <div
        className={`absolute inset-0 rounded-full ${spinning ? "animate-spin" : ""}`}
        style={{
          background: "conic-gradient(var(--gold), var(--gold2), var(--teal2), var(--gold))",
          animationDuration: "0.9s",
          maskImage: "radial-gradient(circle, transparent 60%, black 61%)",
          WebkitMaskImage: "radial-gradient(circle, transparent 60%, black 61%)",
        }}
      />
      {/* Pointer */}
      <div
        className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0"
        style={{
          borderLeft: "9px solid transparent",
          borderRight: "9px solid transparent",
          borderTop: "14px solid var(--gold)",
        }}
      />
      {/* Inner face */}
      <div
        className={`relative w-32 h-32 rounded-full bg-teal2 border-2 flex flex-col items-center justify-center transition-all ${
          landed ? "border-gold scale-105 shadow-[0_0_40px_rgba(200,155,92,0.5)]" : "border-gold/40"
        }`}
      >
        <span className="text-cream/55 text-xs font-bold">$</span>
        <span className="font-heading text-5xl leading-none text-gold2 tabular-nums">{displayNumber}</span>
      </div>
    </div>
  )
}
