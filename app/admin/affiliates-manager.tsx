"use client"

import { useState } from "react"
import { createAffiliate, deleteAffiliate } from "@/app/actions/affiliates"

type AffiliateStat = {
  id: number
  name: string
  email: string | null
  phone: string | null
  code: string
  notes: string | null
  createdAt: Date | null
  referralCount: number
  activeCount: number
  revenue: number
  entries: number
}

export function AffiliatesManager({
  initialAffiliates,
  baseUrl,
}: {
  initialAffiliates: AffiliateStat[]
  baseUrl: string
}) {
  const [affiliates] = useState<AffiliateStat[]>(initialAffiliates)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", email: "", phone: "", code: "", notes: "" })

  const handleCreate = async () => {
    if (!form.name.trim()) {
      alert("Please enter an affiliate name")
      return
    }
    setLoading(true)
    try {
      await createAffiliate(form)
      window.location.reload()
    } catch (error) {
      console.error("Error creating affiliate:", error)
      alert(error instanceof Error ? error.message : "Failed to create affiliate")
      setLoading(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Remove affiliate "${name}"? Their past attributed donations will remain in the database.`)) return
    setLoading(true)
    try {
      await deleteAffiliate(id)
      window.location.reload()
    } catch (error) {
      console.error("Error deleting affiliate:", error)
      setLoading(false)
    }
  }

  const copyLink = (code: string) => {
    const link = `${baseUrl}/?ref=${code}#donate`
    navigator.clipboard.writeText(link)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-2xl text-cream">Affiliates</h2>
          <p className="text-cream/60 text-sm mt-1">
            Track donations by referral link. Share each affiliate&apos;s link to attribute sign-ups.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="px-6 py-2 border border-gold bg-gold text-teal text-xs tracking-[0.2em] uppercase transition-all hover:opacity-90"
        >
          {showForm ? "Close" : "Add Affiliate"}
        </button>
      </div>

      {showForm && (
        <div className="border border-gold/30 bg-gold/5 p-5 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[0.6rem] tracking-[0.2em] uppercase text-gold mb-1">Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-teal2 border border-gold/30 text-cream px-3 py-2 text-sm focus:outline-none focus:border-gold"
              placeholder="Affiliate name"
            />
          </div>
          <div>
            <label className="block text-[0.6rem] tracking-[0.2em] uppercase text-gold mb-1">
              Custom Code (optional)
            </label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="w-full bg-teal2 border border-gold/30 text-cream px-3 py-2 text-sm focus:outline-none focus:border-gold"
              placeholder="auto-generated from name"
            />
          </div>
          <div>
            <label className="block text-[0.6rem] tracking-[0.2em] uppercase text-gold mb-1">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-teal2 border border-gold/30 text-cream px-3 py-2 text-sm focus:outline-none focus:border-gold"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-[0.6rem] tracking-[0.2em] uppercase text-gold mb-1">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-teal2 border border-gold/30 text-cream px-3 py-2 text-sm focus:outline-none focus:border-gold"
              placeholder="(555) 555-5555"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[0.6rem] tracking-[0.2em] uppercase text-gold mb-1">Notes</label>
            <input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-teal2 border border-gold/30 text-cream px-3 py-2 text-sm focus:outline-none focus:border-gold"
              placeholder="Optional notes"
            />
          </div>
          <div className="md:col-span-2">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="px-6 py-2 border border-gold bg-gold text-teal text-xs tracking-[0.2em] uppercase transition-all hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Affiliate"}
            </button>
          </div>
        </div>
      )}

      <div className="border border-gold/20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/20 bg-teal2">
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Affiliate</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Code</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Referrals</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Active</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Entries</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Revenue</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Link</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold"></th>
            </tr>
          </thead>
          <tbody>
            {affiliates.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-cream/50">
                  No affiliates yet. Add one to start tracking referrals.
                </td>
              </tr>
            ) : (
              affiliates.map((a) => (
                <tr key={a.id} className="border-b border-gold/10 hover:bg-gold/5">
                  <td className="p-3 text-cream">
                    {a.name}
                    {a.email && <div className="text-cream/50 text-xs">{a.email}</div>}
                  </td>
                  <td className="p-3 text-gold2 font-mono text-xs">{a.code}</td>
                  <td className="p-3 text-cream">{a.referralCount}</td>
                  <td className="p-3 text-cream">{a.activeCount}</td>
                  <td className="p-3 text-gold">{a.entries}</td>
                  <td className="p-3 text-cream">${a.revenue.toLocaleString()}</td>
                  <td className="p-3">
                    <button
                      onClick={() => copyLink(a.code)}
                      className="px-3 py-1 border border-gold/40 text-gold2 text-[0.55rem] tracking-[0.15em] uppercase hover:bg-gold hover:text-teal transition-all"
                    >
                      {copied === a.code ? "Copied!" : "Copy Link"}
                    </button>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(a.id, a.name)}
                      disabled={loading}
                      className="text-red-400/70 hover:text-red-400 text-[0.55rem] tracking-[0.15em] uppercase disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
