"use server"

import { db } from "@/lib/db"
import { donations } from "@/lib/db/schema"
import { sql, eq, and, or, isNull, gt } from "drizzle-orm"

// Returns the number of active monthly subscribers (people, not entries).
export async function getEntryStats() {
  try {
    const [row] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(donations)
      // A month-limited donation stays "active" until the admin dashboard next
      // syncs it, so also exclude any whose last drawing has already passed.
      .where(
        and(
          eq(donations.status, "active"),
          or(isNull(donations.endsAt), gt(donations.endsAt, new Date())),
        ),
      )

    const monthlySubscribers = Number(row?.count ?? 0)
    return { monthlySubscribers }
  } catch (error) {
    console.error("[v0] Error fetching entry stats:", error)
    return { monthlySubscribers: 0 }
  }
}
