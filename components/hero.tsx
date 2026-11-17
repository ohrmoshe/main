import Image from "next/image"
import Link from "next/link"
import { getDrawingInfo } from "@/lib/drawing"
import { getEntryStats } from "@/app/actions/stats"
import { ONE_TIME_ENTRY_ENABLED } from "@/lib/products"
import { CURRENT_PRIZE, PRIZE_INCREASE_LABEL, PRIZE_VALUE_LABEL } from "@/lib/prize"
import { CountdownClock } from "./countdown-clock"

// While one-time entries are closed the drawing is open to monthly members
// only, and the hero presents it that way.
const MEMBERS_ONLY = !ONE_TIME_ENTRY_ENABLED

export async function Hero() {
  const { dateLabel, timeLabel, targetTime } = getDrawingInfo()
  const { monthlySubscribers } = await getEntryStats()

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-teal text-cream pt-20 pb-14 md:pt-32 md:pb-24 px-5 lg:px-0"
      style={{
        backgroundImage:
          "radial-gradient(circle at 80% 5%, rgba(225,192,141,0.28), transparent 34%), linear-gradient(135deg, var(--teal), var(--teal2))",
      }}
    >
      <div className="w-full max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_.95fr] gap-5 lg:gap-14 items-center">
        {/* Intro block — compact on mobile so the watch + raffle are seen fast */}
        <div className="lg:col-start-1 lg:row-start-1">
          {/* Logo + headline sit side by side on mobile to save vertical space
              (shifting everything up), then stack normally on desktop. */}
          <div className="flex items-center gap-4 lg:block">
            <Image
              src="/images/watchnlearn-logo.png"
              alt="Watch & Learn"
              width={210}
              height={105}
              priority
              style={{ height: "auto" }}
              className="w-36 shrink-0 md:w-44 lg:w-[min(280px,68vw)] lg:mb-6 drop-shadow-[0_4px_32px_rgba(200,155,92,0.18)]"
            />
            <div>
              <h1 className="font-heading font-light text-[clamp(2rem,7vw,6.5rem)] leading-[0.95] tracking-[-0.03em] mb-2 lg:mb-4">
                Timeless Watches.
                <span className="block text-gold2">Eternal Impact.</span>
              </h1>
              <div className="text-[0.58rem] md:text-[0.66rem] font-extrabold tracking-[0.16em] uppercase text-gold lg:mb-4">
                {MEMBERS_ONLY ? "Members-Only Drawing" : "Support a Kollel"} · Win a {PRIZE_VALUE_LABEL} Watch
              </div>
            </div>
          </div>
          {MEMBERS_ONLY ? (
            <p className="text-[0.98rem] md:text-[1.1rem] leading-relaxed text-cream/85 max-w-[560px] mt-3 lg:mt-0 text-pretty">
              <strong className="text-gold2">This month is not a regular drawing.</strong> The prize is a{" "}
              {PRIZE_VALUE_LABEL} {CURRENT_PRIZE.shortName}
              {PRIZE_INCREASE_LABEL && <> — {PRIZE_INCREASE_LABEL} more than last month&apos;s watch —</>} and entry is
              open to monthly members only. Your monthly gift supports a Kollel of Torah learning, and the winner is
              drawn <strong className="text-cream">live on Zoom</strong>.
            </p>
          ) : (
            <p className="text-[0.98rem] md:text-[1.1rem] leading-relaxed text-cream/85 max-w-[560px] mt-3 lg:mt-0">
              Donate to support a Kollel of Torah learning — and every gift enters you to win this month&apos;s{" "}
              {PRIZE_VALUE_LABEL} luxury watch, drawn <strong className="text-cream">live on Zoom</strong>.
            </p>
          )}
        </div>

        {/* Supporting copy + CTAs — above the watch card on mobile, under intro on desktop */}
        <div className="order-2 lg:order-none lg:col-start-1 lg:row-start-2">
          {monthlySubscribers > 0 && (
            <p className="text-cream/80 text-base md:text-xl mb-4">
              <span className="font-bold text-gold2 text-2xl md:text-3xl">
                {monthlySubscribers.toLocaleString()}
              </span>{" "}
              {monthlySubscribers === 1 ? "member has" : "members have"}{" "}
              joined this month&apos;s sweepstakes
            </p>
          )}
          <div
            className={`grid gap-3 ${
              ONE_TIME_ENTRY_ENABLED ? "grid-cols-2 max-w-[520px]" : "grid-cols-1 max-w-[520px] sm:max-w-[320px]"
            }`}
          >
            <Link
              href="#donate"
              className="flex flex-col items-center justify-center gap-0.5 rounded-[22px] px-3 py-3 text-center text-teal2 transition-transform hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, var(--gold), var(--gold2))",
                boxShadow: "0 12px 30px rgba(200,155,92,0.32)",
              }}
            >
              <span className="text-xs font-extrabold uppercase tracking-[0.1em]">Monthly Entry</span>
              <span className="font-heading text-2xl leading-tight">From $36/mo</span>
            </Link>
            {ONE_TIME_ENTRY_ENABLED && (
              <Link
                href="#prize-wheel"
                className="flex flex-col items-center justify-center gap-0.5 rounded-[22px] px-3 py-3 text-center text-cream border border-gold/60 bg-cream/[0.08] transition-colors hover:border-gold hover:bg-cream/[0.14]"
              >
                <span className="text-xs font-extrabold uppercase tracking-[0.1em]">One-Time Entry</span>
                <span className="font-heading text-2xl leading-tight text-gold2">$1–$299</span>
              </Link>
            )}
          </div>

          <p className="text-cream/60 text-xs mt-3 leading-relaxed">
            Donation subject to partial tax deduction to{" "}
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
        <aside
          className={`order-3 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-center rounded-[28px] border bg-cream/[0.11] p-5 md:p-7 ${
            MEMBERS_ONLY
              ? "border-gold/70 shadow-[0_24px_70px_rgba(200,155,92,0.22)]"
              : "border-cream/20 shadow-[0_24px_70px_rgba(18,54,54,0.16)]"
          }`}
        >
          {MEMBERS_ONLY && (
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <span className="rounded-full bg-gold2 px-3.5 py-1.5 text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-teal2">
                Members-Only Drawing
              </span>
              <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-gold2">
                One-time entries closed
              </span>
            </div>
          )}

          <div className="relative rounded-[22px] bg-cream2 p-2 md:p-3 flex flex-col items-center justify-center text-center mb-5 min-h-[220px] md:min-h-[300px] overflow-hidden">
            <div className="absolute top-3 left-3 z-10 text-[0.7rem] font-extrabold tracking-[0.18em] uppercase text-gold">
              This Month&apos;s Prize
            </div>
            <Image
              src={CURRENT_PRIZE.image}
              alt={CURRENT_PRIZE.imageAlt}
              width={900}
              height={900}
              className="h-auto w-full object-contain"
            />
          </div>

          <h3 className="font-heading text-3xl md:text-4xl font-light leading-none">{CURRENT_PRIZE.name}</h3>
          <p className="text-cream/70 text-xs mt-1.5">{CURRENT_PRIZE.details}</p>
          <p className="text-cream/85 text-sm leading-relaxed mt-3 text-pretty">{CURRENT_PRIZE.description}</p>
          <ul className="flex flex-wrap gap-2 mt-3">
            {CURRENT_PRIZE.highlights.map((highlight) => (
              <li
                key={highlight}
                className="rounded-full border border-cream/25 px-3 py-1 text-xs font-semibold text-cream/90"
              >
                {highlight}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-2 rounded-[20px] border border-gold/50 bg-teal2/50 px-5 py-4 mt-5 mb-5">
            <div>
              <div className="text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-gold">Prize value</div>
              <div className="font-heading text-5xl md:text-6xl font-light leading-none text-gold2 mt-1">
                {PRIZE_VALUE_LABEL}
              </div>
            </div>
            {PRIZE_INCREASE_LABEL && (
              <p className="text-sm leading-snug text-cream/85">
                <strong className="block font-heading text-2xl font-light leading-none text-cream">
                  +{PRIZE_INCREASE_LABEL}
                </strong>
                over last month&apos;s watch
              </p>
            )}
          </div>

          <div className="pt-5 border-t border-cream/15">
            <div className="text-[0.72rem] font-extrabold tracking-[0.16em] uppercase text-gold mb-1.5">
              Next Drawing · {dateLabel}
            </div>
            <p className="text-cream/85 text-sm mb-1">Live on Zoom at {timeLabel}</p>
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
            {MEMBERS_ONLY ? "Become a Member to Enter" : "Enter to Win"}
          </Link>
        </aside>
      </div>
    </section>
  )
}
