// Shared drawing-date logic. First drawing is July 15th, 2026,
// then the 15th of every subsequent month.

export function getDrawingDate(now: Date = new Date()): Date {
  let raffleDate = new Date(2026, 6, 15, 20, 0, 0) // July 15, 2026, 8:00 PM
  while (raffleDate.getTime() < now.getTime()) {
    raffleDate = new Date(raffleDate.getFullYear(), raffleDate.getMonth() + 1, 15, 20, 0, 0)
  }
  return raffleDate
}

// The start of the current drawing cycle (the previous drawing date, or program start).
export function getCycleStart(now: Date = new Date()): Date {
  const programStart = new Date(2026, 5, 1) // June 1, 2026 — program launch
  const nextDrawing = getDrawingDate(now)
  // Previous drawing = one month before the next drawing
  const prevDrawing = new Date(nextDrawing.getFullYear(), nextDrawing.getMonth() - 1, 15, 20, 0, 0)
  return prevDrawing.getTime() < programStart.getTime() ? programStart : prevDrawing
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
