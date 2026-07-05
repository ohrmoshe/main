export function RaffleDateBanner() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  
  // Get last day of current month
  const lastDay = new Date(year, month + 1, 0).getDate()
  
  // Format the month name
  const monthName = now.toLocaleString('en-US', { month: 'long' })
  
  // Calculate days until raffle
  const raffleDate = new Date(year, month, lastDay)
  const timeDiff = raffleDate.getTime() - now.getTime()
  const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
  
  // Format the ordinal suffix for the day
  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th'
    switch (day % 10) {
      case 1: return 'st'
      case 2: return 'nd'
      case 3: return 'rd'
      default: return 'th'
    }
  }

  return (
    <div className="bg-gold/10 border-y border-gold/30 py-6 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-[0.6rem] tracking-[0.5em] uppercase text-gold mb-2">Next Drawing</div>
        <h3 className="font-heading text-3xl lg:text-4xl text-cream mb-2">
          {monthName} {lastDay}{getOrdinalSuffix(lastDay)}, {year}
        </h3>
        {daysUntil > 0 ? (
          <p className="text-gold2 text-lg">
            <span className="font-heading text-2xl">{daysUntil}</span> {daysUntil === 1 ? 'day' : 'days'} remaining
          </p>
        ) : (
          <p className="text-gold2 text-lg font-heading">Drawing Today!</p>
        )}
        <p className="text-foreground/50 text-xs mt-2 tracking-[0.1em]">
          Live drawing at 8:00 PM PST
        </p>
      </div>
    </div>
  )
}
