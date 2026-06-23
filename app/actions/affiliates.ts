"use server"

import { db } from "@/lib/db"
import { affiliates, donations } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { effectiveEntries } from "@/lib/drawing"
import { requireAdmin } from "@/lib/auth"

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

    return {
      ...a,
      referralCount: referred.length,
      activeCount: activeReferred.length,
      revenue: revenueCents / 100,
      entries,
    }
  })
}

export async function createAffiliate(data: {
  name: string
  email?: string
  phone?: string
  code?: string
  notes?: string
}) {
  await requireAdmin()
  const name = data.name.trim()
  if (!name) throw new Error("Name is required")

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
  })

  revalidatePath("/admin")
}

export async function deleteAffiliate(id: number) {
  await requireAdmin()
  await db.delete(affiliates).where(eq(affiliates.id, id))
  revalidatePath("/admin")
}
