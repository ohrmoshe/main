// Shared drawing-date logic. First drawing is July 15th, 2026,
// then the 15th of every subsequent month.

const DRAWING_TZ = "America/Los_Angeles"
const EASTERN_TZ = "America/New_York"

// Offset (in ms) of a time zone from UTC at a given instant. Positive means
// ahead of UTC. For Pacific this is negative (-7h PDT, -8h PST).
function tzOffsetMs(timeZone: string, date: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
  const parts = dtf.formatToParts(date)
  const map: Record<string, string> = {}
  for (const p of parts) map[p.type] = p.value
  const asUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second),
  )
  return asUTC - date.getTime()
}

// Build the exact UTC instant for a Pacific wall-clock time (e.g. 8:00 PM on
// the 15th), correctly accounting for whether that date is in PST or PDT.
// month is 0-indexed. This is timezone-safe regardless of the server's TZ.
export function pacificWallClock(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
): Date {
  const guess = new Date(Date.UTC(year, month, day, hour, minute, 0))
  const offset = tzOffsetMs(DRAWING_TZ, guess)
  return new Date(guess.getTime() - offset)
}

// Like pacificWallClock, but for US Eastern time. Used for one-off overrides.
export function easternWallClock(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
): Date {
  const guess = new Date(Date.UTC(year, month, day, hour, minute, 0))
  const offset = tzOffsetMs(EASTERN_TZ, guess)
  return new Date(guess.getTime() - offset)
}

// Metadata for the drawing in a given month. Normally the 15th at 8:00 PM
// Pacific, with a one-off override for the August 2026 drawing, which is moved
// to August 16th at 7:00 PM Eastern.
function drawingMonthMeta(
  year: number,
  month: number,
): { date: Date; day: number; timeLabel: string } {
  if (year === 2026 && month === 7) {
    return { date: easternWallClock(2026, 7, 16, 19, 0), day: 16, timeLabel: "7:00 PM EST" }
  }
  return { date: pacificWallClock(year, month, 15, 20, 0), day: 15, timeLabel: "8:00 PM PST" }
}

// The entry CUTOFF for the drawing in (year, month). A charge is an entrant for
// a drawing when its timestamp falls in [previous drawing's cutoff, this
// drawing's cutoff). Normally the cutoff is the drawing instant itself (the
// 15th at 8:00 PM Pacific). For the August 2026 drawing (moved to Aug 16), the
// cutoff is the START of Aug 16 Pacific — so any renewal dated on Aug 16 rolls
// forward into the September drawing rather than counting for August.
function drawingCutoff(year: number, month: number): Date {
  if (year === 2026 && month === 7) {
    return pacificWallClock(2026, 7, 16, 0, 0)
  }
  return drawingMonthMeta(year, month).date
}

// The upcoming drawing (date + display metadata) relative to `now`.
export function getUpcomingDrawing(now: Date = new Date()): {
  date: Date
  day: number
  timeLabel: string
  year: number
  month: number
} {
  let year = 2026
  let month = 6 // July 2026 — first drawing
  let meta = drawingMonthMeta(year, month)
  while (meta.date.getTime() < now.getTime()) {
    month += 1
    if (month > 11) {
      month = 0
      year += 1
    }
    meta = drawingMonthMeta(year, month)
  }
  return { ...meta, year, month }
}

export function getDrawingDate(now: Date = new Date()): Date {
  return getUpcomingDrawing(now).date
}

// The precise window (in 8 PM Pacific cutoffs) for the upcoming drawing.
// Example: between July 15 8 PM and Aug 15 8 PM, this returns the Aug 15 window
// with start = July 15 8:00 PM PT and end = Aug 15 8:00 PM PT. Charges dated in
// [start, end) are the entrants for that drawing (including monthly renewals).
export function getDrawingWindow(now: Date = new Date()): {
  start: Date
  end: Date
  key: string
  label: string
  dateLabel: string
} {
  const meta = getUpcomingDrawing(now)
  // The window ENDS at this drawing's entry cutoff. Normally the drawing instant;
  // for the Aug 2026 drawing it's the start of Aug 16, so Aug 16 renewals roll
  // forward into September (see drawingCutoff).
  const end = drawingCutoff(meta.year, meta.month)
  // The window STARTS at the previous drawing's cutoff. For the inaugural
  // July 2026 drawing there is no prior drawing, so we count from the program
  // launch (June 1) — every June donation is an entrant for the July raffle.
  let start: Date
  if (meta.year === 2026 && meta.month === 6) {
    start = new Date(2026, 5, 1)
  } else {
    let prevYear = meta.year
    let prevMonth = meta.month - 1
    if (prevMonth < 0) {
      prevMonth = 11
      prevYear -= 1
    }
    start = drawingCutoff(prevYear, prevMonth)
  }
  const monthName = meta.date.toLocaleString("en-US", { month: "long", timeZone: DRAWING_TZ })
  const year = meta.date.toLocaleString("en-US", { year: "numeric", timeZone: DRAWING_TZ })
  const monthNum = String(meta.month + 1).padStart(2, "0")
  return {
    start,
    end,
    key: `${year}-${monthNum}`,
    label: `${monthName} ${year} Drawing`,
    dateLabel: `${monthName} ${meta.day}, ${year}`,
  }
}

// The start of the current drawing cycle: the most recent drawing that has
// already taken place, or the program launch date if no drawing has happened yet.
export function getCycleStart(now: Date = new Date()): Date {
  const programStart = new Date(2026, 5, 1) // June 1, 2026 — program launch
  const nextDrawing = getDrawingDate(now)
  // The drawing immediately before the upcoming one (accounting for overrides).
  let prevYear = nextDrawing.getFullYear()
  let prevMonth = nextDrawing.getMonth() - 1
  if (prevMonth < 0) {
    prevMonth = 11
    prevYear -= 1
  }
  const prevDrawing = drawingMonthMeta(prevYear, prevMonth).date
  // Only use the previous drawing as the cycle start if it has actually passed
  // AND is after launch; otherwise we're still in the inaugural cycle.
  if (prevDrawing.getTime() <= now.getTime() && prevDrawing.getTime() > programStart.getTime()) {
    return prevDrawing
  }
  return programStart
}

// How many entries a donor has for the CURRENT (upcoming) drawing.
// Base entries always count; promo bonus entries only count while we are still
// before the drawing they were granted for (bonusEntriesUntil). After that
// drawing passes, the bonus expires and the donor reverts to base entries.
export function isBonusActive(
  d: { bonusEntries?: number | null; bonusEntriesUntil?: Date | string | null },
  now: Date = new Date(),
): boolean {
  if (!d.bonusEntries || !d.bonusEntriesUntil) return false
  const until = d.bonusEntriesUntil instanceof Date ? d.bonusEntriesUntil : new Date(d.bonusEntriesUntil)
  return until.getTime() >= now.getTime()
}

export function effectiveEntries(
  d: { entries: number; bonusEntries?: number | null; bonusEntriesUntil?: Date | string | null },
  now: Date = new Date(),
): number {
  return d.entries + (isBonusActive(d, now) ? (d.bonusEntries || 0) : 0)
}

// --- Billing months (drawing-to-drawing windows) ---------------------------
// Each charge counts toward a single drawing, following the real drawing
// schedule and its entry cutoffs (see drawingCutoff). A charge is an entrant
// for the FIRST drawing whose cutoff is strictly after the charge.
//   • The inaugural July 15, 2026 drawing collects everything up to July 15 8 PM
//     PT — including every donation dated back in June.
//   • The August drawing collects July 15 8 PM PT up to (but excluding) Aug 16.
//   • Renewals dated on Aug 16 roll forward into the September drawing.
// Example: June 7 -> "2026-07" (July drawing). Aug 16 renewal -> "2026-09".

// Which scheduled drawing a charge counts toward, as {year, month} (0-indexed).
function getBillingDrawing(date: Date): { year: number; month: number } {
  const t = new Date(date).getTime()
  let year = 2026
  let month = 6 // July 2026 — first drawing
  while (drawingCutoff(year, month).getTime() <= t) {
    month += 1
    if (month > 11) {
      month = 0
      year += 1
    }
  }
  return { year, month }
}

// The drawing instant a given charge date counts toward.
export function getBillingDrawingDate(date: Date): Date {
  const { year, month } = getBillingDrawing(date)
  return drawingMonthMeta(year, month).date
}

// Stable sortable key for the billing window, e.g. "2026-07".
export function getBillingMonthKey(date: Date): string {
  const { year, month } = getBillingDrawing(date)
  const m = String(month + 1).padStart(2, "0")
  return `${year}-${m}`
}

// Human label for the billing window, e.g. "June 2026".
export function getBillingMonthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number)
  if (!y || !m) return key
  const d = new Date(y, m - 1, 15)
  return `${d.toLocaleString("en-US", { month: "long" })} ${y}`
}

function ordinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th"
  switch (day % 10) {
    case 1:
      return "st"
    case 2:
      return "nd"
    case 3:
      return "rd"
    default:
      return "th"
  }
}

export function getDrawingInfo(now: Date = new Date()) {
  const { date: raffleDate, day, timeLabel } = getUpcomingDrawing(now)
  const monthName = raffleDate.toLocaleString("en-US", { month: "long", timeZone: DRAWING_TZ })
  const year = raffleDate.toLocaleString("en-US", { year: "numeric", timeZone: DRAWING_TZ })
  const timeDiff = raffleDate.getTime() - now.getTime()
  const daysUntil = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)))

  return {
    dateLabel: `${monthName} ${day}${ordinalSuffix(day)}, ${year}`,
    timeLabel,
    daysUntil,
    targetTime: raffleDate.getTime(),
  }
}
