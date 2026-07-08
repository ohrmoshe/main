export function HowItWorks() {
  return (
    <section className="py-10 md:py-14 px-5 lg:px-0 bg-cream" id="how">
      <div className="w-full max-w-[1180px] mx-auto">
        <div className="text-center max-w-[740px] mx-auto mb-6">
          <div className="text-[0.68rem] font-extrabold tracking-[0.16em] uppercase text-gold mb-2">
            The Process
          </div>
          <h2 className="font-heading text-[clamp(1.8rem,3.2vw,3rem)] font-light text-text leading-none tracking-[-0.035em]">
            How It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Step
            number="01"
            title="Make a Donation"
            description="Choose a giving tier that feels right. Every donation is fully tax-deductible and goes directly toward supporting Torah learning in our community."
          />
          <Step
            number="02"
            title="You're Entered"
            description="As a token of appreciation, you're entered into our monthly drawing. The more you give, the more entries you receive. Every donor is valued equally."
          />
          <Step
            number="03"
            title="Live Drawing"
            description="Winners are drawn live on Zoom using WheelOfNames.com. You'll be notified by email — and celebrated by the entire community."
          />
        </div>

        <p className="text-center mt-5 text-muted-foreground text-sm">
          *No donation is required to enter. See Terms &amp; Conditions.
        </p>
      </div>
    </section>
  )
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <article className="bg-cream2 border border-teal/[0.08] rounded-[22px] p-6 shadow-[0_14px_35px_rgba(18,54,54,0.07)]">
      <div className="font-heading text-4xl text-gold/45 leading-none">{number}</div>
      <h3 className="text-[1.2rem] font-semibold text-text mt-2.5 mb-1.5">{title}</h3>
      <p className="text-[0.9rem] leading-relaxed text-muted-foreground">{description}</p>
    </article>
  )
}
