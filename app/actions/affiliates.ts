"use server"

import { db } from "@/lib/db"
import { affiliates, donations } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { effectiveEntries } from "@/lib/drawing"
import { requireAdmin, requireAffiliate, hashAffiliatePassword } from "@/lib/auth"

function slugifyCode(raw: string) {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
}

export async function getAffiliates() {
  await requireAdmin()
  return db.select().from(affiliates).orderBy(desc(affiliates.createdAt))
}

// Returns affiliates joined with their referral performance (donors + revenue + entries)
export async function getAffiliateStats() {
  await requireAdmin()
  const [affiliateList, allDonations] = await Promise.all([
    db.select().from(affiliates).orderBy(desc(affiliates.createdAt)),
    db.select().from(donations),
  ])

  return affiliateList.map((a) => {
    const referred = allDonations.filter((d) => d.referralCode === a.code)
    const activeReferred = referred.filter((d) => d.status === "active" || d.status === "one_time")
    const revenueCents = activeReferred.reduce((sum, d) => sum + d.amountCents, 0)
    const entries = activeReferred.reduce((sum, d) => sum + effectiveEntries(d), 0)

    // Never leak the password hash to the client — expose only whether one is set.
    const { passwordHash, ...safe } = a
    return {
      ...safe,
      hasPassword: !!passwordHash,
      referralCount: referred.length,
      activeCount: activeReferred.length,
      revenue: revenueCents / 100,
      entries,
    }
  })
}

// Admin: set or reset an affiliate's portal password.
export async function setAffiliatePassword(id: number, password: string) {
  await requireAdmin()
  const pw = password.trim()
  if (pw.length < 6) throw new Error("Password must be at least 6 characters")
  await db.update(affiliates).set({ passwordHash: hashAffiliatePassword(pw) }).where(eq(affiliates.id, id))
  revalidatePath("/admin")
}

// Affiliate portal: the donors this logged-in affiliate personally referred.
export async function getMyReferrals() {
  const code = await requireAffiliate()
  const [me] = await db.select().from(affiliates).where(eq(affiliates.code, code)).limit(1)
  const referred = await db
    .select()
    .from(donations)
    .where(eq(donations.referralCode, code))
    .orderBy(desc(donations.createdAt))

  const active = referred.filter((d) => d.status === "active" || d.status === "one_time")
  const revenueCents = active.reduce((sum, d) => sum + d.amountCents, 0)
  const entries = active.reduce((sum, d) => sum + effectiveEntries(d), 0)

  return {
    affiliate: { name: me?.name ?? "Affiliate", code },
    summary: {
      referralCount: referred.length,
      activeCount: active.length,
      revenue: revenueCents / 100,
      entries,
    },
    donors: referred.map((d) => ({
      id: d.id,
      name: d.name,
      email: d.email,
      phone: d.phone,
      status: d.status,
      entries: effectiveEntries(d),
      amount: d.amountCents / 100,
      createdAt: d.createdAt,
    })),
  }
}

// Affiliate portal: CSV of the donors this logged-in affiliate referred,
// including phone numbers. Scoped to the caller's own referral code.
export async function exportMyReferralsCSV(): Promise<string> {
  const code = await requireAffiliate()
  const referred = await db
    .select()
    .from(donations)
    .where(eq(donations.referralCode, code))
    .orderBy(desc(donations.createdAt))

  const headers = ["Name", "Email", "Phone", "Status", "Entries", "Amount ($)", "Date"]
  const rows = referred.map((d) => [
    d.name,
    d.email,
    d.phone || "",
    d.status === "one_time" ? "one-time" : d.status,
    String(effectiveEntries(d)),
    (d.amountCents / 100).toFixed(2),
    d.createdAt ? new Date(d.createdAt).toISOString() : "",
  ])

  // Guard against spreadsheet formula injection, then quote/escape each cell.
  const csvCell = (value: unknown) => {
    let s = String(value ?? "")
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s
    return `"${s.replace(/"/g, '""')}"`
  }

  return [headers.join(","), ...rows.map((r) => r.map(csvCell).join(","))].join("\n")
}

export async function createAffiliate(data: {
  name: string
  email?: string
  phone?: string
  code?: string
  notes?: string
  password?: string
}) {
  await requireAdmin()
  const name = data.name.trim()
  if (!name) throw new Error("Name is required")

  const pw = data.password?.trim()
  if (pw && pw.length < 6) throw new Error("Password must be at least 6 characters")

  // Use provided code or derive one from the name
  let code = slugifyCode(data.code || name)
  if (!code) throw new Error("Could not generate a referral code")

  // Ensure uniqueness by appending a numeric suffix if needed
  const existing = await db.select().from(affiliates)
  const taken = new Set(existing.map((a) => a.code))
  if (taken.has(code)) {
    let suffix = 2
    while (taken.has(`${code}-${suffix}`)) suffix++
    code = `${code}-${suffix}`
  }

  await db.insert(affiliates).values({
    name,
    email: data.email?.trim() || null,
    phone: data.phone?.trim() || null,
    code,
    notes: data.notes?.trim() || null,
    passwordHash: pw ? hashAffiliatePassword(pw) : null,
  })

  revalidatePath("/admin")
}

export async function deleteAffiliate(id: number) {
  await requireAdmin()
  await db.delete(affiliates).where(eq(affiliates.id, id))
  revalidatePath("/admin")
}
