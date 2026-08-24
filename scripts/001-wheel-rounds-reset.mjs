// One-time migration: create the wheel round archive and reset the prize wheel
// as of Aug 16, 2026 7:00 PM Eastern (= 2026-08-16 23:00 UTC).
//
// Every spin BEFORE the cutoff is copied into `wheel_number_archive` as
// "Round 1" and removed from `wheel_numbers`, which frees those numbers for the
// new round. Spins at/after the cutoff stay on the live wheel. Donation and
// transaction records are intentionally left untouched.
//
// Run with:
//   node --env-file-if-exists=/vercel/share/.env.project scripts/001-wheel-rounds-reset.mjs

import pg from "pg"

const CUTOFF_UTC = "2026-08-16 23:00:00" // 7:00 PM America/New_York (EDT, UTC-4)
const ROUND_LABEL = "Round 1"

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS wheel_number_archive (
      id SERIAL PRIMARY KEY,
      round_label TEXT NOT NULL DEFAULT '',
      number INTEGER NOT NULL,
      donor_name TEXT,
      donor_email TEXT,
      donor_phone TEXT,
      amount_cents INTEGER NOT NULL DEFAULT 0,
      stripe_payment_intent_id TEXT,
      referral_code TEXT,
      spun_at TIMESTAMP,
      archived_at TIMESTAMP DEFAULT NOW()
    )
  `)
  await client.query(
    `CREATE INDEX IF NOT EXISTS wheel_number_archive_round_idx ON wheel_number_archive (round_label)`,
  )

  const { rows: already } = await client.query(
    `SELECT COUNT(*)::int AS c FROM wheel_number_archive WHERE round_label = $1`,
    [ROUND_LABEL],
  )
  if (already[0].c > 0) {
    console.log(`[v0] ${ROUND_LABEL} already archived (${already[0].c} spins). Nothing to do.`)
  } else {
    await client.query("BEGIN")
    const { rows: moved } = await client.query(
      `WITH moved AS (
         DELETE FROM wheel_numbers
         WHERE created_at < $1::timestamp
         RETURNING number, donor_name, donor_email, donor_phone, amount_cents,
                   stripe_payment_intent_id, referral_code, created_at
       )
       INSERT INTO wheel_number_archive
         (round_label, number, donor_name, donor_email, donor_phone, amount_cents,
          stripe_payment_intent_id, referral_code, spun_at)
       SELECT $2, number, donor_name, donor_email, donor_phone, amount_cents,
              stripe_payment_intent_id, referral_code, created_at
       FROM moved
       RETURNING number`,
      [CUTOFF_UTC, ROUND_LABEL],
    )
    await client.query("COMMIT")
    console.log(`[v0] Archived ${moved.length} spins into "${ROUND_LABEL}".`)
  }

  const { rows: live } = await client.query(
    `SELECT COUNT(*)::int AS c FROM wheel_numbers`,
  )
  console.log(`[v0] Live wheel now has ${live[0].c} numbers taken.`)
} catch (err) {
  await client.query("ROLLBACK").catch(() => {})
  throw err
} finally {
  await client.end()
}
