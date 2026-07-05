"use client"

import { useState, useEffect } from "react"
import { getDealDeadline, isDealActive } from "@/lib/deal"

function format2(n: number) {
  return n.toString().padStart(2, "0")
}

export function PromoPopup() {
  const [open, setOpen] = useState(false)
  const [remaining, setRemaining] = useState({ hrs: 0, min: 0, sec: 0 })

  useEffect(() => {
    // Only show if the deal is active and it hasn't already been dismissed this session.
    if (!isDealActive()) return
    if (sessionStorage.getItem("promoDismissed") === "true") return

    const timer = setTimeout(() => setOpen(true), 1200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!open) return
    const tick = () => {
      const diff = getDealDeadline().getTime() - Date.now()
      if (diff <= 0) {
        setOpen(false)
        return
      }
      const totalSec = Math.floor(diff / 1000)
      setRemaining({
        hrs: Math.floor(totalSec / 3600),
        min: Math.floor((totalSec % 3600) / 60),
        sec: totalSec % 60,
      })
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [open])

  const close = () => {
    sessionStorage.setItem("promoDismissed", "true")
    setOpen(false)
  }

  const goToDonate = () => {
    close()
    document.getElementById("donate")?.scrollIntoView({ behavior: "smooth" })
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-teal2/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-title"
      onClick={close}
    >
      <div
        className="relative w-full max-w-md rounded-[28px] bg-cream p-8 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 text-teal/50 hover:text-teal transition-colors text-xl leading-none"
        >
          &times;
        </button>

        <div className="text-[0.72rem] font-extrabold tracking-[0.2em] uppercase text-gold mb-2">
          Today Only &middot; June 21, 2026
        </div>
        <h2 id="promo-title" className="font-heading text-[2rem] leading-tight text-teal mb-3">
          Double Every Entry
        </h2>
        <p className="text-teal/75 text-[0.97rem] leading-relaxed mb-5">
          For the next few hours, every entry is <span className="font-semibold text-teal">doubled</span>{" "}
          when you subscribe this month. Twice the chances to win &mdash; same monthly donation.
        </p>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[
            { label: "Hrs", value: remaining.hrs },
            { label: "Min", value: remaining.min },
            { label: "Sec", value: remaining.sec },
          ].map((unit) => (
            <div key={unit.label} className="flex flex-col items-center">
              <div className="font-heading text-3xl text-teal bg-gold/15 rounded-xl px-3 py-2 min-w-[3.2rem]">
                {format2(unit.value)}
              </div>
              <div className="text-[0.6rem] tracking-[0.2em] uppercase text-teal/50 mt-1">{unit.label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={goToDonate}
          className="w-full rounded-full px-6 py-3.5 text-sm font-bold text-teal2 transition-transform hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, var(--gold), var(--gold2))",
            boxShadow: "0 12px 30px rgba(200,155,92,0.32)",
          }}
        >
          Claim Double Entries
        </button>
        <button onClick={close} className="block w-full mt-3 text-xs text-teal/50 hover:text-teal transition-colors">
          No thanks, maybe later
        </button>
      </div>
    </div>
  )
}
