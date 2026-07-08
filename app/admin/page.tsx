import { getDonations, getDonationStats } from "@/app/actions/admin"
import { getAffiliateStats } from "@/app/actions/affiliates"
import { getTransactionsByMonth } from "@/app/actions/transactions"
import { AdminDashboardClient } from "./client"
import { TransactionsView } from "./transactions-view"
import { AffiliatesManager } from "./affiliates-manager"
import { AdminLogin } from "./login"
import { headers } from "next/headers"
import { isAdminAuthenticated } from "@/lib/auth"

export const dynamic = "force-dynamic"

async function isAuthenticated() {
  // FIX (#3): validate the signed session token instead of comparing the cookie to the password.
  return isAdminAuthenticated()
}

export default async function AdminPage() {
  const authenticated = await isAuthenticated()

  if (!authenticated) {
    return <AdminLogin />
  }

  const [donations, stats, affiliateStats, transactionMonths] = await Promise.all([
    getDonations("all"),
    getDonationStats(),
    getAffiliateStats(),
    getTransactionsByMonth(),
  ])

  const donationsArray = Array.isArray(donations) ? donations : []

  const headersList = await headers()
  const host = headersList.get("host") || "watchnlearn.org"
  const protocol = host.includes("localhost") ? "http" : "https"
  const baseUrl = `${protocol}://${host}`

  return (
    <div className="min-h-screen bg-teal">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-2">
          <h1 className="font-heading text-4xl text-cream">Admin Dashboard</h1>
          <form action="/api/admin/logout" method="POST">
            <button className="text-xs text-gold/60 hover:text-gold transition-colors tracking-[0.2em] uppercase">
              Logout
            </button>
          </form>
        </div>
        <p className="text-cream/70 mb-8">Manage donations and export data for the raffle</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard label="Total Donors" value={stats.totalDonors} />
          <StatCard label="Active Monthly" value={stats.activeDonors} highlight />
          <StatCard label="One-Time" value={stats.oneTimeDonors} />
          <StatCard label="Cancelled" value={stats.cancelledDonors} />
        </div>
        {/* Revenue */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <StatCard label="Monthly Revenue" value={`$${stats.monthlyRevenue.toLocaleString()}`} />
          <StatCard label="One-Time Revenue" value={`$${stats.oneTimeRevenue.toLocaleString()}`} />
          <StatCard label="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} highlight />
        </div>
        {/* Entries */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard label="Monthly Entries" value={stats.monthlyEntries} highlight />
          <StatCard label="One-Time Entries" value={stats.oneTimeEntries} />
          <StatCard label="Total Entries" value={stats.totalEntries} highlight />
        </div>

        <AdminDashboardClient initialDonations={donationsArray} />

        <TransactionsView initialMonths={transactionMonths} />

        <AffiliatesManager initialAffiliates={affiliateStats} baseUrl={baseUrl} />
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
