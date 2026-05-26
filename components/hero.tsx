import Image from 'next/image'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-16 lg:pt-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/beit-midrash-wide.jpg"
          alt="Torah study at Kollel Ohr Moshe"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-3xl">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/images/logo-gold-black.png"
              alt="Kollel Ohr Moshe Logo"
              width={200}
              height={200}
              className="h-32 lg:h-40 w-auto"
            />
          </div>
          <p className="text-primary-foreground/80 text-sm font-medium uppercase tracking-wider mb-4">
            Under the Presidency of Maran HaRishon LeTzion
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-primary-foreground leading-tight text-balance">
            Kollel Ohr Moshe
          </h1>
          <p className="mt-6 text-lg lg:text-xl text-primary-foreground/90 leading-relaxed max-w-2xl text-pretty">
            A Kollel of Avreichim in Jerusalem under the guidance of Maran HaRishon LeTzion, 
            Chief Rabbi of Israel, HaRav Yitzchak Yosef Shlit&quot;a. Dedicated to Torah 
            excellence, community support, and spreading the light of Torah throughout the world.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="#donate"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors text-base"
            >
              Make a Donation
            </Link>
            <Link
              href="#about"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary-foreground/10 text-primary-foreground font-semibold rounded-md hover:bg-primary-foreground/20 transition-colors text-base border border-primary-foreground/30"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden lg:block">
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-primary-foreground/70 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  )
}
