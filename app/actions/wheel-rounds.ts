"use server"

import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { requireAdmin } from "@/lib/auth"
import { WHEEL_MAX } from "@/lib/products"
import { revalidatePath } from "next/cache"

export type ArchivedRound = {
  label: string
  spins: number
  firstSpin: string | null
  lastSpin: string | null
  archivedAt: string | null
}

export type WheelRoundsInfo = {
  liveTaken: number
  liveAvailable: number
  rounds: ArchivedRound[]
}

function rowsOf<T>(result: unknown): T[] {
  const r = result as { rows?: T[] }
  return Array.isArray(r?.rows) ? r.rows : (result as T[]) ?? []
}

// Postgres `timestamp` columns come back without a zone (e.g. "2026-08-16 22:52:47").
// They are stored in UTC, so tag them as UTC before converting to an ISO string —
// otherwise Node would read them in the server's local time.
function toIso(value: string | Date | null): string | null {
  if (!value) return null
  if (value instanceof Date) return value.toISOString()
  const normalized = /[Zz]|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value.replace(" ", "T")}Z`
  const d = new Date(normalized)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

/** Live wheel usage plus a summary of every archived (finished) round. */
export async function getWheelRounds(): Promise<WheelRoundsInfo> {
  await requireAdmin()
  try {
    const liveResult = await db.execute(sql`SELECT COUNT(*)::int AS c FROM wheel_numbers`)
    const liveTaken = Number(rowsOf<{ c: number }>(liveResult)[0]?.c ?? 0)

    const roundsResult = await db.execute(sql`
      SELECT round_label            AS label,
             COUNT(*)::int          AS spins,
             MIN(spun_at)           AS first_spin,
             MAX(spun_at)           AS last_spin,
             MAX(archived_at)       AS archived_at
      FROM wheel_number_archive
      GROUP BY round_label
      ORDER BY MAX(archived_at) DESC
    `)

    const rounds = rowsOf<{
      label: string
      spins: number
      first_spin: string | Date | null
      last_spin: string | Date | null
      archived_at: string | Date | null
    }>(roundsResult).map((r) => ({
      label: r.label || "Untitled round",
      spins: Number(r.spins),
      firstSpin: toIso(r.first_spin),
      lastSpin: toIso(r.last_spin),
      archivedAt: toIso(r.archived_at),
    }))

    return { liveTaken, liveAvailable: Math.max(0, WHEEL_MAX - liveTaken), rounds }
  } catch (error) {
    console.error("[v0] Error loading wheel rounds:", error)
    return { liveTaken: 0, liveAvailable: WHEEL_MAX, rounds: [] }
  }
}

/**
 * Close out the current round and start a fresh one.
 *
 * Every completed spin on the live wheel is copied into `wheel_number_archive`
 * under `label` and deleted from `wheel_numbers`, so all of those numbers become
 * available again. In-flight reservations (rows with no Stripe payment intent
 * yet) are left alone so a spin happening at this exact moment isn't broken.
 * Donation, transaction, and raffle-entry records are never modified.
 */
export async function startNewWheelRound(label: string): Promise<{ archived: number; label: string }> {
  await requireAdmin()

  const trimmed = label.trim()
  if (!trimmed) throw new Error("Give this round a name so you can find it later.")
  if (trimmed.length > 60) throw new Error("Round name is too long (60 characters max).")

  const existing = await db.execute(
    sql`SELECT COUNT(*)::int AS c FROM wheel_number_archive WHERE round_label = ${trimmed}`,
  )
  if (Number(rowsOf<{ c: number }>(existing)[0]?.c ?? 0) > 0) {
    throw new Error(`"${trimmed}" already exists. Pick a different name.`)
  }

  const result = await db.execute(sql`
    WITH moved AS (
      DELETE FROM wheel_numbers
      WHERE stripe_payment_intent_id IS NOT NULL
      RETURNING number, donor_name, donor_email, donor_phone, amount_cents,
                stripe_payment_intent_id, referral_code, created_at
    )
    INSERT INTO wheel_number_archive
      (round_label, number, donor_name, donor_email, donor_phone, amount_cents,
       stripe_payment_intent_id, referral_code, spun_at)
    SELECT ${trimmed}, number, donor_name, donor_email, donor_phone, amount_cents,
           stripe_payment_intent_id, referral_code, created_at
    FROM moved
    RETURNING number
  `)

  const archived = rowsOf<{ number: number }>(result).length
  console.log(`[v0] Started new wheel round; archived ${archived} spins as "${trimmed}".`)

  revalidatePath("/admin")
  revalidatePath("/")

  return { archived, label: trimmed }
}
