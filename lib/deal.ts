// Promo: subscribe before the fixed deadline below and every entry is doubled.
// All logic is timezone-aware (America/New_York) so it works in both EST and EDT.

// Fixed promo end: June 21, 2026 at 11:59 PM ET. Past this instant the deal is over.
// Defined as the wall-clock date/time in ET; the exact UTC instant is computed below.
const DEAL_END_ET = { year: 2026, month: 6, day: 21, hour: 23, minute: 59 }

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

// The fixed instant corresponding to the ET wall-clock deadline (June 21, 2026 11:59 PM ET).
export function getDealDeadline(_now: Date = new Date()): Date {
  // First approximate the UTC instant assuming the ET wall-clock is UTC, then
  // correct using the ET offset that applies at that instant (handles EST/EDT).
  const approxUTC = Date.UTC(
    DEAL_END_ET.year,
    DEAL_END_ET.month - 1,
    DEAL_END_ET.day,
    DEAL_END_ET.hour,
    DEAL_END_ET.minute,
    0,
  )
  const offsetMin = nyOffsetMinutes(new Date(approxUTC))
  return new Date(approxUTC - offsetMin * 60000)
}

// True only while we are before the fixed June 21, 2026 11:59 PM ET deadline.
export function isDealActive(now: Date = new Date()): boolean {
  return now.getTime() < getDealDeadline(now).getTime()
}
