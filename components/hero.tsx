import Image from "next/image"
import Link from "next/link"

function getDrawingInfo() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const lastDay = new Date(year, month + 1, 0).getDate()
  const monthName = now.toLocaleString("en-US", { month: "long" })

  const raffleDate = new Date(year, month, lastDay)
  const timeDiff = raffleDate.getTime() - now.getTime()
  const daysUntil = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)))

  const getOrdinal = (day: number) => {
    if (day > 3 && day < 21) return "th"
    switch (day % 10) {
      case 1: return "st"
      case 2: return "nd"
      case 3: return "rd"
      default: return "th"
    }
  }

  return { dateLabel: `${monthName} ${lastDay}${getOrdinal(lastDay)}, ${year}`, daysUntil }
}

export function Hero() {
  const { dateLabel, daysUntil } = getDrawingInfo()

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-teal text-cream pt-28 pb-16 md:pt-32 md:pb-24 px-5 lg:px-0"
      style={{
        backgroundImage:
          "radial-gradient(circle at 80% 5%, rgba(225,192,141,0.28), transparent 34%), linear-gradient(135deg, var(--teal), var(--teal2))",
      }}
    >
      <div className="w-full max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_.95fr] gap-12 lg:gap-14 items-center">
        {/* Left column */}
        <div>
          <Image
            src="/images/watchnlearn-logo.png"
            alt="Watch & Learn"
            width={210}
            height={105}
            priority
            className="w-[min(210px,60vw)] h-auto mb-6 drop-shadow-[0_4px_32px_rgba(200,155,92,0.18)]"
          />
          <div className="text-[0.76rem] font-extrabold tracking-[0.16em] uppercase text-gold mb-4">
            Support a Kollel · Win a Watch
          </div>
          <h1 className="font-heading font-light text-[clamp(3rem,7vw,6.5rem)] leading-[0.95] tracking-[-0.03em] mb-6">
            Timeless Watches.
            <span className="block text-gold2">Eternal Impact.</span>
          </h1>
          <p className="text-[1.05rem] leading-relaxed text-cream/85 max-w-[560px] mb-7">
            Every donation fuels a Kollel dedicated to Torah learning. As a token of our gratitude, you&apos;ll be
            entered to win a luxury timepiece — drawn live every month.
          </p>
          <div className="flex flex-wrap gap-3.5">
            <Link
              href="#donate"
              className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-bold text-teal2 transition-transform hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, var(--gold), var(--gold2))",
                boxShadow: "0 12px 30px rgba(200,155,92,0.32)",
              }}
            >
              Donate &amp; Enter
            </Link>
            <Link
              href="https://kollelohrmoshe.org"
              target="_blank"
              className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-bold text-cream border border-cream/35 bg-cream/[0.08] transition-colors hover:border-gold hover:text-gold2"
            >
              About the Kollel
            </Link>
          </div>
        </div>

        {/* Right column — countdown card */}
        <aside className="rounded-[28px] border border-cream/20 bg-cream/[0.11] p-8 shadow-[0_24px_70px_rgba(18,54,54,0.16)]">
          <div className="text-[0.76rem] font-extrabold tracking-[0.16em] uppercase text-gold mb-2">
            Next Drawing
          </div>
          <h3 className="font-heading text-3xl md:text-4xl font-light mb-1">{dateLabel}</h3>
          <p className="text-cream/75 text-sm">
            {daysUntil > 0 ? `${daysUntil} ${daysUntil === 1 ? "day" : "days"} remaining` : "Drawing today!"}
          </p>
          <p className="text-cream/85 mt-3 text-sm">Live drawing at 8:00 PM EST</p>
        </aside>
      </div>
    </section>
  )
}
