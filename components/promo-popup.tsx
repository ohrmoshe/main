"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

const DEAL_DURATION_MS = 4 * 60 * 60 * 1000 // 4 hours
const DEADLINE_KEY = "promoDealDeadline"
const DISMISSED_KEY = "promoDealDismissed"

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (n: number) => n.toString().padStart(2, "0")
  return { hours: pad(hours), minutes: pad(minutes), seconds: pad(seconds) }
}

export function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [remaining, setRemaining] = useState(DEAL_DURATION_MS)

  useEffect(() => {
    // Already dismissed this session — don't show again
    if (sessionStorage.getItem(DISMISSED_KEY)) return

    // Establish (or reuse) the 4-hour deadline so the countdown survives refreshes
    let deadline = Number(localStorage.getItem(DEADLINE_KEY))
    const now = Date.now()
    if (!deadline || Number.isNaN(deadline) || deadline <= now) {
      deadline = now + DEAL_DURATION_MS
      localStorage.setItem(DEADLINE_KEY, String(deadline))
    }

    setRemaining(deadline - now)

    // Small delay so the popup feels intentional on landing
    const showTimer = setTimeout(() => setIsOpen(true), 1200)

    const interval = setInterval(() => {
      const left = deadline - Date.now()
      setRemaining(left)
      if (left <= 0) {
        clearInterval(interval)
        setIsOpen(false)
      }
    }, 1000)

    return () => {
      clearTimeout(showTimer)
      clearInterval(interval)
    }
  }, [])

  const close = () => {
    setIsOpen(false)
    sessionStorage.setItem(DISMISSED_KEY, "1")
  }

  const goToDonate = () => {
    close()
    window.location.hash = "#donate"
  }

  if (!isOpen || remaining <= 0) return null

  const { hours, minutes, seconds } = formatRemaining(remaining)

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />

      {/* Modal */}
      <div className="relative bg-cream border border-gold/30 p-8 sm:p-10 max-w-lg w-full mx-4 shadow-2xl text-center">
        <button
          onClick={close}
          aria-label="Close promotion"
          className="absolute top-4 right-4 text-teal/50 hover:text-teal transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-[0.62rem] tracking-[0.42em] uppercase text-gold mb-3">Today Only</div>

        <h2 className="font-heading text-4xl sm:text-5xl text-teal leading-tight text-balance mb-3">
          Double Every Entry
        </h2>

        <p className="text-sm sm:text-base text-teal/70 leading-relaxed mb-6 text-pretty">
          For the next 4 hours, every entry is{" "}
          <span className="font-semibold text-teal">doubled</span> when you subscribe this month. Twice the chances to
          win &mdash; same monthly donation.
        </p>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-3 mb-7">
          {[
            { label: "Hours", value: hours },
            { label: "Minutes", value: minutes },
            { label: "Seconds", value: seconds },
          ].map((unit) => (
            <div key={unit.label} className="flex flex-col items-center">
              <div className="bg-teal text-gold2 font-heading text-3xl sm:text-4xl w-16 sm:w-20 py-3 tabular-nums">
                {unit.value}
              </div>
              <div className="text-[0.55rem] tracking-[0.3em] uppercase text-teal/50 mt-2">{unit.label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={goToDonate}
          className="w-full py-4 bg-teal text-gold text-[0.65rem] tracking-[0.3em] uppercase transition-all hover:bg-teal2"
        >
          Claim Double Entries
        </button>

        <button
          onClick={close}
          className="mt-4 text-[0.6rem] tracking-[0.2em] uppercase text-teal/40 hover:text-teal/70 transition-colors"
        >
          No thanks, maybe later
        </button>
      </div>
    </div>
  )
}
