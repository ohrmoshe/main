import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/logo-gold-black.png"
                alt="Kollel Ohr Moshe Logo"
                width={60}
                height={60}
                className="h-14 w-auto"
              />
              <h3 className="font-serif text-2xl font-semibold">Kollel Ohr Moshe</h3>
            </div>
            <p className="text-background/70 leading-relaxed max-w-md">
              Under the presidency of Maran HaRishon LeTzion, Chief Rabbi of Israel. 
              Dedicated to Torah learning, community support, and spreading the light of Torah worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <nav className="flex flex-col gap-3">
              <Link href="#about" className="text-background/70 hover:text-background transition-colors text-sm">
                About Us
              </Link>
              <Link href="#updates" className="text-background/70 hover:text-background transition-colors text-sm">
                Latest Updates
              </Link>
              <Link href="#donate" className="text-background/70 hover:text-background transition-colors text-sm">
                Make a Donation
              </Link>
              <Link href="#contact" className="text-background/70 hover:text-background transition-colors text-sm">
                Contact Us
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="flex flex-col gap-3">
              <a 
                href="mailto:amit@kollelohrmoshe.org" 
                className="flex items-center gap-2 text-background/70 hover:text-background transition-colors text-sm"
              >
                <Mail size={16} />
                amit@kollelohrmoshe.org
              </a>
              <a 
                href="tel:+18187442970" 
                className="flex items-center gap-2 text-background/70 hover:text-background transition-colors text-sm"
              >
                <Phone size={16} />
                (818) 744-2970
              </a>
              <div className="flex items-start gap-2 text-background/70 text-sm">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>Los Angeles, California</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="mt-8 pt-8 border-t border-background/20">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
            <Link 
              href="/privacy" 
              className="text-background/60 hover:text-background transition-colors text-sm"
            >
              Privacy Policy
            </Link>
            <span className="text-background/30">|</span>
            <Link 
              href="/terms" 
              className="text-background/60 hover:text-background transition-colors text-sm"
            >
              Terms & Conditions
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-background/60 text-sm">
              &copy; {new Date().getFullYear()} Kollel Ohr Moshe. All rights reserved.
            </p>
            <p className="text-background/60 text-sm">
              A 501(c)(3) tax-exempt organization
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
