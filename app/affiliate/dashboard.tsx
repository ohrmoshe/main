"use client"

type Donor = {
  id: number
  name: string
  email: string
  status: string
  entries: number
  amount: number
  createdAt: Date | string | null
}

type ReferralData = {
  affiliate: { name: string; code: string }
  summary: {
    referralCount: number
    activeCount: number
    revenue: number
    entries: number
  }
  donors: Donor[]
}

export function AffiliateDashboard({ data }: { data: ReferralData }) {
  const { affiliate, summary, donors } = data

  return (
    <div className="min-h-screen bg-teal">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="font-heading text-4xl text-cream">Welcome, {affiliate.name}</h1>
            <p className="text-cream/70 mt-1">
              Your referral code: <span className="text-gold2 font-mono">{affiliate.code}</span>
            </p>
          </div>
          <form action="/api/affiliate/logout" method="POST">
            <button className="text-xs text-gold/60 hover:text-gold transition-colors tracking-[0.2em] uppercase">
              Logout
            </button>
          </form>
        </div>
        <p className="text-cream/60 text-sm mb-8">Here&apos;s everyone you&apos;ve brought in.</p>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total Referrals" value={summary.referralCount} />
          <StatCard label="Active" value={summary.activeCount} highlight />
          <StatCard label="Total Entries" value={summary.entries} />
          <StatCard label="Revenue Raised" value={`$${summary.revenue.toLocaleString()}`} highlight />
        </div>

        {/* Donor list */}
        <h2 className="font-heading text-2xl text-cream mb-4">Referred Donors</h2>
        <div className="border border-gold/20 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/20 bg-teal2">
                <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Name</th>
                <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Email</th>
                <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Status</th>
                <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Entries</th>
                <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Amount</th>
                <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Date</th>
              </tr>
            </thead>
            <tbody>
              {donors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-cream/50">
                    No referrals yet. Share your link to start bringing donors in.
                  </td>
                </tr>
              ) : (
                donors.map((d) => (
                  <tr key={d.id} className="border-b border-gold/10 hover:bg-gold/5">
                    <td className="p-3 text-cream">{d.name}</td>
                    <td className="p-3 text-cream/80">{d.email}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 text-[0.55rem] tracking-[0.15em] uppercase ${
                          d.status === "active"
                            ? "bg-green-500/20 text-green-400"
                            : d.status === "one_time"
                            ? "bg-gold/20 text-gold2"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {d.status === "one_time" ? "one-time" : d.status}
                      </span>
                    </td>
                    <td className="p-3 text-gold">{d.entries}</td>
                    <td className="p-3 text-cream">${d.amount.toFixed(2)}</td>
                    <td className="p-3 text-cream/60 text-xs">
                      {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
