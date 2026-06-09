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
