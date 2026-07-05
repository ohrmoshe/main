"use client"

import { useEffect, useState } from "react"
import { getDealDeadline } from "@/lib/deal"

function pad(n: number) {
  return n.toString().padStart(2, "0")
}

export function DealBanner() {
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    const deadline = getDealDeadline().getTime()

    const tick = () => {
      setRemaining(Math.max(0, deadline - Date.now()))
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  // Don't render until we've measured the time, or once the deal has ended.
  if (remaining === null || remaining <= 0) return null

  const totalSeconds = Math.floor(remaining / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return (
    <div className="mb-9 rounded-[22px] border border-gold/60 bg-gold/[0.12] px-5 py-5 md:px-8 md:py-6 flex flex-col md:flex-row items-center gap-4 md:gap-7 text-center md:text-left">
      <div className="flex-1">
        <div className="text-[0.72rem] font-extrabold tracking-[0.18em] uppercase text-gold mb-1.5">
          Today Only · June 21, 2026
        </div>
        <h3 className="font-heading text-[clamp(1.5rem,2.6vw,2.1rem)] font-light leading-tight text-cream">
          Every Entry <span className="text-gold2 font-normal">Doubled</span> When You Subscribe
        </h3>
        <p className="text-cream/75 text-[0.97rem] mt-1.5">
          Start any monthly plan before{" "}
          <span className="font-semibold text-cream">midnight ET tonight (12:00 AM)</span> and we&apos;ll double your
          entries into the drawing — same monthly donation, twice the chances.
        </p>
      </div>

      <div className="shrink-0 flex flex-col items-center">
        <div className="text-[0.66rem] font-extrabold tracking-[0.16em] uppercase text-cream/60 mb-2">
          Deal Ends In
        </div>
        <div className="flex items-center gap-2" role="timer" aria-live="off">
          {[
            { value: hours, label: "Hrs" },
            { value: minutes, label: "Min" },
            { value: seconds, label: "Sec" },
          ].map((unit, i) => (
            <div key={unit.label} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <div className="bg-teal2 text-gold2 font-heading text-[1.9rem] leading-none rounded-xl px-3 py-2.5 min-w-[3.2rem] tabular-nums">
                  {pad(unit.value)}
                </div>
                <div className="text-[0.6rem] font-bold tracking-[0.12em] uppercase text-cream/55 mt-1.5">
                  {unit.label}
                </div>
              </div>
              {i < 2 && <span className="font-heading text-2xl text-gold2 -mt-4">:</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
