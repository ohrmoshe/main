import Image from "next/image"
import Link from "next/link"
import { getDrawingInfo } from "@/lib/drawing"
import { getEntryStats } from "@/app/actions/stats"
import { CountdownClock } from "./countdown-clock"

const WATCH_VALUE = "$20,050"

export async function Hero() {
  const { dateLabel, targetTime } = getDrawingInfo()
  const { monthlySubscribers } = await getEntryStats()

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-teal text-cream pt-24 pb-14 md:pt-32 md:pb-24 px-5 lg:px-0"
      style={{
        backgroundImage:
          "radial-gradient(circle at 80% 5%, rgba(225,192,141,0.28), transparent 34%), linear-gradient(135deg, var(--teal), var(--teal2))",
      }}
    >
      <div className="w-full max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_.95fr] gap-8 lg:gap-14 items-center">
        {/* Intro block — compact on mobile so the watch + raffle are seen fast */}
        <div className="lg:col-start-1 lg:row-start-1">
          <Image
            src="/images/watchnlearn-logo.png"
            alt="Watch & Learn"
            width={210}
            height={105}
            priority
            className="w-[min(148px,40vw)] md:w-[min(210px,60vw)] h-auto mb-4 md:mb-6 drop-shadow-[0_4px_32px_rgba(200,155,92,0.18)]"
          />
          <div className="text-[0.7rem] md:text-[0.76rem] font-extrabold tracking-[0.16em] uppercase text-gold mb-3 md:mb-4">
            Support a Kollel · Win a {WATCH_VALUE} Watch
          </div>
          <h1 className="font-heading font-light text-[clamp(2.5rem,7vw,6.5rem)] leading-[0.95] tracking-[-0.03em] mb-4 md:mb-6">
            Timeless Watches.
            <span className="block text-gold2">Eternal Impact.</span>
          </h1>
          <p className="text-[1.02rem] md:text-[1.1rem] leading-relaxed text-cream/85 max-w-[560px]">
            Donate to support a Kollel of Torah learning — and every gift enters you to win this month&apos;s{" "}
            {WATCH_VALUE} luxury watch, drawn <strong className="text-cream">live on Zoom</strong>.
          </p>
        </div>

        {/* Supporting copy + CTAs — above the watch card on mobile, under intro on desktop */}
        <div className="order-2 lg:order-none lg:col-start-1 lg:row-start-2">
          {monthlySubscribers > 0 && (
            <p className="text-cream/80 text-base md:text-xl mb-5">
              <span className="font-bold text-gold2 text-2xl md:text-3xl">
                {monthlySubscribers.toLocaleString()}
              </span>{" "}
              {monthlySubscribers === 1 ? "member has" : "members have"}{" "}
              joined this month&apos;s sweepstakes
            </p>
          )}
          <p className="text-cream/70 text-[0.95rem] mb-6 md:mb-7">
            Give monthly for the best odds, or make a one-time gift. Both enter you to win.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Link
              href="#donate"
              className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-bold text-teal2 transition-transform hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, var(--gold), var(--gold2))",
                boxShadow: "0 12px 30px rgba(200,155,92,0.32)",
              }}
            >
              Enter for $36/mo
            </Link>
            <Link
              href="#prize-wheel"
              className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-bold text-cream border border-cream/35 bg-cream/[0.08] transition-colors hover:border-gold hover:text-gold2"
            >
              One-Time Gift ($1–299)
            </Link>
          </div>

          <p className="text-cream/60 text-xs mt-4 leading-relaxed">
            Tax-deductible donation to{" "}
            <Link
              href="https://kollelohrmoshe.org"
              target="_blank"
              className="text-gold2 underline underline-offset-2 hover:text-gold"
            >
              Kollel Ohr Moshe
            </Link>{" "}
            · Tax ID 33-3914717
          </p>
        </div>

        {/* Prize watch + countdown card — pulled high on mobile so the watch and
            monthly raffle are immediately visible right under the headline */}
        <aside className="order-3 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-center rounded-[28px] border border-cream/20 bg-cream/[0.11] p-5 md:p-7 shadow-[0_24px_70px_rgba(18,54,54,0.16)]">
          {/* Prize watch */}
          <div
            className="relative rounded-[22px] p-5 flex items-center justify-center mb-5"
            style={{ background: "linear-gradient(180deg, #fff, #f0eadf)" }}
          >
            <span className="absolute top-3 right-3 rounded-full bg-teal2 text-gold2 text-[0.6rem] font-extrabold tracking-[0.12em] uppercase px-2.5 py-1">
              {WATCH_VALUE} Value
            </span>
            <Image
              src="/images/rolex-gmt-rootbeer.avif"
              alt="Rolex GMT-Master II Root Beer — this month's prize"
              width={420}
              height={420}
              className="max-h-[240px] w-auto object-contain"
            />
          </div>
          <div className="flex items-baseline justify-between gap-3 mb-5">
            <div>
              <h3 className="font-heading text-2xl md:text-3xl font-light leading-none">GMT-Master II</h3>
              <p className="text-cream/70 text-xs mt-1">Oystersteel &amp; Everose Gold · 40mm</p>
            </div>
          </div>

          <div className="pt-5 border-t border-cream/15">
            <div className="text-[0.72rem] font-extrabold tracking-[0.16em] uppercase text-gold mb-1.5">
              Next Drawing · {dateLabel}
            </div>
            <p className="text-cream/85 text-sm mb-1">Live on Zoom at 8:00 PM PST</p>
            <CountdownClock targetTime={targetTime} />
          </div>

          <Link
            href="#donate"
            className="mt-6 w-full inline-flex items-center justify-center rounded-full px-5 py-3.5 text-sm font-bold text-teal2 transition-transform hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, var(--gold), var(--gold2))",
              boxShadow: "0 12px 30px rgba(200,155,92,0.32)",
            }}
          >
            Enter to Win
          </Link>
        </aside>
      </div>
    </section>
  )
}
