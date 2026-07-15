"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { effectiveEntries } from "@/lib/drawing"

type Donation = {
  id: number
  name: string
  status: string
  entries: number
  bonusEntries?: number | null
  bonusEntriesUntil?: Date | string | null
}

type Segment = {
  donor: Donation
  weight: number
}

// Brand-colored slices. Each pair keeps text readable on its background.
const PALETTE: { bg: string; fg: string }[] = [
  { bg: "#c89b5c", fg: "#123636" }, // gold / dark teal
  { bg: "#1a4a4a", fg: "#f7f1e8" }, // teal / cream
  { bg: "#e1c08d", fg: "#123636" }, // gold2 / dark teal
  { bg: "#235c5c", fg: "#f7f1e8" }, // teal3 / cream
]

const TWO_PI = Math.PI * 2
const POINTER_ANGLE = -Math.PI / 2 // pointer sits at the top (12 o'clock)
const SPIN_DURATION = 6000 // ms
const SIZE = 520 // css pixels

function truncate(name: string, max = 16): string {
  return name.length > max ? name.slice(0, max - 1) + "…" : name
}

export function DrawingWheel({ donations }: { donations: Donation[] }) {
  const [open, setOpen] = useState(false)
  const [showEntries, setShowEntries] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<Donation | null>(null)
  // Winners removed from the pool so you can draw multiple prizes without repeats.
  const [excludedIds, setExcludedIds] = useState<number[]>([])

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rotationRef = useRef(0) // current wheel rotation in radians
  const animRef = useRef<number | null>(null)

  // Eligible entrants: active monthly + one-time donors with at least one entry
  // for the upcoming drawing, minus anyone already drawn this session.
  const segments = useMemo<Segment[]>(() => {
    return donations
      .filter((d) => (d.status === "active" || d.status === "one_time") && !excludedIds.includes(d.id))
      .map((d) => ({ donor: d, weight: effectiveEntries(d) }))
      .filter((s) => s.weight > 0)
  }, [donations, excludedIds])

  const totalEntries = useMemo(() => segments.reduce((sum, s) => sum + s.weight, 0), [segments])

  const draw = useCallback(
    (rotation: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const dpr = window.devicePixelRatio || 1
      const cx = SIZE / 2
      const cy = SIZE / 2
      const radius = SIZE / 2 - 6

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, SIZE, SIZE)

      const n = segments.length
      if (n === 0) {
        ctx.fillStyle = "#123636"
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, TWO_PI)
        ctx.fill()
        ctx.fillStyle = "#f7f1e8"
        ctx.font = "600 16px var(--font-sans, sans-serif)"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("No eligible entrants", cx, cy)
        return
      }

      // Equal slices per donor keeps names readable and does NOT visually reveal
      // who has more entries (odds are applied during winner selection instead).
      const slice = TWO_PI / n

      ctx.save()
      ctx.translate(cx, cy)

      for (let i = 0; i < n; i++) {
        const start = i * slice + rotation
        const end = start + slice
        const { bg, fg } = PALETTE[i % PALETTE.length]

        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.arc(0, 0, radius, start, end)
        ctx.closePath()
        ctx.fillStyle = bg
        ctx.fill()
        ctx.strokeStyle = "rgba(18,54,54,0.35)"
        ctx.lineWidth = 1
        ctx.stroke()

        // Label — skip when slices get too thin to read.
        if (slice > 0.05) {
          ctx.save()
          ctx.rotate(start + slice / 2)
          ctx.textAlign = "right"
          ctx.textBaseline = "middle"
          ctx.fillStyle = fg
          const fontSize = Math.max(11, Math.min(18, 22 - n * 0.15))
          ctx.font = `600 ${fontSize}px var(--font-sans, sans-serif)`
          const label = showEntries
            ? `${truncate(segments[i].donor.name)}  ·  ${segments[i].weight}`
            : truncate(segments[i].donor.name)
          ctx.fillText(label, radius - 16, 0)
          ctx.restore()
        }
      }

      // Center hub
      ctx.beginPath()
      ctx.arc(0, 0, 46, 0, TWO_PI)
      ctx.fillStyle = "#f7f1e8"
      ctx.fill()
      ctx.strokeStyle = "#c89b5c"
      ctx.lineWidth = 4
      ctx.stroke()
      ctx.fillStyle = "#123636"
      ctx.font = "700 13px var(--font-sans, sans-serif)"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("SPIN", 0, 0)

      ctx.restore()
    },
    [segments, showEntries],
  )

  // Size the canvas backing store for the device pixel ratio (crisp on retina),
  // then redraw whenever the pool or the entries toggle changes.
  useEffect(() => {
    if (!open) return
    const canvas = canvasRef.current
    if (canvas) {
      const dpr = window.devicePixelRatio || 1
      if (canvas.width !== SIZE * dpr) {
        canvas.width = SIZE * dpr
        canvas.height = SIZE * dpr
      }
    }
    draw(rotationRef.current)
  }, [open, draw])

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  const spin = () => {
    if (spinning || segments.length === 0) return
    setWinner(null)
    setSpinning(true)

    const n = segments.length
    const slice = TWO_PI / n

    // Weighted winner selection — every entry is effectively a ticket.
    let r = Math.random() * totalEntries
    let winnerIndex = n - 1
    for (let i = 0; i < n; i++) {
      if (r < segments[i].weight) {
        winnerIndex = i
        break
      }
      r -= segments[i].weight
    }

    // Compute a target rotation that lands the winning slice under the pointer.
    const winnerMid = winnerIndex * slice + slice / 2
    const jitter = (Math.random() - 0.5) * slice * 0.6
    const currentMod = ((rotationRef.current % TWO_PI) + TWO_PI) % TWO_PI
    const targetMod = (((POINTER_ANGLE - winnerMid - jitter) % TWO_PI) + TWO_PI) % TWO_PI
    const delta = ((targetMod - currentMod) % TWO_PI + TWO_PI) % TWO_PI
    const startRotation = rotationRef.current
    const finalRotation = startRotation + TWO_PI * 6 + delta

    const startTime = performance.now()
    const easeOutQuart = (p: number) => 1 - Math.pow(1 - p, 4)

    const step = (now: number) => {
      const elapsed = now - startTime
      const p = Math.min(1, elapsed / SPIN_DURATION)
      const current = startRotation + (finalRotation - startRotation) * easeOutQuart(p)
      rotationRef.current = current
      draw(current)
      if (p < 1) {
        animRef.current = requestAnimationFrame(step)
      } else {
        rotationRef.current = finalRotation % TWO_PI
        draw(rotationRef.current)
        setSpinning(false)
        setWinner(segments[winnerIndex].donor)
      }
    }
    animRef.current = requestAnimationFrame(step)
  }

  const removeWinner = () => {
    if (!winner) return
    setExcludedIds((prev) => [...prev, winner.id])
    setWinner(null)
  }

  const resetPool = () => {
    setExcludedIds([])
    setWinner(null)
  }

  return (
    <section className="mb-8 border border-gold/30 bg-teal2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <span className="font-heading text-2xl text-cream">Live Drawing Wheel</span>
        <span className="text-xs tracking-[0.2em] uppercase text-gold">{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <div className="px-6 pb-8 flex flex-col items-center gap-6">
          {/* Controls */}
          <div className="w-full flex flex-wrap items-center justify-between gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showEntries}
                onChange={(e) => setShowEntries(e.target.checked)}
                className="w-4 h-4 accent-[#c89b5c]"
              />
              <span className="text-xs tracking-[0.2em] uppercase text-gold2">Show entry counts</span>
            </label>

            <div className="text-xs tracking-[0.15em] uppercase text-cream/70">
              {segments.length} entrant{segments.length === 1 ? "" : "s"}
              {showEntries && <span className="text-gold2"> · {totalEntries} entries</span>}
              {excludedIds.length > 0 && (
                <button onClick={resetPool} className="ml-3 text-gold underline hover:text-gold2">
                  Reset pool ({excludedIds.length} drawn)
                </button>
              )}
            </div>
          </div>

          {/* Wheel */}
          <div className="relative" style={{ width: SIZE, maxWidth: "100%" }}>
            {/* Pointer at top */}
            <div
              className="absolute left-1/2 -translate-x-1/2 z-10"
              style={{ top: -4 }}
              aria-hidden="true"
            >
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "16px solid transparent",
                  borderRight: "16px solid transparent",
                  borderTop: "28px solid #f0dfa0",
                  filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.4))",
                }}
              />
            </div>
            <canvas
              ref={canvasRef}
              width={SIZE}
              height={SIZE}
              style={{ width: "100%", height: "auto", display: "block" }}
              onClick={spin}
              className="cursor-pointer rounded-full"
            />
          </div>

          {/* Spin button */}
          <button
            onClick={spin}
            disabled={spinning || segments.length === 0}
            className="px-10 py-3 border border-gold bg-gold text-teal text-sm tracking-[0.25em] uppercase font-semibold transition-all hover:bg-gold2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {spinning ? "Spinning…" : "Spin the Wheel"}
          </button>

          {/* Winner banner */}
          {winner && !spinning && (
            <div className="w-full max-w-lg text-center border border-gold bg-gold/10 p-6">
              <div className="text-[0.65rem] tracking-[0.3em] uppercase text-gold mb-2">Winner</div>
              <div className="font-heading text-4xl text-cream mb-1">{winner.name}</div>
              {showEntries && (
                <div className="text-sm text-cream/70">{effectiveEntries(winner)} entries</div>
              )}
              <div className="flex justify-center gap-3 mt-4">
                <button
                  onClick={spin}
                  className="px-5 py-2 border border-gold text-gold2 text-xs tracking-[0.2em] uppercase hover:bg-gold hover:text-teal transition-all"
                >
                  Spin Again
                </button>
                <button
                  onClick={removeWinner}
                  className="px-5 py-2 border border-gold/40 text-cream/70 text-xs tracking-[0.2em] uppercase hover:border-gold hover:text-cream transition-all"
                >
                  Remove &amp; Draw Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
