"use client"

import { useState } from "react"
import { getNextRaffleEntrants, exportTransactionsCSV } from "@/app/actions/transactions"

type EntrantRow = {
  id: number
  name: string
  email: string
  amountCents: number
  entries: number
  type: string
  referralCode: string | null
  affiliateName: string | null
  chargedAt: Date | string | null
}

type RaffleData = {
  key: string
  label: string
  dateLabel: string
  startsAt: Date | string
  endsAt: Date | string
  count: number
  entries: number
  total: number
  rows: EntrantRow[]
}

const TYPE_LABELS: Record<string, string> = {
  subscription_initial: "New Monthly",
  subscription_renewal: "Renewal",
  one_time: "One-Time",
  manual: "Manual",
}

function fmtDateTime(d: Date | string): string {
  return new Date(d).toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function NextRaffle({ initialData }: { initialData: RaffleData }) {
  const [data, setData] = useState<RaffleData>(initialData)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  const refresh = async () => {
    setLoading(true)
    try {
      const fresh = await getNextRaffleEntrants()
      setData(fresh as RaffleData)
    } catch (error) {
      console.error("Error refreshing next raffle:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const csv = await exportTransactionsCSV("next")
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `next-raffle-entrants-${data.key}-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting entrants:", error)
      alert("Failed to export. Please try again.")
    } finally {
      setExporting(false)
    }
  }

  return (
    <section className="mt-12 border border-gold/40 bg-gold/5">
      <div className="flex flex-wrap gap-4 items-start justify-between p-6 border-b border-gold/20">
        <div>
          <div className="text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-1">Next Raffle</div>
          <h2 className="font-heading text-2xl text-cream">{data.label}</h2>
          <p className="text-cream/60 text-sm mt-1">
            Entrants charged from {fmtDateTime(data.startsAt)} to {fmtDateTime(data.endsAt)} (PT). Includes monthly
            renewals, new signups, and one-time donations.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            disabled={loading}
            className="px-4 py-2 border border-gold/40 text-gold2 text-xs tracking-[0.2em] uppercase transition-all hover:bg-gold/10 disabled:opacity-50"
          >
            {loading ? "..." : "Refresh"}
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || data.count === 0}
            className="px-6 py-2 border border-gold bg-gold text-teal text-xs tracking-[0.2em] uppercase transition-all hover:bg-gold2 disabled:opacity-50"
          >
            {exporting ? "Exporting..." : "Export Entrants CSV"}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 p-6">
        <div className="p-4 border border-gold/20">
          <div className="text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-1">Charges</div>
          <div className="font-heading text-2xl text-cream">{data.count}</div>
        </div>
        <div className="p-4 border border-gold/50 bg-gold/5">
          <div className="text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-1">Total Entries</div>
          <div className="font-heading text-2xl text-cream">{data.entries}</div>
        </div>
        <div className="p-4 border border-gold/20">
          <div className="text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-1">Raised</div>
          <div className="font-heading text-2xl text-cream">${(data.total / 100).toLocaleString()}</div>
        </div>
      </div>

      {/* Entrants table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-gold/20">
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Date</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Name</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Email</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Type</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Affiliate</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Entries</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-cream/50">
                  No entrants recorded for this drawing yet. Use &quot;Sync from Stripe&quot; below to import charges.
                </td>
              </tr>
            ) : (
              data.rows.map((row) => (
                <tr key={row.id} className="border-b border-gold/10 hover:bg-gold/5">
                  <td className="p-3 text-cream/60 text-xs">
                    {row.chargedAt ? fmtDateTime(row.chargedAt) : "-"}
                  </td>
                  <td className="p-3 text-cream">{row.name}</td>
                  <td className="p-3 text-cream/80">{row.email || "-"}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-[0.55rem] tracking-[0.15em] uppercase ${
                        row.type === "subscription_renewal"
                          ? "bg-green-500/20 text-green-400"
                          : row.type === "subscription_initial"
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-gold/20 text-gold2"
                      }`}
                    >
                      {TYPE_LABELS[row.type] || row.type}
                    </span>
                  </td>
                  <td className="p-3">
                    {row.affiliateName ? (
                      <span className="inline-block px-2 py-1 text-[0.6rem] tracking-[0.1em] uppercase bg-gold/20 text-gold2 font-medium">
                        {row.affiliateName}
                      </span>
                    ) : row.referralCode ? (
                      <span className="inline-block px-2 py-1 text-[0.6rem] tracking-[0.1em] uppercase bg-cream/10 text-cream/60">
                        {row.referralCode}
                      </span>
                    ) : (
                      <span className="text-cream/30">Direct</span>
                    )}
                  </td>
                  <td className="p-3 text-gold">{row.entries}</td>
                  <td className="p-3 text-cream">${(row.amountCents / 100).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
