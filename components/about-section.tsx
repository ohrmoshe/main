import Image from 'next/image'
import { BookOpen, Users, Heart, Lightbulb } from 'lucide-react'

const features = [
  {
    icon: BookOpen,
    title: 'Daily Torah Study',
    description: 'Intensive daily learning programs for Avreichim covering Talmud, Halacha, and in-depth Torah study with expert guidance.',
  },
  {
    icon: Users,
    title: 'Community & Chesed',
    description: 'Supporting families in need with food packages during holidays, and providing a welcoming environment for Torah scholars.',
  },
  {
    icon: Heart,
    title: 'American Avreichim',
    description: 'Serving as a home away from home for non-Israeli and American Avreichim, with special shiurim and chizuk events.',
  },
  {
    icon: Lightbulb,
    title: 'Special Programs',
    description: 'Organizing shiurim from Maran HaRishon LeTzion Shlit"a and special Bein Hazmanim learning programs with stipends.',
  },
]

export default function AboutSection() {
  return (
    <section id="about" className="py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">About Our Kollel</p>
          <h2 className="font-serif text-3xl lg:text-4xl xl:text-5xl font-semibold text-foreground text-balance">
            Under the Presidency of Maran HaRishon LeTzion
          </h2>
          <div className="flex justify-center my-6">
            <Image
              src="/images/logo-lux-gold.avif"
              alt="Kollel Ohr Moshe Emblem"
              width={120}
              height={120}
              className="h-24 w-auto"
            />
          </div>
          <p className="mt-4 text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
            Kollel Ohr Moshe was established in Jerusalem under the guidance of Maran HaRishon LeTzion, 
            the Chief Rabbi of Israel, HaRav Yitzchak Yosef Shlit&quot;a. What started as a small initiative 
            has grown into a major center of Torah learning, community support, and chesed activities 
            serving Avreichim, Yeshiva students, and families in need. All activities take place in the 
            Beit Midrash of the Chief Rabbi himself.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 lg:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <p className="font-serif text-4xl lg:text-5xl font-semibold text-primary">35</p>
            <p className="mt-2 text-muted-foreground text-sm">Avreichim Learning Daily</p>
          </div>
          <div>
            <p className="font-serif text-4xl lg:text-5xl font-semibold text-primary">$30K</p>
            <p className="mt-2 text-muted-foreground text-sm">Monthly Stipends</p>
          </div>
          <div>
            <p className="font-serif text-4xl lg:text-5xl font-semibold text-primary">4</p>
            <p className="mt-2 text-muted-foreground text-sm">Locations Worldwide</p>
          </div>
          <div>
            <p className="font-serif text-4xl lg:text-5xl font-semibold text-primary">100%</p>
            <p className="mt-2 text-muted-foreground text-sm">Dedicated to Torah</p>
          </div>
        </div>

        {/* Locations */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            <span className="font-semibold text-foreground">Our Locations:</span> Jerusalem (2) &bull; Herzliya &bull; Los Angeles
          </p>
        </div>
      </div>
    </section>
  )
}
