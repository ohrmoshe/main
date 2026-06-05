import Image from "next/image"
import Link from "next/link"

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 lg:px-16 py-4 bg-teal/[0.92] backdrop-blur-sm border-b border-gold/15">
      <div className="flex items-center gap-4">
        <Image 
          src="/images/kollel-logo.png" 
          alt="Kollel Ohr Moshe Logo" 
          width={44} 
          height={44}
          className="opacity-90"
        />
        <div>
          <div className="font-heading text-xl lg:text-2xl font-light text-gold2 tracking-[0.15em] uppercase">
            Watch &amp; Learn
          </div>
          <span className="text-[0.5rem] tracking-[0.3em] text-gold uppercase block mt-0.5">
            A Kollel Ohr Moshe Project
          </span>
        </div>
      </div>
      <ul className="hidden md:flex list-none gap-10">
        <li>
          <Link href="#how" className="text-foreground/70 text-xs tracking-[0.18em] uppercase transition-colors hover:text-gold2">
            How It Works
          </Link>
        </li>
        <li>
          <Link href="#watch" className="text-foreground/70 text-xs tracking-[0.18em] uppercase transition-colors hover:text-gold2">
            This Month
          </Link>
        </li>
        <li>
          <Link href="#donate" className="text-foreground/70 text-xs tracking-[0.18em] uppercase transition-colors hover:text-gold2">
            Donate
          </Link>
        </li>
        <li>
          <Link href="#about" className="text-foreground/70 text-xs tracking-[0.18em] uppercase transition-colors hover:text-gold2">
            About
          </Link>
        </li>
        <li>
          <Link href="#winners" className="text-foreground/70 text-xs tracking-[0.18em] uppercase transition-colors hover:text-gold2">
            Winners
          </Link>
        </li>
      </ul>
    </nav>
  )
}
