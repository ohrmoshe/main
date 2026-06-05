export function HowItWorks() {
  return (
    <section className="hidden md:block py-24 px-6 lg:px-16 bg-gradient-to-br from-teal to-teal2" id="how">
      <div className="text-center max-w-[600px] mx-auto">
        <div className="text-[0.6rem] tracking-[0.5em] uppercase text-gold mb-3">The Process</div>
        <h2 className="font-heading text-[clamp(2rem,4vw,3.2rem)] font-light text-cream leading-[1.15] mb-8">
          How It Works
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
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
          description="Winners are drawn live on Zoom and Instagram using WheelOfNames.com. You'll be notified by email — and celebrated by the entire community."
        />
      </div>
      
      <p className="text-center mt-10 text-xs text-foreground/35 tracking-[0.1em]">
        *No donation is required to enter. See Terms &amp; Conditions.
      </p>
    </section>
  )
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="relative p-10 border border-gold/15 bg-white/[0.02] transition-colors hover:border-gold/40">
      <div className="w-0.5 h-10 bg-gradient-to-b from-gold to-transparent mb-6" />
      <span className="font-heading text-7xl font-light text-gold/[0.12] leading-none block mb-4">
        {number}
      </span>
      <h3 className="font-heading text-xl font-normal text-gold2 mb-3">{title}</h3>
      <p className="text-sm leading-[1.9] text-foreground/60 font-light">{description}</p>
    </div>
  )
}
