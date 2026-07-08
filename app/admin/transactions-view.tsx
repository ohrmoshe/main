"use client"

import { useState } from "react"
import {
  getTransactionsByMonth,
  backfillTransactionsFromStripe,
  deleteTransaction,
  updateTransaction,
} from "@/app/actions/transactions"

type TransactionRow = {
  id: number
  name: string
  email: string
  amountCents: number
  entries: number
  type: string
  status: string
  billingMonth: string
  stripeSubscriptionId: string | null
  referralCode: string | null
  affiliateName: string | null
  chargedAt: Date | string | null
}

type MonthGroup = {
  key: string
  label: string
  total: number
  entries: number
  count: number
  rows: TransactionRow[]
}

const TYPE_LABELS: Record<string, string> = {
  subscription_initial: "New Monthly",
  subscription_renewal: "Renewal",
  one_time: "One-Time",
  manual: "Manual",
}

export function TransactionsView({ initialMonths }: { initialMonths: MonthGroup[] }) {
  const [months, setMonths] = useState<MonthGroup[]>(initialMonths)
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [openKey, setOpenKey] = useState<string | null>(initialMonths[0]?.key ?? null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editAmount, setEditAmount] = useState("")
  const [editEntries, setEditEntries] = useState("")
  const [busyId, setBusyId] = useState<number | null>(null)

  const refresh = async () => {
    const data = await getTransactionsByMonth()
    setMonths(Array.isArray(data) ? data : [])
  }

  const handleSync = async () => {
    setSyncing(true)
    setMessage(null)
    try {
      const result = await backfillTransactionsFromStripe()
      await refresh()
      setMessage(
        `Synced from Stripe: ${result.inserted} new charge${result.inserted === 1 ? "" : "s"} added ` +
          `(${result.invoicesScanned} invoices, ${result.oneTimeScanned} one-time scanned).`,
      )
    } catch (error) {
      console.error("Error syncing transactions:", error)
      setMessage("Failed to sync from Stripe. Please try again.")
    } finally {
      setSyncing(false)
    }
  }

  const startEdit = (row: TransactionRow) => {
    setEditingId(row.id)
    setEditAmount((row.amountCents / 100).toFixed(2))
    setEditEntries(String(row.entries))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditAmount("")
    setEditEntries("")
  }

  const saveEdit = async (id: number) => {
    setBusyId(id)
    try {
      await updateTransaction(id, {
        amountCents: Math.round(Number.parseFloat(editAmount) * 100),
        entries: Number.parseInt(editEntries, 10),
      })
      await refresh()
      cancelEdit()
    } catch (error) {
      console.error("Error updating transaction:", error)
      setMessage("Failed to update the charge. Please try again.")
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this charge? This only affects the admin record, not Stripe.")) return
    setBusyId(id)
    try {
      await deleteTransaction(id)
      await refresh()
    } catch (error) {
      console.error("Error deleting transaction:", error)
      setMessage("Failed to delete the charge. Please try again.")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="mt-12">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-2xl text-cream">Charges by Month</h2>
          <p className="text-cream/60 text-sm mt-1">
            Each charge is grouped into its billing month (the 15th to the 15th).
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-6 py-2 border border-gold bg-gold text-teal text-xs tracking-[0.2em] uppercase transition-all hover:bg-gold2 disabled:opacity-50"
        >
          {syncing ? "Syncing..." : "Sync from Stripe"}
        </button>
      </div>

      {message && (
        <p className="mb-6 text-sm text-gold2 border border-gold/30 bg-gold/5 px-4 py-3">{message}</p>
      )}

      {months.length === 0 ? (
        <div className="border border-gold/20 p-8 text-center text-cream/50">
          No charges recorded yet. Use &quot;Sync from Stripe&quot; to import existing charges.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {months.map((month) => {
            const isOpen = openKey === month.key
            return (
              <div key={month.key} className="border border-gold/20">
                <button
                  onClick={() => setOpenKey(isOpen ? null : month.key)}
                  className="w-full flex flex-wrap items-center justify-between gap-4 p-4 bg-teal2 text-left hover:bg-gold/5 transition-colors"
                >
                  <span className="font-heading text-xl text-cream">{month.label}</span>
                  <span className="flex flex-wrap gap-6 items-center text-sm">
                    <span className="text-cream/70">
                      <span className="text-gold">{month.count}</span> charges
                    </span>
                    <span className="text-cream/70">
                      <span className="text-gold">{month.entries}</span> entries
                    </span>
                    <span className="text-cream font-medium">${(month.total / 100).toLocaleString()}</span>
                    <span className="text-gold2 text-lg leading-none">{isOpen ? "−" : "+"}</span>
                  </span>
                </button>

                {isOpen && (
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
                          <th className="text-right p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {month.rows.map((row) => {
                          const isEditing = editingId === row.id
                          const isBusy = busyId === row.id
                          return (
                            <tr key={row.id} className="border-b border-gold/10 hover:bg-gold/5">
                              <td className="p-3 text-cream/60 text-xs">
                                {row.chargedAt ? new Date(row.chargedAt).toLocaleDateString() : "-"}
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
                              <td className="p-3 text-cream/80">
                                {row.affiliateName ? (
                                  <span className="text-gold2">{row.affiliateName}</span>
                                ) : row.referralCode ? (
                                  <span className="text-cream/50" title="No matching affiliate record">
                                    {row.referralCode}
                                  </span>
                                ) : (
                                  <span className="text-cream/30">-</span>
                                )}
                              </td>
                              <td className="p-3 text-gold">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    min="0"
                                    value={editEntries}
                                    onChange={(e) => setEditEntries(e.target.value)}
                                    className="w-20 bg-teal border border-gold/40 px-2 py-1 text-cream"
                                  />
                                ) : (
                                  row.entries
                                )}
                              </td>
                              <td className="p-3 text-cream">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editAmount}
                                    onChange={(e) => setEditAmount(e.target.value)}
                                    className="w-24 bg-teal border border-gold/40 px-2 py-1 text-cream"
                                  />
                                ) : (
                                  `$${(row.amountCents / 100).toFixed(2)}`
                                )}
                              </td>
                              <td className="p-3">
                                <div className="flex gap-2 justify-end">
                                  {isEditing ? (
                                    <>
                                      <button
                                        onClick={() => saveEdit(row.id)}
                                        disabled={isBusy}
                                        className="px-3 py-1 text-[0.55rem] tracking-[0.15em] uppercase border border-gold bg-gold text-teal hover:bg-gold2 disabled:opacity-50"
                                      >
                                        {isBusy ? "..." : "Save"}
                                      </button>
                                      <button
                                        onClick={cancelEdit}
                                        disabled={isBusy}
                                        className="px-3 py-1 text-[0.55rem] tracking-[0.15em] uppercase border border-cream/30 text-cream/70 hover:bg-cream/10 disabled:opacity-50"
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => startEdit(row)}
                                        disabled={isBusy}
                                        className="px-3 py-1 text-[0.55rem] tracking-[0.15em] uppercase border border-gold/40 text-gold2 hover:bg-gold/10 disabled:opacity-50"
                                      >
                                        Adjust
                                      </button>
                                      <button
                                        onClick={() => handleDelete(row.id)}
                                        disabled={isBusy}
                                        className="px-3 py-1 text-[0.55rem] tracking-[0.15em] uppercase border border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                                      >
                                        {isBusy ? "..." : "Delete"}
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
