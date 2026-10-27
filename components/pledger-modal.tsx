"use client"

import { useState, useTransition } from "react"
import { X, Lock, CheckCircle2 } from "lucide-react"
import { submitPledgerGrant, type PledgerResponse } from "@/app/actions/pledger"
import type { DonorsFundPlan } from "@/app/actions/donors-fund"

interface PledgerModalProps {
  isOpen: boolean
  onClose: () => void
  plan: DonorsFundPlan
  entries: number
  monthlyAmount: number
  consent: { email: boolean; sms: boolean }
}

const inputClass =
  "w-full bg-transparent border border-teal/25 px-3.5 py-3 text-teal text-base placeholder:text-teal/35 focus:outline-none focus:border-gold transition-colors"
const labelClass = "block text-[0.6rem] tracking-[0.3em] uppercase text-teal/60 mb-1.5"

function formatCard(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

export function PledgerModal({ isOpen, onClose, plan, entries, monthlyAmount, consent }: PledgerModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [expDate, setExpDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [result, setResult] = useState<PledgerResponse | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!isOpen) return null

  const handleClose = () => {
    setCvv("")
    setResult(null)
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setResult(null)
    startTransition(async () => {
      const response = await submitPledgerGrant({ plan, name, email, cardNumber, cvv, expDate, consent })
      setResult(response)
      if (response.ok) {
        setCardNumber("")
        setExpDate("")
        setCvv("")
      }
    })
  }

  const succeeded = result?.ok === true

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pledger-title"
        className="relative bg-cream border border-gold/30 p-6 md:p-8 max-w-md w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-teal/50 hover:text-teal transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="text-[0.6rem] tracking-[0.4em] uppercase text-gold mb-2">Pledger Charitable</div>
          <h2 id="pledger-title" className="font-heading text-2xl text-teal">
            {entries} {entries === 1 ? "Entry" : "Entries"}
          </h2>
          <p className="text-sm text-teal/60 mt-1">${monthlyAmount}/month grant from your Pledger card</p>
        </div>

        {succeeded ? (
          <div className="flex flex-col items-center gap-3 text-center py-4" role="status">
            <CheckCircle2 className="w-10 h-10 text-gold" aria-hidden="true" />
            <p className="font-heading text-xl text-teal">Thank you for your grant</p>
            <p className="text-sm text-teal/70 leading-relaxed">
              Your monthly grant of ${result.amount} is set up and you have {result.entries}{" "}
              {result.entries === 1 ? "entry" : "entries"} in every drawing.
              {result.refNum && <> Reference #{result.refNum}.</>}
            </p>
            <button
              onClick={handleClose}
              className="mt-3 w-full py-4 bg-teal text-gold text-[0.65rem] tracking-[0.3em] uppercase transition-all hover:bg-teal2"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="pledger-name" className={labelClass}>
                Full name
              </label>
              <input
                id="pledger-name"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="pledger-email" className={labelClass}>
                Email for receipt
              </label>
              <input
                id="pledger-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="pledger-card" className={labelClass}>
                Pledger card number
              </label>
              <input
                id="pledger-card"
                required
                autoComplete="off"
                inputMode="numeric"
                placeholder="6599 0000 0000 0000"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCard(e.target.value))}
                className={`${inputClass} font-mono tracking-wide`}
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label htmlFor="pledger-exp" className={labelClass}>
                  Expires
                </label>
                <input
                  id="pledger-exp"
                  required
                  autoComplete="off"
                  inputMode="numeric"
                  placeholder="MM/YY"
                  value={expDate}
                  onChange={(e) => setExpDate(formatExpiry(e.target.value))}
                  className={`${inputClass} font-mono tracking-wide`}
                />
              </div>
              <div className="flex-1">
                <label htmlFor="pledger-cvv" className={labelClass}>
                  CVV
                </label>
                <input
                  id="pledger-cvv"
                  type="password"
                  required
                  autoComplete="off"
                  inputMode="numeric"
                  maxLength={4}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                  className={`${inputClass} font-mono tracking-[0.3em]`}
                />
              </div>
            </div>

            {result && !result.ok && (
              <p role="alert" className="text-sm text-destructive leading-relaxed">
                {result.error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="mt-1 w-full py-4 bg-teal text-gold text-[0.65rem] tracking-[0.3em] uppercase transition-all hover:bg-teal2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Processing..." : `Give $${monthlyAmount}/month`}
            </button>

            <p className="flex items-center justify-center gap-1.5 text-[0.65rem] text-teal/45 text-center">
              <Lock className="w-3 h-3" aria-hidden="true" />
              Sent directly to Pledger Charitable. We never store your card details.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
