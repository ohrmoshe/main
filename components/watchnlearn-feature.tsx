import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Trophy, Calendar } from 'lucide-react'

export default function WatchNLearnFeature() {
  return (
    <section id="watch-and-learn" className="py-16 lg:py-24 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 lg:mb-14">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
            Support a Kollel &middot; Win a Watch
          </p>
          <h2 className="font-serif text-3xl lg:text-4xl xl:text-5xl font-semibold text-foreground text-balance">
            Watch &amp; Learn
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
            Every donation fuels Torah learning at Kollel Ohr Moshe &mdash; and enters you to win this
            month&apos;s $20,050 luxury timepiece, drawn live on Zoom. Click the preview below to visit
            the site and claim your entry.
          </p>
        </div>

        {/* Big clickable preview */}
        <Link
          href="https://watchnlearn.org"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit watchnlearn.org to enter the watch drawing"
          className="group relative block rounded-xl overflow-hidden border border-border shadow-lg hover:shadow-xl transition-shadow"
        >
          {/* Browser chrome bar */}
          <div className="flex items-center gap-2 bg-card px-4 py-3 border-b border-border">
            <span className="w-3 h-3 rounded-full bg-destructive/60" />
            <span className="w-3 h-3 rounded-full bg-primary/60" />
            <span className="w-3 h-3 rounded-full bg-muted-foreground/40" />
            <div className="ml-3 flex-1 max-w-md">
              <div className="flex items-center justify-center bg-muted rounded-md px-3 py-1 text-xs text-muted-foreground font-medium">
                watchnlearn.org
              </div>
            </div>
          </div>

          {/* Screenshot */}
          <div className="relative aspect-[1280/800]">
            <Image
              src="/images/watchnlearn-preview.png"
              alt="Preview of the Watch & Learn website at watchnlearn.org"
              fill
              className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-md text-base shadow-lg">
                Visit watchnlearn.org
                <ArrowUpRight className="w-5 h-5" />
              </span>
            </div>
          </div>
        </Link>

        {/* Quick facts + CTA */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4 p-6 bg-card rounded-lg border border-border">
            <div className="w-11 h-11 shrink-0 bg-primary/10 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">$20,050 Watch</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                This month&apos;s prize: a GMT-Master II luxury timepiece.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 bg-card rounded-lg border border-border">
            <div className="w-11 h-11 shrink-0 bg-primary/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Live Drawing</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Winners drawn live on Zoom. Entries from $42.
              </p>
            </div>
          </div>
          <Link
            href="https://watchnlearn.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors text-base"
          >
            Enter to Win
            <ArrowUpRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
