export function About() {
  return (
    <section className="py-16 md:py-20 px-5 lg:px-0 bg-cream" id="about">
      <div className="w-full max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_.9fr] gap-10 lg:gap-12 items-start">
        {/* Copy */}
        <div className="bg-cream2 rounded-[32px] p-8 md:p-10 shadow-[0_24px_70px_rgba(18,54,54,0.16)]">
          <div className="text-[0.76rem] font-extrabold tracking-[0.16em] uppercase text-gold mb-2.5">
            Who You&apos;re Supporting
          </div>
          <h2 className="font-heading text-[clamp(2.2rem,4vw,4rem)] font-light text-text leading-none tracking-[-0.035em] mb-6">
            About Kollel Ohr Moshe
          </h2>

          <div className="space-y-4 text-[0.95rem] leading-relaxed text-muted-foreground">
            <p>
              Kollel Ohr Moshe was established in Jerusalem under the guidance of Maran HaRishon LeTzion, the Chief Rabbi
              of Israel, HaRav Yitzchak Yosef Shlit&quot;a. What started as a small initiative has grown into a major
              center of Torah learning, community support, and chesed activities serving Avreichim, Yeshiva students, and
              families in need.
            </p>
            <p>
              All activities take place in the Beit Midrash of the Chief Rabbi himself. The Kollel provides intensive
              daily learning programs for Avreichim covering Talmud, Halacha, and in-depth Torah study with expert
              guidance, while also serving as a home away from home for non-Israeli and American Avreichim.
            </p>
            <p>
              Through your participation in Watch &amp; Learn, you become a partner in the timeless relationship between
              those who learn Torah and those who make that learning possible. Every donation supports families in need
              with food packages during holidays and provides a welcoming environment for Torah scholars.
            </p>
          </div>

          <blockquote className="font-heading text-[1.35rem] italic text-teal border-l-4 border-gold mt-7 pl-5 leading-snug">
            &ldquo;When you support Torah learning, your impact is measured not only in hours learned, but in the
            generations shaped by it.&rdquo;
            <br />
            <br />
            <cite className="not-italic text-base">— Kollel Ohr Moshe</cite>
          </blockquote>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4.5 gap-y-5">
          <Stat value="35+" label="Avreichim Learning Daily" />
          <Stat value="$30K" label="Monthly Stipends" />
          <Stat value="4" label="Locations Worldwide" />
          <Stat value="100%" label="Dedicated to Torah" />
          <div className="col-span-2 bg-cream2 text-teal border border-teal/10 rounded-[26px] p-7 text-center">
            <strong className="block font-heading text-[1.6rem] text-gold">Locations</strong>
            Jerusalem (2) · Herzliya · Los Angeles
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-teal text-cream rounded-[26px] p-7 text-center">
      <strong className="block font-heading text-[2.5rem] text-gold2 leading-none mb-1">{value}</strong>
      <span className="text-sm text-cream/85">{label}</span>
    </div>
  )
}
