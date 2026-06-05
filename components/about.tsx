export function About() {
  return (
    <section className="py-24 px-6 lg:px-16 bg-cream" id="about">
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-24 items-start">
        {/* Text Content */}
        <div>
          <div className="text-[0.6rem] tracking-[0.5em] uppercase text-gold mb-3">Who You&apos;re Supporting</div>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.2rem)] font-light text-teal leading-[1.15] mb-8">
            About Kollel Ohr Moshe
          </h2>
          
          <div className="space-y-5">
            <p className="text-[0.88rem] leading-[2.1] text-teal/70 font-light">
              Kollel Ohr Moshe was established in Jerusalem under the guidance of Maran HaRishon LeTzion, the Chief Rabbi of Israel, HaRav Yitzchak Yosef Shlit&quot;a. What started as a small initiative has grown into a major center of Torah learning, community support, and chesed activities serving Avreichim, Yeshiva students, and families in need.
            </p>
            <p className="text-[0.88rem] leading-[2.1] text-teal/70 font-light">
              All activities take place in the Beit Midrash of the Chief Rabbi himself. The Kollel provides intensive daily learning programs for Avreichim covering Talmud, Halacha, and in-depth Torah study with expert guidance, while also serving as a home away from home for non-Israeli and American Avreichim.
            </p>
            <p className="text-[0.88rem] leading-[2.1] text-teal/70 font-light">
              Through your participation in Watch &amp; Learn, you become a partner in the timeless relationship between those who learn Torah and those who make that learning possible. Every donation supports families in need with food packages during holidays and provides a welcoming environment for Torah scholars.
            </p>
          </div>
        </div>
        
        {/* Quote */}
        <div className="p-10 border-l-2 border-gold mt-4">
          <blockquote className="font-heading text-2xl italic font-light text-teal leading-[1.6] mb-4">
            &ldquo;When you support Torah learning, your impact is measured not only in hours learned, but in the generations shaped by it.&rdquo;
          </blockquote>
          <cite className="text-[0.65rem] tracking-[0.3em] text-gold uppercase not-italic">
            — Kollel Ohr Moshe
          </cite>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        <StatBox value="35+" label="Avreichim Learning Daily" />
        <StatBox value="$30K" label="Monthly Stipends" />
        <StatBox value="4" label="Locations Worldwide" />
        <StatBox value="100%" label="Dedicated to Torah" />
      </div>
      
      <p className="text-center mt-6 text-xs text-teal/40 tracking-[0.1em]">
        Locations: Jerusalem (2) · Herzliya · Los Angeles
      </p>
    </section>
  )
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="p-8 lg:p-12 border border-teal/15 text-center">
      <div className="font-heading text-[2.8rem] font-light text-teal">{value}</div>
      <div className="text-[0.6rem] tracking-[0.3em] uppercase text-teal/50 mt-1">{label}</div>
    </div>
  )
}
