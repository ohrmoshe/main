// Promo: HALF OFF, today only. Whoever subscribes (first month) or spins the
// prize wheel before midnight ET tonight pays 50% of the price.
// All logic is timezone-aware (America/New_York) so it works in both EST and EDT.

// The promo runs for the rest of the current ET calendar day and ends at
// midnight ET tonight (i.e. 00:00 of the next ET day). It automatically resets
// each day, so "today only" is always relative to whoever is viewing it.

// Master switch. Set to `true` to run the half-off promotion, `false` to turn
// it off everywhere (banner, popup, tier pricing, and wheel discount). While
// this is `false` the deal is considered inactive regardless of the date.
export const DEAL_ENABLED = false

// 50% off. Applied to subscriptions (first month) and to every wheel spin.
export const DEAL_DISCOUNT = 0.5

// Returns the offset of America/New_York from UTC, in minutes, at the given instant.
// Example: EDT (summer) => -240, EST (winter) => -300.
function nyOffsetMinutes(date: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  })
  const map: Record<string, number> = {}
  for (const part of dtf.formatToParts(date)) {
    if (part.type !== "literal") map[part.type] = Number(part.value)
  }
  const hour = map.hour === 24 ? 0 : map.hour
  const asIfUTC = Date.UTC(map.year, map.month - 1, map.day, hour, map.minute, map.second)
  return (asIfUTC - date.getTime()) / 60000
}

// Returns the ET wall-clock calendar date (year/month/day) for a given instant.
function nyCalendarDate(date: Date): { year: number; month: number; day: number } {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  })
  const map: Record<string, number> = {}
  for (const part of dtf.formatToParts(date)) {
    if (part.type !== "literal") map[part.type] = Number(part.value)
  }
  return { year: map.year, month: map.month, day: map.day }
}

// The instant of midnight ET tonight — i.e. 00:00 at the start of the ET day
// that follows `now`. Past this instant the deal is over (until it resets for
// the new day).
export function getDealDeadline(now: Date = new Date()): Date {
  const { year, month, day } = nyCalendarDate(now)
  // Midnight at the START of the *next* ET day = end of today.
  const approxUTC = Date.UTC(year, month - 1, day + 1, 0, 0, 0)
  const offsetMin = nyOffsetMinutes(new Date(approxUTC))
  return new Date(approxUTC - offsetMin * 60000)
}

// True only while the promo is enabled AND we are still before midnight ET tonight.
export function isDealActive(now: Date = new Date()): boolean {
  if (!DEAL_ENABLED) return false
  return now.getTime() < getDealDeadline(now).getTime()
}

// Apply the half-off promo to a cent amount, rounded to the nearest cent.
export function getDealPriceCents(originalCents: number): number {
  return Math.round(originalCents * DEAL_DISCOUNT)
}
