"use client"

import { useState } from "react"
import { createOfferLink, deleteOfferLink, type OfferLinkRow } from "@/app/actions/offer"

export function OfferLinksManager({ initialLinks }: { initialLinks: OfferLinkRow[] }) {
  const [links, setLinks] = useState<OfferLinkRow[]>(initialLinks)
  const [label, setLabel] = useState("")
  const [creating, setCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const linkUrl = (token: string) => `${origin}/offer/${token}`

  const handleCreate = async () => {
    setCreating(true)
    try {
      const row = await createOfferLink(label)
      setLinks((prev) => [row, ...prev])
      setLabel("")
      // Copy the fresh link right away for convenience.
      await copy(row.id, linkUrl(row.token))
    } catch (error) {
      console.error("Error creating offer link:", error)
      alert("Failed to create link. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  const copy = async (id: number, url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 2000)
    } catch {
      // Clipboard can fail on insecure origins; select-and-copy fallback.
      window.prompt("Copy this link:", url)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this offer link? If it hasn't been used yet, it will stop working.")) return
    setDeletingId(id)
    try {
      await deleteOfferLink(id)
      setLinks((prev) => prev.filter((l) => l.id !== id))
    } catch (error) {
      console.error("Error deleting offer link:", error)
      alert("Failed to delete. Please try again.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="mb-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="font-heading text-2xl text-cream">Win-Back Offer Links</h2>
          <p className="text-cream/60 text-sm mt-1 max-w-2xl">
            Generate a private, one-time link for a cancelled donor. The base plan is $26/mo (normally $36) and every
            other plan is 10% off, with the same entries. Each link works only once, then expires automatically.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 mb-6">
        <label className="flex flex-col gap-1 flex-1 min-w-[220px]">
          <span className="text-[0.6rem] tracking-[0.2em] uppercase text-gold">Label (optional)</span>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. David Cohen — cancelled Jul"
            className="bg-teal border border-gold/30 text-cream px-3 py-2 text-sm focus:border-gold outline-none"
          />
        </label>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="px-6 py-2 border border-gold bg-gold text-teal text-xs tracking-[0.2em] uppercase transition-all hover:bg-gold2 disabled:opacity-50"
        >
          {creating ? "Generating..." : "+ Generate Link"}
        </button>
      </div>

      <div className="border border-gold/20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/20 bg-teal2">
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Label</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Link</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Status</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Created</th>
              <th className="text-left p-3 text-[0.6rem] tracking-[0.2em] uppercase text-gold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {links.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-cream/50">
                  No offer links yet. Generate one above to send to a cancelled donor.
                </td>
              </tr>
            ) : (
              links.map((link) => (
                <tr key={link.id} className="border-b border-gold/10 hover:bg-gold/5">
                  <td className="p-3 text-cream">{link.label || "-"}</td>
                  <td className="p-3 text-cream/70 font-mono text-xs max-w-[280px] truncate">
                    {linkUrl(link.token)}
                  </td>
                  <td className="p-3">
                    {link.redeemed ? (
                      <span className="px-2 py-1 text-[0.55rem] tracking-[0.15em] uppercase bg-red-500/20 text-red-400">
                        Used{link.redeemedEmail ? ` · ${link.redeemedEmail}` : ""}
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-[0.55rem] tracking-[0.15em] uppercase bg-green-500/20 text-green-400">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-cream/60 text-xs">
                    {link.createdAt ? new Date(link.createdAt).toLocaleDateString() : "-"}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => copy(link.id, linkUrl(link.token))}
                        disabled={link.redeemed}
                        className="text-[0.55rem] tracking-[0.15em] uppercase text-gold2/80 border border-gold/30 px-1.5 py-0.5 hover:border-gold hover:text-gold disabled:opacity-40"
                      >
                        {copiedId === link.id ? "Copied!" : "Copy"}
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
                        disabled={deletingId === link.id}
                        className="text-[0.55rem] tracking-[0.15em] uppercase text-red-400/80 border border-red-500/30 px-1.5 py-0.5 hover:border-red-500 hover:text-red-400 disabled:opacity-50"
                      >
                        {deletingId === link.id ? "..." : "Delete"}
                      </button>
                    </div>
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
