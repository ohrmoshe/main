// Promo: subscribe before 8:00 PM Eastern today and every entry is doubled.
// All logic is timezone-aware (America/New_York) so it works in both EST and EDT.

export const DEAL_END_HOUR = 20 // 8:00 PM

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

// The instant corresponding to today at 8:00 PM America/New_York.
export function getDealDeadline(now: Date = new Date()): Date {
  const offsetMin = nyOffsetMinutes(now)
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  })
  const map: Record<string, number> = {}
  for (const part of dtf.formatToParts(now)) {
    if (part.type !== "literal") map[part.type] = Number(part.value)
  }
  const wallClockAsUTC = Date.UTC(map.year, map.month - 1, map.day, DEAL_END_HOUR, 0, 0)
  return new Date(wallClockAsUTC - offsetMin * 60000)
}

// True while we are before today's 8:00 PM ET deadline.
export function isDealActive(now: Date = new Date()): boolean {
  return now.getTime() < getDealDeadline(now).getTime()
}
