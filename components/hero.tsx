import Image from "next/image"
import Link from "next/link"

export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden px-8 pt-24 pb-16">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-bg.png')" }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(13,59,59,0.45)] via-[rgba(13,59,59,0.55)] to-[rgba(13,59,59,0.75)]" />
      
      {/* Decorative Rings */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.06]">
        <svg viewBox="0 0 700 700" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[700px] h-[700px]">
          <circle cx="350" cy="350" r="340" stroke="#c8a45a" strokeWidth="1"/>
          <circle cx="350" cy="350" r="280" stroke="#c8a45a" strokeWidth="0.5"/>
          <circle cx="350" cy="350" r="220" stroke="#c8a45a" strokeWidth="1"/>
          <circle cx="350" cy="350" r="160" stroke="#c8a45a" strokeWidth="0.5"/>
          <line x1="350" y1="10" x2="350" y2="690" stroke="#c8a45a" strokeWidth="0.5"/>
          <line x1="10" y1="350" x2="690" y2="350" stroke="#c8a45a" strokeWidth="0.5"/>
          <line x1="110" y1="110" x2="590" y2="590" stroke="#c8a45a" strokeWidth="0.3"/>
          <line x1="590" y1="110" x2="110" y2="590" stroke="#c8a45a" strokeWidth="0.3"/>
        </svg>
      </div>

      {/* Content */}
      <div className="relative text-center max-w-[780px]">
        <Image 
          src="/images/watchnlearn-logo.png" 
          alt="Watch & Learn" 
          width={340}
          height={170}
          className="w-[min(340px,80vw)] h-auto mx-auto mb-8 drop-shadow-[0_4px_32px_rgba(200,164,90,0.18)]"
        />
        
        <div className="text-[0.65rem] tracking-[0.45em] uppercase text-gold mb-7 flex items-center justify-center gap-4">
          <span className="flex-1 max-w-[60px] h-px bg-gradient-to-r from-transparent to-gold" />
          Support a Kollel · Win a Watch
          <span className="flex-1 max-w-[60px] h-px bg-gradient-to-l from-transparent to-gold" />
        </div>
        
        <h1 className="font-heading text-[clamp(2.8rem,7vw,5.5rem)] font-light leading-[1.05] text-cream tracking-[0.02em] mb-6">
          Timeless Watches.<br/>
          <em className="italic text-gold2">Eternal Impact.</em>
        </h1>
        
        <p className="text-[0.9rem] tracking-[0.08em] text-foreground/65 leading-[1.8] max-w-[520px] mx-auto mb-11">
          Every donation fuels a Kollel dedicated to Torah learning. As a token of our gratitude, you&apos;ll be entered to win a luxury timepiece — drawn live every month.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="#donate" 
            className="group relative inline-block px-12 py-4 border border-gold text-gold2 text-xs tracking-[0.35em] uppercase overflow-hidden transition-colors duration-400 hover:text-teal"
          >
            <span className="absolute inset-0 bg-gold transform scale-x-0 origin-left transition-transform duration-400 group-hover:scale-x-100" />
            <span className="relative z-10">Donate &amp; Enter</span>
          </Link>
          
          <Link 
            href="https://kollelohrmoshe.org" 
            target="_blank"
            className="inline-block px-8 py-4 border border-cream/30 text-cream/70 text-xs tracking-[0.25em] uppercase transition-all hover:border-gold hover:text-gold"
          >
            About the Kollel
          </Link>
        </div>
        
        <div className="w-px h-[60px] bg-gradient-to-b from-gold to-transparent mx-auto mt-12" />
      </div>
    </section>
  )
}
