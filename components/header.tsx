'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo-bw.png"
              alt="Kollel Ohr Moshe Logo"
              width={50}
              height={50}
              className="h-10 w-auto lg:h-12"
            />
            <span className="font-serif text-lg lg:text-xl font-semibold text-foreground tracking-wide hidden sm:block">
              Kollel Ohr Moshe
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="#watch-and-learn" 
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Watch &amp; Learn
            </Link>
            <Link 
              href="#about" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link 
              href="#updates" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Updates
            </Link>
            <Link 
              href="#donate" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Donate
            </Link>
            <Link 
              href="#contact" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              href="#donate"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
            >
              Support Torah
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <Link 
                href="#watch-and-learn" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Watch &amp; Learn
              </Link>
              <Link 
                href="#about" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
              <Link 
                href="#updates" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Updates
              </Link>
              <Link 
                href="#donate" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Donate
              </Link>
              <Link 
                href="#contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </Link>
              <Link
                href="#donate"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors mt-2"
              >
                Support Torah
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
