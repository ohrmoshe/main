import { getDonations, getDonationStats } from "@/app/actions/admin"
import { AdminDashboardClient } from "./client"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const [donations, stats] = await Promise.all([
    getDonations("all"),
    getDonationStats(),
  ])

  const donationsArray = Array.isArray(donations) ? donations : []

  return (
    <div className="min-h-screen bg-teal">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="font-heading text-4xl text-cream mb-2">Admin Dashboard</h1>
        <p className="text-foreground/60 mb-8">Manage donations and export data for the raffle</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total Donors" value={stats.totalDonors} />
          <StatCard label="Active Donors" value={stats.activeDonors} highlight />
          <StatCard label="Cancelled" value={stats.cancelledDonors} />
          <StatCard label="Monthly Revenue" value={`$${stats.monthlyRevenue.toLocaleString()}`} />
          <StatCard label="Total Entries" value={stats.totalEntries} highlight />
        </div>

        <AdminDashboardClient initialDonations={donationsArray} />
      </div>
    </div>
  )
}

function StatCard({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`p-4 border ${highlight ? "border-gold/50 bg-gold/5" : "border-gold/20"}`}>
      <div className="text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-1">{label}</div>
      <div className="font-heading text-2xl text-cream">{value}</div>
    </div>
  )
}
