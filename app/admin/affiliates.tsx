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

export function AffiliatesSection({
  initialAffiliates,
  siteUrl,
}: {
  initialAffiliates: AffiliateStat[]
  siteUrl: string
}) {
  const [affiliates] = useState<AffiliateStat[]>(initialAffiliates)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const refLink = (code: string) => `${siteUrl}/?ref=${code}`

  const handleCreate = async (formData: FormData) => {
    setSubmitting(true)
    try {
      await createAffiliate({
        name: String(formData.get("name") || ""),
        email: String(formData.get("email") || ""),
        phone: String(formData.get("phone") || ""),
        code: String(formData.get("code") || ""),
        notes: String(formData.get("notes") || ""),
      })
      setShowForm(false)
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create affiliate")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Remove affiliate "${name}"? Their past referrals will stay attributed in the data.`)) return
    try {
      await deleteAffiliate(id)
    } catch {
      alert("Failed to remove affiliate")
    }
  }

  const handleCopy = async (id: number, code: string) => {
    try {
      await navigator.clipboard.writeText(refLink(code))
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch {
      // no-op
    }
  }

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-3xl text-cream">Affiliates</h2>
          <p className="text-cream/70 text-sm">Track donations attributed to each referral link</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="px-5 py-2 border border-gold bg-transparent text-gold2 text-xs tracking-[0.2em] uppercase transition-all hover:bg-gold hover:text-teal"
        >
          {showForm ? "Cancel" : "Add Affiliate"}
        </button>
      </div>

      {showForm && (
        <form
          action={handleCreate}
          className="grid gap-4 md:grid-cols-2 mb-8 p-5 border border-gold/20 bg-teal2"
        >
          <Field label="Name *" name="name" required />
          <Field label="Referral Code (optional)" name="code" placeholder="auto-generated from name" />
          <Field label="Email" name="email" type="email" />
          <Field label="Phone" name="phone" />
          <div className="md:col-span-2">
            <Field label="Notes" name="notes" />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 border border-gold bg-gold text-teal text-xs tracking-[0.2em] uppercase transition-all hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Create Affiliate"}
            </button>
          </div>
        </form>
      )}

      <div className="border border-gold/20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/20 bg-teal2">
              <Th>Name</Th>
              <Th>Referral Link</Th>
              <Th>Referrals</Th>
              <Th>Active</Th>
              <Th>Entries</Th>
              <Th>Revenue</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {affiliates.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-cream/50">
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
                  <td className="p-3">
                    <button
                      onClick={() => handleCopy(a.id, a.code)}
                      className="text-gold2 hover:text-gold text-xs underline underline-offset-2 break-all text-left"
                      title="Copy referral link"
                    >
                      {copiedId === a.id ? "Copied!" : `/?ref=${a.code}`}
                    </button>
                  </td>
                  <td className="p-3 text-cream">{a.referralCount}</td>
                  <td className="p-3 text-gold">{a.activeCount}</td>
                  <td className="p-3 text-cream">{a.entries}</td>
                  <td className="p-3 text-cream">${a.revenue.toLocaleString()}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(a.id, a.name)}
                      className="text-red-400/70 hover:text-red-400 text-xs tracking-[0.15em] uppercase"
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

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">{children}</th>
  )
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="block text-[0.6rem] tracking-[0.2em] uppercase text-gold mb-1">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full bg-teal border border-gold/30 px-3 py-2 text-cream text-sm focus:border-gold focus:outline-none placeholder:text-cream/30"
      />
    </label>
  )
}
