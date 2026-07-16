export function Winners() {
  const winners = [
    { month: "July 2026", name: "M. Doron", watch: "Rolex GMT-Master II · Root Beer", city: "Los Angeles, CA" },
    { month: "May 2026", name: "F. Schneider", watch: "Rolex GMT-Master II · Full Gold", city: "Jackson, NJ" },
    { month: "January 2026", name: "Y. Jacobowitz", watch: "Rolex Batman · GMT-Master II", city: "Lakewood, NJ" },
  ]

  return (
    <section className="py-16 md:py-20 px-5 lg:px-0 bg-cream" id="winners">
      <div className="w-full max-w-[1180px] mx-auto">
        <div className="text-center max-w-[740px] mx-auto mb-10">
          <div className="text-[0.76rem] font-extrabold tracking-[0.16em] uppercase text-gold mb-2.5">
            Past Drawings
          </div>
          <h2 className="font-heading text-[clamp(2.2rem,4vw,4rem)] font-light text-text leading-none tracking-[-0.035em]">
            Previous Winners
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {winners.map((winner) => (
            <article
              key={winner.month}
              className="bg-cream2 rounded-[26px] p-7 border border-teal/[0.08] shadow-[0_14px_35px_rgba(18,54,54,0.07)]"
            >
              <h3 className="font-heading text-[1.8rem] text-teal">{winner.month}</h3>
              <p className="my-2 text-muted-foreground">
                <strong className="text-text">{winner.name}</strong>
              </p>
              <p className="my-2 text-muted-foreground">{winner.watch}</p>
              <p className="my-2 text-muted-foreground">{winner.city}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
