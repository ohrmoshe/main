import Image from "next/image"
import Link from "next/link"
import { getDrawingInfo } from "@/lib/drawing"
import { getEntryStats } from "@/app/actions/stats"
import { CountdownClock } from "./countdown-clock"

const WATCH_VALUE = "$20,050"

export async function Hero() {
  const { dateLabel, targetTime } = getDrawingInfo()
  const { totalEntries } = await getEntryStats()

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
            Support a Kollel · Win a {WATCH_VALUE} Watch
          </div>
          <h1 className="font-heading font-light text-[clamp(3rem,7vw,6.5rem)] leading-[0.95] tracking-[-0.03em] mb-6">
            Timeless Watches.
            <span className="block text-gold2">Eternal Impact.</span>
          </h1>
          <p className="text-[1.05rem] leading-relaxed text-cream/85 max-w-[560px] mb-7">
            Every donation fuels a Kollel dedicated to Torah learning. As a token of our gratitude, you&apos;ll be
            entered to win this month&apos;s {WATCH_VALUE} luxury timepiece — drawn live on Zoom.
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
              Claim Your Entry
            </Link>
            <Link
              href="#donate"
              className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-bold text-cream border border-cream/35 bg-cream/[0.08] transition-colors hover:border-gold hover:text-gold2"
            >
              Enter for $42
            </Link>
          </div>

          {totalEntries > 0 && (
            <p className="text-cream/70 text-sm mt-5">
              <span className="font-bold text-gold2">{totalEntries.toLocaleString()}</span>{" "}
              {totalEntries === 1 ? "entry" : "entries"} already in this month&apos;s drawing
            </p>
          )}
        </div>

        {/* Right column — countdown card */}
        <aside className="rounded-[28px] border border-cream/20 bg-cream/[0.11] p-8 shadow-[0_24px_70px_rgba(18,54,54,0.16)]">
          <div className="text-[0.76rem] font-extrabold tracking-[0.16em] uppercase text-gold mb-2">
            Next Drawing
          </div>
          <h3 className="font-heading text-3xl md:text-4xl font-light mb-1">{dateLabel}</h3>
          <p className="text-cream/85 text-sm">Live drawing at 8:00 PM PST</p>

          <CountdownClock targetTime={targetTime} />

          <div className="mt-6 pt-5 border-t border-cream/15 flex items-center justify-between gap-4">
            <div>
              <div className="font-heading text-2xl text-gold2 leading-none">
                {totalEntries.toLocaleString()}
              </div>
              <div className="text-[0.62rem] font-bold tracking-[0.12em] uppercase text-cream/60 mt-1.5">
                Entries In
              </div>
            </div>
            <Link
              href="#donate"
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold text-teal2 transition-transform hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, var(--gold), var(--gold2))",
                boxShadow: "0 12px 30px rgba(200,155,92,0.32)",
              }}
            >
              Enter Now
            </Link>
          </div>
        </aside>
      </div>
    </section>
  )
}
