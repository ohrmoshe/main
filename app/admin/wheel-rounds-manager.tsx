"use client"

import { useState } from "react"
import { startNewWheelRound, type WheelRoundsInfo } from "@/app/actions/wheel-rounds"

const fmt = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-US", {
        timeZone: "America/New_York",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "-"

export function WheelRoundsManager({ initialInfo, wheelMax }: { initialInfo: WheelRoundsInfo; wheelMax: number }) {
  const [info, setInfo] = useState(initialInfo)
  const [label, setLabel] = useState("")
  const [starting, setStarting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleStart = async () => {
    const name = label.trim()
    if (!name) {
      setError("Give this round a name first.")
      return
    }
    if (
      !confirm(
        `Start "${name}"?\n\nThe ${info.liveTaken} number${info.liveTaken === 1 ? "" : "s"} currently taken will be archived and freed up, giving the new wheel all ${wheelMax} numbers. Donations and raffle entries are not affected.`,
      )
    ) {
      return
    }

    setStarting(true)
    setError(null)
    setNotice(null)
    try {
      const res = await startNewWheelRound(name)
      setInfo((prev) => ({
        liveTaken: Math.max(0, prev.liveTaken - res.archived),
        liveAvailable: Math.min(wheelMax, prev.liveAvailable + res.archived),
        rounds: [
          {
            label: res.label,
            spins: res.archived,
            firstSpin: null,
            lastSpin: null,
            archivedAt: new Date().toISOString(),
          },
          ...prev.rounds,
        ],
      }))
      setLabel("")
      setNotice(`Archived ${res.archived} spin${res.archived === 1 ? "" : "s"} as "${res.label}". The wheel is reset.`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start a new round. Please try again.")
    } finally {
      setStarting(false)
    }
  }

  return (
    <section className="mb-16">
      <div className="mb-4">
        <h2 className="font-heading text-2xl text-cream">Prize Wheel Rounds</h2>
        <p className="text-cream/60 text-sm mt-1 max-w-2xl">
          Starting a new round archives every spin on the current wheel and frees those numbers so they can be won
          again. Donations, transactions, and raffle entries stay exactly as they are.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="p-4 border border-gold/50 bg-gold/5">
          <div className="text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-1">Numbers Taken</div>
          <div className="font-heading text-2xl text-cream">{info.liveTaken}</div>
        </div>
        <div className="p-4 border border-gold/20">
          <div className="text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-1">Still Available</div>
          <div className="font-heading text-2xl text-cream">{info.liveAvailable}</div>
        </div>
        <div className="p-4 border border-gold/20">
          <div className="text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-1">Past Rounds</div>
          <div className="font-heading text-2xl text-cream">{info.rounds.length}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 mb-3">
        <label className="flex flex-col gap-1 flex-1 min-w-[220px]">
          <span className="text-[0.6rem] tracking-[0.2em] uppercase text-gold">New round name</span>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Round 3 — September"
            maxLength={60}
            className="bg-teal border border-gold/30 text-cream px-3 py-2 text-sm focus:border-gold outline-none"
          />
        </label>
        <button
          onClick={handleStart}
          disabled={starting}
          className="px-6 py-2 border border-red-500/60 bg-red-500/10 text-red-300 text-xs tracking-[0.2em] uppercase transition-all hover:bg-red-500/20 hover:text-red-200 disabled:opacity-50"
        >
          {starting ? "Resetting..." : "Start New Wheel"}
        </button>
      </div>

      {notice && <p className="text-green-400 text-sm mb-4">{notice}</p>}
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="border border-gold/20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/20 bg-teal2">
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Round</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Spins</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">First Spin (ET)</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Last Spin (ET)</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Archived (ET)</th>
            </tr>
          </thead>
          <tbody>
            {info.rounds.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-cream/50">
                  No past rounds yet.
                </td>
              </tr>
            ) : (
              info.rounds.map((r) => (
                <tr key={r.label} className="border-b border-gold/10 hover:bg-gold/5">
                  <td className="p-3 text-cream">{r.label}</td>
                  <td className="p-3 text-cream/80">{r.spins}</td>
                  <td className="p-3 text-cream/60 text-xs">{fmt(r.firstSpin)}</td>
                  <td className="p-3 text-cream/60 text-xs">{fmt(r.lastSpin)}</td>
                  <td className="p-3 text-cream/60 text-xs">{fmt(r.archivedAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
