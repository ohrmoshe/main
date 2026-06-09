"use client"

import { useEffect, useState } from "react"

function getRemaining(targetTime: number) {
  const diff = Math.max(0, targetTime - Date.now())
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)
  return { days, hours, minutes, seconds, done: diff === 0 }
}

export function CountdownClock({ targetTime }: { targetTime: number }) {
  const [time, setTime] = useState(() => getRemaining(targetTime))
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTime(getRemaining(targetTime))
    const interval = setInterval(() => setTime(getRemaining(targetTime)), 1000)
    return () => clearInterval(interval)
  }, [targetTime])

  if (time.done) {
    return <p className="text-gold2 font-semibold text-lg mt-4">The drawing is underway!</p>
  }

  const units = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Min", value: time.minutes },
    { label: "Sec", value: time.seconds },
  ]

  return (
    <div className="grid grid-cols-4 gap-2.5 mt-4" aria-live="off">
      {units.map((u) => (
        <div
          key={u.label}
          className="rounded-2xl bg-teal2/40 border border-cream/15 py-3 px-1 text-center"
        >
          <div className="font-heading text-2xl md:text-3xl leading-none text-cream tabular-nums">
            {mounted ? String(u.value).padStart(2, "0") : "--"}
          </div>
          <div className="text-[0.62rem] font-bold tracking-[0.12em] uppercase text-cream/60 mt-1.5">
            {u.label}
          </div>
        </div>
      ))}
    </div>
  )
}
