export function Winners() {
  const winners = [
    { month: "May 2026", name: "F. Schneider", watch: "Rolex GMT-Master II", detail: "Full Gold", city: "Jackson, NJ" },
    { month: "January 2026", name: "Y. Jacobowitz", watch: "Rolex Batman", detail: "GMT-Master II", city: "Lakewood, NJ" },
  ]

  return (
    <section className="py-24 px-6 lg:px-16 bg-gradient-to-b from-teal2 to-teal" id="winners">
      <div className="text-center max-w-[600px] mx-auto">
        <div className="text-[0.6rem] tracking-[0.5em] uppercase text-gold mb-3">Past Drawings</div>
        <h2 className="font-heading text-[clamp(2rem,4vw,3.2rem)] font-light text-cream leading-[1.15] mb-8">
          Previous Winners
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-14 max-w-3xl mx-auto">
        {winners.map((winner) => (
          <WinnerCard key={winner.month} {...winner} />
        ))}
      </div>
    </section>
  )
}

function WinnerCard({ 
  month, 
  name, 
  watch, 
  detail, 
  city 
}: { 
  month: string
  name: string
  watch: string
  detail: string
  city: string 
}) {
  return (
    <div className="relative p-7 border border-gold/[0.12] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold to-transparent" />
      <div className="text-[0.6rem] tracking-[0.35em] uppercase text-gold mb-2">{month}</div>
      <div className="font-heading text-xl font-normal text-cream mb-1">{name}</div>
      <div className="text-xs text-foreground/50 tracking-[0.05em]">
        <em className="text-gold2 not-italic">{watch}</em> · {detail}
      </div>
      <div className="text-[0.65rem] tracking-[0.2em] uppercase text-foreground/35 mt-2">{city}</div>
    </div>
  )
}
