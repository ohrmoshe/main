import Image from "next/image"
import Link from "next/link"

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-teal/[0.92] backdrop-blur-md border-b border-cream/12">
      <div className="w-full max-w-[1180px] mx-auto h-[78px] flex items-center justify-between gap-6 px-5 lg:px-0 text-cream">
        <Link href="#top" className="flex items-center gap-3.5" aria-label="Watch & Learn home">
          <Image
            src="/images/kollel-logo.png"
            alt="Kollel Ohr Moshe Logo"
            width={46}
            height={46}
            className="w-[46px] h-[46px] rounded-full object-contain bg-cream/[0.08] p-1.5"
          />
          <div>
            <div className="font-heading text-[1.35rem] font-bold leading-none">Watch &amp; Learn</div>
            <div className="text-xs text-cream/75 mt-1">A Kollel Ohr Moshe Project</div>
          </div>
        </Link>
        <nav className="hidden md:flex gap-6 text-[0.92rem] text-cream/90" aria-label="Primary navigation">
          <Link href="#how" className="transition-colors hover:text-gold2">How It Works</Link>
          <Link href="#watch" className="transition-colors hover:text-gold2">This Month</Link>
          <Link href="#donate" className="transition-colors hover:text-gold2">Donate</Link>
          <Link href="#about" className="transition-colors hover:text-gold2">About</Link>
          <Link href="#winners" className="transition-colors hover:text-gold2">Winners</Link>
        </nav>
      </div>
    </header>
  )
}
