"use client"

import { useState } from "react"
import { getDonations, exportDonationsCSV } from "@/app/actions/admin"

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

  const handleFilterChange = async (newFilter: DonationFilter) => {
    setFilter(newFilter)
    setLoading(true)
    try {
      const data = await getDonations(newFilter)
      setDonations(Array.isArray(data) ? data : [])
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

        <button
          onClick={handleExport}
          disabled={loading}
          className="px-6 py-2 border border-gold bg-transparent text-gold2 text-xs tracking-[0.2em] uppercase transition-all hover:bg-gold hover:text-teal disabled:opacity-50"
        >
          {loading ? "Exporting..." : "Export CSV"}
        </button>
      </div>

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
                  <td className="p-3 text-gold">{donation.entries}</td>
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
