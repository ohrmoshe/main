import Image from "next/image"
import Link from "next/link"

export function ThisMonth() {
  return (
    <section className="py-16 md:py-20 px-5 lg:px-0 bg-cream" id="watch">
      <div className="w-full max-w-[1180px] mx-auto">
        <div className="text-center max-w-[740px] mx-auto mb-10">
          <div className="text-[0.76rem] font-extrabold tracking-[0.16em] uppercase text-gold mb-2.5">
            Featured Timepiece
          </div>
          <h2 className="font-heading text-[clamp(2.2rem,4vw,4rem)] font-light text-text leading-none tracking-[-0.035em]">
            This Month&apos;s Watch
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[.85fr_1.15fr] gap-8 lg:gap-11 items-center bg-cream2 rounded-[36px] p-6 md:p-10 shadow-[0_24px_70px_rgba(18,54,54,0.16)] border border-teal/[0.08]">
          {/* Watch image */}
          <div
            className="rounded-[30px] p-6 flex items-center justify-center"
            style={{ background: "linear-gradient(180deg, #fff, #f0eadf)" }}
          >
            <Image
              src="/images/rolex-gmt-rootbeer.avif"
              alt="Rolex GMT-Master II Root Beer"
              width={520}
              height={520}
              className="max-h-[420px] md:max-h-[520px] w-auto object-contain"
            />
          </div>

          {/* Watch info */}
          <div>
            <div className="text-[0.76rem] font-extrabold tracking-[0.16em] uppercase text-gold mb-2">
              June 2026 Drawing
            </div>
            <h3 className="font-heading text-[2.4rem] md:text-[3.2rem] font-light text-text leading-none mb-2.5">
              GMT-Master II
            </h3>
            <p className="text-[1.05rem] text-muted-foreground mb-4">
              Oyster · 40mm · Oystersteel &amp; Everose Gold
            </p>

            <div className="grid gap-3 my-6">
              <Spec label="Reference" value="126711CHNR" />
              <Spec label="Case Material" value="Oystersteel & Everose Gold" />
              <Spec label="Value" value="$20,050 USD" isValue />
              <Spec label="Drawing Date" value="June 30, 2026 — Live on Instagram" />
            </div>

            <Link
              href="#donate"
              className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-bold text-teal2 transition-transform hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, var(--gold), var(--gold2))",
                boxShadow: "0 12px 30px rgba(200,155,92,0.32)",
              }}
            >
              Enter to Win
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function Spec({ label, value, isValue = false }: { label: string; value: string; isValue?: boolean }) {
  return (
    <div className="flex justify-between gap-5 py-3.5 border-b border-teal/12">
      <span className="text-sm text-muted-foreground">{label}</span>
      <strong className={isValue ? "text-[1.35rem] text-gold font-extrabold" : "text-teal font-semibold text-sm text-right"}>
        {value}
      </strong>
    </div>
  )
}
