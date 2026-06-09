"use server"

import { db } from "@/lib/db"
import { donations } from "@/lib/db/schema"
import { gte, sql, and, or, eq } from "drizzle-orm"
import { getCycleStart } from "@/lib/drawing"

// Returns the total number of raffle entries active for the current drawing cycle.
// Active monthly subscribers count every cycle; one-time entries count for the
// cycle in which they were created.
export async function getEntryStats() {
  try {
    const cycleStart = getCycleStart()

    const [row] = await db
      .select({ total: sql<number>`COALESCE(SUM(${donations.entries}), 0)` })
      .from(donations)
      .where(
        or(
          // Active recurring subscribers are entered every month
          eq(donations.status, "active"),
          // One-time donations from the current cycle
          and(eq(donations.status, "one_time"), gte(donations.createdAt, cycleStart))
        )
      )

    const totalEntries = Number(row?.total ?? 0)
    return { totalEntries }
  } catch (error) {
    console.error("[v0] Error fetching entry stats:", error)
    return { totalEntries: 0 }
  }
}
