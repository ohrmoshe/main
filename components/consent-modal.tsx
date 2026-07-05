"use client"

import { useState } from "react"
import { X } from "lucide-react"

interface ConsentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (consent: { email: boolean; sms: boolean }) => void
  planDetails: {
    entries: number
    price: number
    isOneTime?: boolean
  }
}

export function ConsentModal({ isOpen, onClose, onSubmit, planDetails }: ConsentModalProps) {
  const [emailConsent, setEmailConsent] = useState(false)
  const [smsConsent, setSmsConsent] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = () => {
    setLoading(true)
    onSubmit({ email: emailConsent, sms: smsConsent })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-cream border border-gold/30 p-8 max-w-md w-full mx-4 shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-teal/50 hover:text-teal transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="text-[0.6rem] tracking-[0.4em] uppercase text-gold mb-2">
            {planDetails.isOneTime ? "One-Time Donation" : "Monthly Subscription"}
          </div>
          <div className="font-heading text-3xl text-teal">
            {planDetails.entries} {planDetails.entries === 1 ? "Entry" : "Entries"}
          </div>
          <div className="text-sm text-teal/60 mt-1">
            ${planDetails.price}{planDetails.isOneTime ? "" : "/month"}
          </div>
        </div>

        <div className="border-t border-teal/10 pt-6">
          <p className="text-sm text-teal/70 mb-4">
            Stay connected with Watch &amp; Learn and Kollel Ohr Moshe:
          </p>

          <label className="flex items-start gap-3 mb-4 cursor-pointer group">
            <input
              type="checkbox"
              checked={emailConsent}
              onChange={(e) => setEmailConsent(e.target.checked)}
              className="mt-1 w-4 h-4 accent-gold cursor-pointer"
            />
            <span className="text-sm text-teal/80 leading-relaxed">
              I agree to receive email updates about raffle results, new watch announcements, and Kollel news.
            </span>
          </label>

          <label className="flex items-start gap-3 mb-6 cursor-pointer group">
            <input
              type="checkbox"
              checked={smsConsent}
              onChange={(e) => setSmsConsent(e.target.checked)}
              className="mt-1 w-4 h-4 accent-gold cursor-pointer"
            />
            <span className="text-sm text-teal/80 leading-relaxed">
              I agree to receive SMS/text message updates about raffle results and important announcements. Message and data rates may apply.
            </span>
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 bg-teal text-gold text-[0.65rem] tracking-[0.3em] uppercase transition-all hover:bg-teal2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Continue to Payment"}
        </button>

        <p className="text-[0.6rem] text-teal/40 text-center mt-4 leading-relaxed">
          You can unsubscribe from communications at any time. View our{" "}
          <a href="/privacy" className="text-gold hover:underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}
