import Image from "next/image"
import Link from "next/link"

export function ThisMonth() {
  return (
    <section className="py-24 px-6 lg:px-16 bg-cream" id="watch">
      <div className="text-center">
        <div className="text-[0.6rem] tracking-[0.5em] uppercase text-gold mb-3">Featured Timepiece</div>
        <h2 className="font-heading text-[clamp(2rem,4vw,3.2rem)] font-light text-teal leading-[1.15] mb-8">
          This Month&apos;s Watch
        </h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center mt-12">
        {/* Watch Image */}
        <div className="flex items-center justify-center">
          <div className="relative flex items-center justify-center w-[420px] h-[420px] max-w-full">
            <div className="absolute inset-0 rounded-full border border-teal/15" />
            <div className="absolute inset-5 rounded-full border border-teal/[0.07]" />
            <Image 
              src="/images/rolex-gmt-rootbeer.avif" 
              alt="Rolex GMT-Master II Root Beer" 
              width={380}
              height={380}
              className="w-[380px] h-[380px] object-contain drop-shadow-[0_8px_40px_rgba(0,0,0,0.3)] drop-shadow-[0_2px_12px_rgba(13,59,59,0.15)]"
            />
          </div>
        </div>
        
        {/* Watch Details */}
        <div className="py-4">
          <div className="text-[0.6rem] tracking-[0.5em] uppercase text-gold mb-3">June 2026 Drawing</div>
          <div className="font-heading text-5xl font-light text-teal mb-1">GMT-Master II</div>
          <div className="text-[0.65rem] tracking-[0.35em] text-gold uppercase mb-8">
            Oyster · 40mm · Oystersteel &amp; Everose Gold
          </div>
          
          <div className="border-t border-teal/10">
            <DetailRow label="Reference" value="126711CHNR" />
            <DetailRow label="Case Material" value="Oystersteel & Everose Gold" />
            <DetailRow label="Value" value="$20,050 USD" />
            <DetailRow label="Drawing Date" value="June 30, 2026 — Live on Instagram" />
          </div>
          
          <div className="mt-10 flex items-center gap-5 flex-wrap">
            <Link 
              href="#donate" 
              className="group relative inline-block px-12 py-4 border border-teal text-teal text-xs tracking-[0.35em] uppercase overflow-hidden transition-colors duration-400 hover:text-cream"
            >
              <span className="absolute inset-0 bg-teal transform scale-x-0 origin-left transition-transform duration-400 group-hover:scale-x-100" />
              <span className="relative z-10">Enter to Win</span>
            </Link>
            <span className="text-xs text-teal/60 tracking-[0.1em]">Entries from $26</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-4 border-b border-teal/10">
      <span className="text-[0.65rem] tracking-[0.2em] uppercase text-teal/50">{label}</span>
      <span className="text-sm text-teal">{value}</span>
    </div>
  )
}
