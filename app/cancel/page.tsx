"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { requestCancelLink, lookupWithToken, cancelWithToken } from "@/app/actions/cancel"

type Donor = { name: string; email: string; entries: number; amount: number }
type Mode = "request" | "sent" | "manage" | "invalid" | "success"

export default function CancelPage() {
  const [email, setEmail] = useState("")
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [mode, setMode] = useState<Mode>("request")
  const [donor, setDonor] = useState<Donor | null>(null)

  // If the URL carries a magic-link token, validate it and show the manage view.
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token")
    if (!t) return
    setToken(t)
    setLoading(true)
    lookupWithToken(t)
      .then((res) => {
        if (res.valid && res.found && res.donor) {
          setDonor(res.donor)
          setMode("manage")
        } else {
          setMode("invalid")
        }
      })
      .catch(() => setMode("invalid"))
      .finally(() => setLoading(false))
  }, [])

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await requestCancelLink(email)
      setMode("sent")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!token) return
    setLoading(true)
    setError("")
    try {
      const res = await cancelWithToken(token)
      if (res.success) setMode("success")
      else setError(res.message || "Failed to cancel subscription.")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-teal flex items-center justify-center px-6 py-20">
      <div className="max-w-md w-full">
        {mode === "request" && (
          <>
            <h1 className="font-heading text-4xl text-cream text-center mb-4">Cancel Subscription</h1>
            <p className="text-foreground/60 text-center mb-8">
              Enter your email and we&apos;ll send you a secure link to manage or cancel your subscription.
            </p>
            <form onSubmit={handleRequest}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full bg-transparent border border-gold/30 text-cream px-4 py-3 mb-4 placeholder:text-foreground/40 focus:outline-none focus:border-gold transition-colors"
              />
              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 border border-gold bg-transparent text-gold2 text-xs tracking-[0.3em] uppercase transition-all hover:bg-gold hover:text-teal disabled:opacity-50"
              >
                {loading ? "Sending..." : "Email Me a Cancel Link"}
              </button>
            </form>
            <p className="text-center mt-8">
              <Link href="/" className="text-gold hover:text-gold2 text-sm">Return Home</Link>
            </p>
          </>
        )}

        {mode === "sent" && (
          <div className="text-center">
            <h1 className="font-heading text-4xl text-cream mb-4">Check Your Email</h1>
            <p className="text-foreground/60 mb-8">
              If that email has an active subscription, we&apos;ve sent a secure link to manage or cancel it. The link
              expires in 30 minutes.
            </p>
            <Link href="/" className="text-gold hover:text-gold2 text-sm">Return Home</Link>
          </div>
        )}

        {mode === "invalid" && (
          <div className="text-center">
            <h1 className="font-heading text-4xl text-cream mb-4">Link Expired</h1>
            <p className="text-foreground/60 mb-8">This link is invalid or has expired. Please request a new one.</p>
            <button
              onClick={() => {
                setMode("request")
                setError("")
              }}
              className="inline-block px-10 py-3 border border-gold text-gold2 text-xs tracking-[0.3em] uppercase transition-colors hover:bg-gold hover:text-teal"
            >
              Request a New Link
            </button>
          </div>
        )}

        {mode === "manage" && donor && (
          <>
            <h1 className="font-heading text-4xl text-cream text-center mb-4">Confirm Cancellation</h1>
            <p className="text-foreground/60 text-center mb-8">Are you sure you want to cancel your subscription?</p>
            <div className="bg-teal2 border border-gold/20 p-6 mb-8">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-foreground/50">Name</span><p className="text-cream">{donor.name}</p></div>
                <div><span className="text-foreground/50">Email</span><p className="text-cream">{donor.email}</p></div>
                <div><span className="text-foreground/50">Monthly Amount</span><p className="text-cream">${donor.amount}</p></div>
                <div><span className="text-foreground/50">Entries/Month</span><p className="text-cream">{donor.entries}</p></div>
              </div>
            </div>
            <p className="text-foreground/50 text-sm text-center mb-6">
              After cancellation, you will no longer be entered into future drawings.
            </p>
            {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
            <div className="flex gap-4">
              <Link
                href="/"
                className="flex-1 py-3 border border-gold/40 bg-transparent text-gold2 text-xs tracking-[0.2em] uppercase transition-all hover:border-gold text-center"
              >
                Keep It
              </Link>
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

        {mode === "success" && (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-8 border-2 border-gold rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-heading text-4xl text-cream mb-4">Subscription Cancelled</h1>
            <p className="text-foreground/60 mb-8">
              Your subscription has been cancelled successfully. We&apos;re sorry to see you go.
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
