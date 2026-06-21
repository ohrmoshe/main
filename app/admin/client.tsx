"use client"

import { useState } from "react"
import {
  getDonations,
  exportDonationsCSV,
  addManualDonation,
  updateDonationEntries,
} from "@/app/actions/admin"

type DonationFilter = "all" | "active" | "cancelled" | "one_time"

type Donation = {
  id: number
  name: string
  email: string
  phone: string | null
  addressLine1: string | null
  addressCity: string | null
  addressState: string | null
  addressPostalCode: string | null
  entries: number
  amountCents: number
  status: string
  createdAt: Date | null
  cancelledAt: Date | null
}

export function AdminDashboardClient({ initialDonations }: { initialDonations: Donation[] }) {
  const [donations, setDonations] = useState<Donation[]>(initialDonations)
  const [filter, setFilter] = useState<DonationFilter>("all")
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  // Inline entries editing
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")

  // Add donation form fields
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    entries: "",
    amount: "",
    status: "active" as "active" | "one_time",
  })
  const [submitting, setSubmitting] = useState(false)

  const refresh = async (f: DonationFilter = filter) => {
    const data = await getDonations(f)
    setDonations(Array.isArray(data) ? data : [])
  }

  const handleFilterChange = async (newFilter: DonationFilter) => {
    setFilter(newFilter)
    setLoading(true)
    try {
      await refresh(newFilter)
    } catch (error) {
      console.error("Error fetching donations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    setLoading(true)
    try {
      const csv = await exportDonationsCSV(filter)
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `watch-and-learn-donations-${filter}-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting:", error)
      alert("Failed to export. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) {
      alert("Name and email are required.")
      return
    }
    setSubmitting(true)
    try {
      await addManualDonation({
        name: form.name,
        email: form.email,
        phone: form.phone,
        entries: Number(form.entries) || 0,
        amountDollars: Number(form.amount) || 0,
        status: form.status,
      })
      setForm({ name: "", email: "", phone: "", entries: "", amount: "", status: "active" })
      setShowAddForm(false)
      await refresh()
    } catch (error) {
      console.error("Error adding donation:", error)
      alert("Failed to add donation. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (d: Donation) => {
    setEditingId(d.id)
    setEditValue(String(d.entries))
  }

  const saveEdit = async (id: number) => {
    const newEntries = Number(editValue)
    if (isNaN(newEntries) || newEntries < 0) {
      alert("Please enter a valid number of entries.")
      return
    }
    try {
      await updateDonationEntries(id, newEntries)
      setEditingId(null)
      await refresh()
    } catch (error) {
      console.error("Error updating entries:", error)
      alert("Failed to update entries. Please try again.")
    }
  }

  return (
    <>
      {/* Filter & Export */}
      <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {(["all", "active", "one_time", "cancelled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={`px-4 py-2 text-xs tracking-[0.2em] uppercase border transition-all ${
                filter === f
                  ? "border-gold bg-gold text-teal"
                  : "border-gold/30 text-gold2 hover:border-gold"
              }`}
            >
              {f === "one_time" ? "one-time" : f === "active" ? "monthly" : f}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm((s) => !s)}
            className="px-6 py-2 border border-gold bg-gold text-teal text-xs tracking-[0.2em] uppercase transition-all hover:bg-gold2"
          >
            {showAddForm ? "Close" : "+ Add Donation"}
          </button>
          <button
            onClick={handleExport}
            disabled={loading}
            className="px-6 py-2 border border-gold bg-transparent text-gold2 text-xs tracking-[0.2em] uppercase transition-all hover:bg-gold hover:text-teal disabled:opacity-50"
          >
            {loading ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Add Donation Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="border border-gold/30 bg-teal2 p-6 mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div className="flex flex-col gap-1">
            <label className="text-[0.6rem] tracking-[0.2em] uppercase text-gold">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-teal border border-gold/30 text-cream px-3 py-2 text-sm focus:border-gold outline-none"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[0.6rem] tracking-[0.2em] uppercase text-gold">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-teal border border-gold/30 text-cream px-3 py-2 text-sm focus:border-gold outline-none"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[0.6rem] tracking-[0.2em] uppercase text-gold">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="bg-teal border border-gold/30 text-cream px-3 py-2 text-sm focus:border-gold outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[0.6rem] tracking-[0.2em] uppercase text-gold">Entries</label>
            <input
              type="number"
              min="0"
              value={form.entries}
              onChange={(e) => setForm({ ...form, entries: e.target.value })}
              className="bg-teal border border-gold/30 text-cream px-3 py-2 text-sm focus:border-gold outline-none"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[0.6rem] tracking-[0.2em] uppercase text-gold">Amount ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="bg-teal border border-gold/30 text-cream px-3 py-2 text-sm focus:border-gold outline-none"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[0.6rem] tracking-[0.2em] uppercase text-gold">Type</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "one_time" })}
              className="bg-teal border border-gold/30 text-cream px-3 py-2 text-sm focus:border-gold outline-none"
            >
              <option value="active">Monthly</option>
              <option value="one_time">One-Time</option>
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 border border-gold bg-gold text-teal text-xs tracking-[0.2em] uppercase transition-all hover:bg-gold2 disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add Donor"}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="border border-gold/20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/20 bg-teal2">
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Name</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Email</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Phone</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Location</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Entries</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Amount</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Status</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Date</th>
            </tr>
          </thead>
          <tbody>
            {donations.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-cream/50">
                  No donations found
                </td>
              </tr>
            ) : (
              donations.map((donation) => (
                <tr key={donation.id} className="border-b border-gold/10 hover:bg-gold/5">
                  <td className="p-3 text-cream">{donation.name}</td>
                  <td className="p-3 text-cream/80">{donation.email}</td>
                  <td className="p-3 text-cream/80">{donation.phone || "-"}</td>
                  <td className="p-3 text-cream/80">
                    {donation.addressCity && donation.addressState
                      ? `${donation.addressCity}, ${donation.addressState}`
                      : "-"}
                  </td>
                  <td className="p-3 text-gold">
                    {editingId === donation.id ? (
                      <span className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-16 bg-teal border border-gold/40 text-cream px-2 py-1 text-sm focus:border-gold outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => saveEdit(donation.id)}
                          className="text-[0.55rem] tracking-[0.15em] uppercase bg-gold text-teal px-2 py-1 hover:bg-gold2"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-[0.55rem] tracking-[0.15em] uppercase text-cream/60 px-1 hover:text-cream"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        {donation.entries}
                        <button
                          onClick={() => startEdit(donation)}
                          className="text-[0.55rem] tracking-[0.15em] uppercase text-gold2/70 border border-gold/30 px-1.5 py-0.5 hover:border-gold hover:text-gold"
                        >
                          Edit
                        </button>
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-cream">${(donation.amountCents / 100).toFixed(2)}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-[0.55rem] tracking-[0.15em] uppercase ${
                        donation.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : donation.status === "one_time"
                          ? "bg-gold/20 text-gold2"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {donation.status === "one_time" ? "one-time" : donation.status}
                    </span>
                  </td>
                  <td className="p-3 text-cream/60 text-xs">
                    {donation.createdAt
                      ? new Date(donation.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
