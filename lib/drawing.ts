// Shared drawing-date logic. First drawing is July 15th, 2026,
// then the 15th of every subsequent month.

export function getDrawingDate(now: Date = new Date()): Date {
  let raffleDate = new Date(2026, 6, 15, 20, 0, 0) // July 15, 2026, 8:00 PM
  while (raffleDate.getTime() < now.getTime()) {
    raffleDate = new Date(raffleDate.getFullYear(), raffleDate.getMonth() + 1, 15, 20, 0, 0)
  }
  return raffleDate
}

// The start of the current drawing cycle: the most recent drawing that has
// already taken place, or the program launch date if no drawing has happened yet.
export function getCycleStart(now: Date = new Date()): Date {
  const programStart = new Date(2026, 5, 1) // June 1, 2026 — program launch
  const nextDrawing = getDrawingDate(now)
  // The drawing immediately before the upcoming one
  const prevDrawing = new Date(nextDrawing.getFullYear(), nextDrawing.getMonth() - 1, 15, 20, 0, 0)
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

// --- Billing months (15th-to-15th windows) ---------------------------------
// A charge counts toward the drawing on the 15th. The window runs from the 15th
// of one month to the 15th of the next. A charge dated BEFORE the 15th belongs
// to the window ENDING on the 15th of that same month; a charge on/after the
// 15th belongs to the window ending on the 15th of the NEXT month.
// Example: June 7 -> "2026-06" (June 15 drawing). June 20 -> "2026-07" (July 15).

// The drawing date (the 15th) a given charge date counts toward.
export function getBillingDrawingDate(date: Date): Date {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = d.getMonth()
  if (d.getDate() < 15) {
    return new Date(year, month, 15, 20, 0, 0)
  }
  return new Date(year, month + 1, 15, 20, 0, 0)
}

// Stable sortable key for the billing window, e.g. "2026-06".
export function getBillingMonthKey(date: Date): string {
  const drawing = getBillingDrawingDate(date)
  const y = drawing.getFullYear()
  const m = String(drawing.getMonth() + 1).padStart(2, "0")
  return `${y}-${m}`
}

// Human label for the billing window, e.g. "June 2026".
export function getBillingMonthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number)
  if (!y || !m) return key
  const d = new Date(y, m - 1, 15)
  return `${d.toLocaleString("en-US", { month: "long" })} ${y}`
}

export function getDrawingInfo(now: Date = new Date()) {
  const raffleDate = getDrawingDate(now)
  const monthName = raffleDate.toLocaleString("en-US", { month: "long" })
  const year = raffleDate.getFullYear()
  const timeDiff = raffleDate.getTime() - now.getTime()
  const daysUntil = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)))

  return {
    dateLabel: `${monthName} 15th, ${year}`,
    daysUntil,
    targetTime: raffleDate.getTime(),
  }
}
