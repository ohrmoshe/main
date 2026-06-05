import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-teal border-t border-gold/15 py-12 px-6 lg:px-16">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-10 lg:gap-6">
        {/* Branding */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="font-heading text-xl font-light text-gold2 tracking-[0.15em]">Watch &amp; Learn</div>
            <div className="text-[0.6rem] tracking-[0.2em] text-foreground/30 mt-1">Support a Kollel · Win a Watch</div>
          </div>
          
          {/* Kollel Ohr Moshe Branding */}
          <div className="flex items-center gap-3 pt-2 border-t border-gold/10">
            <Image 
              src="/images/kollel-logo.png" 
              alt="Kollel Ohr Moshe Logo" 
              width={40} 
              height={40}
              className="opacity-80"
            />
            <div>
              <div className="text-[0.6rem] tracking-[0.15em] text-foreground/40">A project of</div>
              <Link 
                href="https://watchnlearn.org" 
                target="_blank"
                className="text-xs text-gold2 hover:text-gold transition-colors"
              >
                Kollel Ohr Moshe
              </Link>
            </div>
          </div>
        </div>
        
        {/* Links */}
        <div className="flex gap-8 flex-wrap">
          <Link href="#how" className="text-[0.65rem] tracking-[0.2em] uppercase text-foreground/40 transition-colors hover:text-gold2">
            How It Works
          </Link>
          <Link href="#watch" className="text-[0.65rem] tracking-[0.2em] uppercase text-foreground/40 transition-colors hover:text-gold2">
            This Month
          </Link>
          <Link href="#donate" className="text-[0.65rem] tracking-[0.2em] uppercase text-foreground/40 transition-colors hover:text-gold2">
            Donate
          </Link>
          <Link href="#winners" className="text-[0.65rem] tracking-[0.2em] uppercase text-foreground/40 transition-colors hover:text-gold2">
            Winners
          </Link>
          <Link href="/cancel" className="text-[0.65rem] tracking-[0.2em] uppercase text-foreground/40 transition-colors hover:text-gold2">
            Cancel Subscription
          </Link>
          <Link href="#" className="text-[0.65rem] tracking-[0.2em] uppercase text-foreground/40 transition-colors hover:text-gold2">
            Terms &amp; Conditions
          </Link>
        </div>
        
        {/* Contact Info */}
        <div className="text-right">
          <div className="text-[0.6rem] tracking-[0.2em] uppercase text-foreground/30 mb-2">Contact</div>
          <div className="space-y-1">
            <a href="mailto:amit@watchnlearn.org" className="block text-xs text-foreground/50 hover:text-gold2 transition-colors">
              amit@watchnlearn.org
            </a>
            <a href="tel:+18187442970" className="block text-xs text-foreground/50 hover:text-gold2 transition-colors">
              (818) 744-2970
            </a>
            <div className="text-xs text-foreground/35">Los Angeles, California</div>
          </div>
        </div>
      </div>
      
      {/* Bottom bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-10 pt-6 border-t border-gold/10">
        <div className="text-[0.6rem] text-foreground/25 tracking-[0.1em]">
          © 2026 Watch &amp; Learn · A project of Kollel Ohr Moshe · All Rights Reserved
        </div>
        <Link 
          href="https://watchnlearn.org" 
          target="_blank"
          className="text-[0.6rem] text-foreground/30 hover:text-gold2 transition-colors tracking-[0.1em]"
        >
          watchnlearn.org
        </Link>
      </div>
    </footer>
  )
}
