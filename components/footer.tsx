import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-teal2 text-cream py-14 px-5 lg:px-0">
      <div className="w-full max-w-[1180px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_.8fr_.8fr] gap-8">
          {/* Branding */}
          <div>
            <h2 className="font-heading text-2xl">Watch &amp; Learn</h2>
            <p className="text-cream/80 text-sm mt-1">Support a Kollel · Win a Watch</p>
            <Image
              src="/images/kollel-logo.png"
              alt="Kollel Ohr Moshe Logo"
              width={82}
              height={82}
              className="w-[82px] h-auto mt-4"
            />
            <p className="text-cream/80 text-sm mt-3">
              A project of{" "}
              <Link href="https://kollelohrmoshe.org" target="_blank" className="hover:text-gold2 transition-colors">
                Kollel Ohr Moshe
              </Link>
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-3">Links</h3>
            <div className="flex flex-wrap gap-3 text-cream/80 text-sm">
              <Link href="#how" className="hover:text-gold2 transition-colors">How It Works</Link>
              <Link href="#watch" className="hover:text-gold2 transition-colors">This Month</Link>
              <Link href="#donate" className="hover:text-gold2 transition-colors">Donate</Link>
              <Link href="#winners" className="hover:text-gold2 transition-colors">Winners</Link>
              <Link href="/cancel" className="hover:text-gold2 transition-colors">Cancel Subscription</Link>
              <Link href="/terms" className="hover:text-gold2 transition-colors">Terms &amp; Conditions</Link>
              <Link href="/privacy" className="hover:text-gold2 transition-colors">Privacy Policy</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-3">Contact</h3>
            <p className="text-cream/80 text-sm leading-relaxed">
              <a href="mailto:amit@watchnlearn.org" className="hover:text-gold2 transition-colors">
                amit@watchnlearn.org
              </a>
              <br />
              <a href="tel:+18187442970" className="hover:text-gold2 transition-colors">
                (818) 744-2970
              </a>
              <br />
              <br />
              Los Angeles, California
            </p>
          </div>
        </div>

        <div className="border-t border-cream/12 mt-9 pt-6 text-cream/60 text-sm">
          © 2026 Watch &amp; Learn · A project of Kollel Ohr Moshe · All Rights Reserved
        </div>
      </div>
    </footer>
  )
}
