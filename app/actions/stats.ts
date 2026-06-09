"use server"

import { db } from "@/lib/db"
import { donations } from "@/lib/db/schema"
import { sql, eq } from "drizzle-orm"

// Returns the number of active monthly subscribers (people, not entries).
export async function getEntryStats() {
  try {
    const [row] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(donations)
      .where(eq(donations.status, "active"))

    const monthlySubscribers = Number(row?.count ?? 0)
    return { monthlySubscribers }
  } catch (error) {
    console.error("[v0] Error fetching entry stats:", error)
    return { monthlySubscribers: 0 }
  }
}
