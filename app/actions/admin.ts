"use server"

import { db } from "@/lib/db"
import { donations } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { effectiveEntries, isBonusActive } from "@/lib/drawing"
import { requireAdmin } from "@/lib/auth"

type DonationFilter = "all" | "active" | "cancelled" | "one_time"

// FIX (#8): neutralize spreadsheet formula injection. A cell starting with = + - @ (or tab/CR) is
// treated as a live formula by Excel/Sheets, so prefix those with a single quote before quoting.
function csvCell(value: unknown): string {
  let s = String(value ?? "")
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s
  return `"${s.replace(/"/g, '""')}"`
}

// Manually add a donor who gave outside the website (e.g. cash, check, or a
// donation made without a referral link). Status is either "active" (monthly) or "one_time".
export async function addManualDonation(data: {
  name: string
  email: string
  phone?: string
  entries: number
  amountDollars: number
  status: "active" | "one_time"
  referralCode?: string
}) {
  await requireAdmin()
  const name = data.name.trim()
  const email = data.email.trim()
  if (!name) throw new Error("Name is required")
  if (!email) throw new Error("Email is required")

  const entries = Math.max(0, Math.round(Number(data.entries) || 0))
  const amountCents = Math.max(0, Math.round((Number(data.amountDollars) || 0) * 100))

  await db.insert(donations).values({
    name,
    email,
    phone: data.phone?.trim() || null,
    entries,
    amountCents,
    status: data.status,
    referralCode: data.referralCode?.trim() || null,
  })

  revalidatePath("/admin")
  return { success: true }
}

// Override the entry count for an existing donor (e.g. honoring a special rate).
export async function updateDonationEntries(id: number, entries: number) {
  await requireAdmin()
  const newEntries = Math.max(0, Math.round(Number(entries) || 0))
  await db
    .update(donations)
    .set({ entries: newEntries, updatedAt: new Date() })
    .where(eq(donations.id, id))

  revalidatePath("/admin")
  return { success: true }
}

// Permanently remove a donor record (e.g. test entries added during setup).
export async function deleteDonation(id: number) {
  await requireAdmin()
  await db.delete(donations).where(eq(donations.id, id))
  revalidatePath("/admin")
  return { success: true }
}

export async function getDonations(filter: DonationFilter = "all") {
  await requireAdmin()
  if (filter === "active" || filter === "cancelled" || filter === "one_time") {
    const results = await db
      .select()
      .from(donations)
      .where(eq(donations.status, filter))
      .orderBy(desc(donations.createdAt))
    return results
  }

  return db.select().from(donations).orderBy(desc(donations.createdAt))
}

export async function getDonationStats() {
  await requireAdmin()
  const allDonations = await db.select().from(donations)

  const active = allDonations.filter((d) => d.status === "active")
  const cancelled = allDonations.filter((d) => d.status === "cancelled")
  const oneTime = allDonations.filter((d) => d.status === "one_time")

  const monthlyRevenue = active.reduce((sum, d) => sum + d.amountCents, 0)
  const oneTimeRevenue = oneTime.reduce((sum, d) => sum + d.amountCents, 0)
  // Total collected = recurring monthly revenue + all one-time donations
  const totalRevenue = monthlyRevenue + oneTimeRevenue

  // Entries split by type — counts toward THIS month's drawing, so promo bonus
  // entries are included only while they are still valid (effectiveEntries).
  const now = new Date()
  const monthlyEntries = active.reduce((sum, d) => sum + effectiveEntries(d, now), 0)
  const oneTimeEntries = oneTime.reduce((sum, d) => sum + effectiveEntries(d, now), 0)
  const totalEntries = monthlyEntries + oneTimeEntries

  return {
    totalDonors: allDonations.length,
    activeDonors: active.length,
    cancelledDonors: cancelled.length,
    oneTimeDonors: oneTime.length,
    monthlyRevenue: monthlyRevenue / 100,
    oneTimeRevenue: oneTimeRevenue / 100,
    totalRevenue: totalRevenue / 100,
    monthlyEntries,
    oneTimeEntries,
    totalEntries,
  }
}

export async function exportDonationsCSV(filter: DonationFilter = "all") {
  await requireAdmin()
  const data = await getDonations(filter)

  const now = new Date()

  const headers = [
    "ID",
    "Name",
    "Email",
    "Phone",
    "Address",
    "City",
    "State",
    "Postal Code",
    "Country",
    "Base Entries",
    "Bonus Entries (This Drawing)",
    "Total Entries (This Drawing)",
    "Amount ($)",
    "Status",
    "Created At",
    "Cancelled At",
  ]

  const rows = (Array.isArray(data) ? data : []).map((d) => [
    d.id,
    d.name,
    d.email,
    d.phone || "",
    d.addressLine1 || "",
    d.addressCity || "",
    d.addressState || "",
    d.addressPostalCode || "",
    d.addressCountry || "",
    d.entries,
    isBonusActive(d, now) ? d.bonusEntries : 0,
    effectiveEntries(d, now),
    (d.amountCents / 100).toFixed(2),
    d.status,
    d.createdAt ? new Date(d.createdAt).toISOString() : "",
    d.cancelledAt ? new Date(d.cancelledAt).toISOString() : "",
  ])

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map(csvCell).join(",")),
  ].join("\n")

  return csvContent
}
