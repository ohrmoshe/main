"use client"

import { useState } from "react"
import Link from "next/link"
import { lookupSubscription, cancelSubscription } from "@/app/actions/cancel"

export default function CancelPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"lookup" | "confirm" | "success">("lookup")
  const [error, setError] = useState("")
  const [donorInfo, setDonorInfo] = useState<{
    name: string
    email: string
    entries: number
    amount: number
  } | null>(null)

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await lookupSubscription(email)
      if (result.found && result.donor) {
        setDonorInfo(result.donor)
        setStep("confirm")
      } else {
        setError(result.message || "No subscription found.")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    setLoading(true)
    setError("")

    try {
      const result = await cancelSubscription(email)
      if (result.success) {
        setStep("success")
      } else {
        setError(result.message || "Failed to cancel subscription.")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-teal flex items-center justify-center px-6 py-20">
      <div className="max-w-md w-full">
        {step === "lookup" && (
          <>
            <h1 className="font-heading text-4xl text-cream text-center mb-4">
              Cancel Subscription
            </h1>
            <p className="text-foreground/60 text-center mb-8">
              Enter your email address to look up your subscription.
            </p>

            <form onSubmit={handleLookup}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full bg-transparent border border-gold/30 text-cream px-4 py-3 mb-4 placeholder:text-foreground/40 focus:outline-none focus:border-gold transition-colors"
              />

              {error && (
                <p className="text-red-400 text-sm mb-4">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 border border-gold bg-transparent text-gold2 text-xs tracking-[0.3em] uppercase transition-all hover:bg-gold hover:text-teal disabled:opacity-50"
              >
                {loading ? "Looking up..." : "Find My Subscription"}
              </button>
            </form>

            <p className="text-center mt-8">
              <Link href="/" className="text-gold hover:text-gold2 text-sm">
                Return Home
              </Link>
            </p>
          </>
        )}

        {step === "confirm" && donorInfo && (
          <>
            <h1 className="font-heading text-4xl text-cream text-center mb-4">
              Confirm Cancellation
            </h1>
            <p className="text-foreground/60 text-center mb-8">
              Are you sure you want to cancel your subscription?
            </p>

            <div className="bg-teal2 border border-gold/20 p-6 mb-8">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-foreground/50">Name</span>
                  <p className="text-cream">{donorInfo.name}</p>
                </div>
                <div>
                  <span className="text-foreground/50">Email</span>
                  <p className="text-cream">{donorInfo.email}</p>
                </div>
                <div>
                  <span className="text-foreground/50">Monthly Amount</span>
                  <p className="text-cream">${donorInfo.amount}</p>
                </div>
                <div>
                  <span className="text-foreground/50">Entries/Month</span>
                  <p className="text-cream">{donorInfo.entries}</p>
                </div>
              </div>
            </div>

            <p className="text-foreground/50 text-sm text-center mb-6">
              After cancellation, you will no longer be entered into future drawings.
            </p>

            {error && (
              <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setStep("lookup")}
                className="flex-1 py-3 border border-gold/40 bg-transparent text-gold2 text-xs tracking-[0.2em] uppercase transition-all hover:border-gold"
              >
                Go Back
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 py-3 border border-red-500/50 bg-transparent text-red-400 text-xs tracking-[0.2em] uppercase transition-all hover:bg-red-500/20 disabled:opacity-50"
              >
                {loading ? "Cancelling..." : "Cancel Subscription"}
              </button>
            </div>
          </>
        )}

        {step === "success" && (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-8 border-2 border-gold rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="font-heading text-4xl text-cream mb-4">
              Subscription Cancelled
            </h1>
            <p className="text-foreground/60 mb-8">
              Your subscription has been cancelled successfully. We&apos;re sorry to see you go.
            </p>

            <p className="text-foreground/50 text-sm mb-8">
              If you change your mind, you can always subscribe again from our homepage.
            </p>

            <Link
              href="/"
              className="inline-block px-12 py-4 border border-gold text-gold2 text-xs tracking-[0.35em] uppercase transition-colors hover:bg-gold hover:text-teal"
            >
              Return Home
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
