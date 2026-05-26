import Image from 'next/image'

export interface Update {
  id: string
  title: string
  excerpt: string
  date: string
  image: string
  category: string
}

const updates: Update[] = [
  {
    id: '1',
    title: 'Semicha Ceremony with the Chief Rabbi',
    excerpt: 'Our Avreichim received their Semicha certificates from Maran HaRishon LeTzion, the Chief Rabbi of Israel. A proud moment for our entire Kollel family.',
    date: 'Recent',
    image: '/images/semicha-ceremony.jpg',
    category: 'Special Event',
  },
  {
    id: '2',
    title: 'Shiur from Maran HaRishon LeTzion',
    excerpt: 'The Chief Rabbi delivered an inspiring shiur to our Avreichim in his personal Beit Midrash. Torah wisdom shared directly from the Chief Rabbi of Israel.',
    date: 'Recent',
    image: '/images/chief-rabbi-shiur.jpg',
    category: 'Torah',
  },
  {
    id: '3',
    title: 'Kollel Leil Purim Event',
    excerpt: 'Rabbi Amit Turgeman addresses the Purim learning event. Every learner receives $200. Refreshments, fine beverages, and costumes encouraged!',
    date: 'Purim 2026',
    image: '/images/rabbi-amit-purim.jpg',
    category: 'Event',
  },
  {
    id: '4',
    title: 'Bein Hazmanim Learning Program',
    excerpt: 'Over 100 participants joined our special Bein Hazmanim learning program. Stipend provided for all learners who participated in this intensive Torah study.',
    date: 'Recent',
    image: '/images/learning-hall-1.jpg',
    category: 'Program',
  },
  {
    id: '5',
    title: 'Community Gathering with the Chief Rabbi',
    excerpt: 'An intimate gathering with families and the Chief Rabbi, sharing brachot and guidance. Building connections between Torah leadership and the community.',
    date: 'Recent',
    image: '/images/family-gathering.jpg',
    category: 'Community',
  },
  {
    id: '6',
    title: 'Daily Learning in the Beit Midrash',
    excerpt: 'Our Avreichim engaged in intensive daily Torah study in the Chief Rabbi\'s Beit Midrash. Supporting full-time Torah scholars dedicated to learning.',
    date: 'Ongoing',
    image: '/images/beit-midrash-crowd.jpg',
    category: 'Torah',
  },
]

export default function UpdatesGrid() {
  return (
    <section id="updates" className="py-16 lg:py-24 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">Stay Informed</p>
          <h2 className="font-serif text-3xl lg:text-4xl xl:text-5xl font-semibold text-foreground text-balance">
            Latest Updates
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-pretty">
            Stay connected with the latest news, events, and inspiring stories from our Kollel community.
          </p>
        </div>

        {/* Updates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {updates.map((update, index) => (
            <article
              key={update.id}
              className={`group bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow ${
                index === 0 ? 'md:col-span-2 md:grid md:grid-cols-2' : ''
              }`}
            >
              <div className={`relative ${index === 0 ? 'aspect-[16/10] md:aspect-auto md:h-full' : 'aspect-[16/10]'}`}>
                <Image
                  src={update.image}
                  alt={update.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    {update.category}
                  </span>
                </div>
              </div>
              <div className={`p-6 ${index === 0 ? 'md:p-8 md:flex md:flex-col md:justify-center' : ''}`}>
                <time className="text-sm text-muted-foreground">{update.date}</time>
                <h3 className={`font-serif font-semibold text-foreground mt-2 group-hover:text-primary transition-colors ${
                  index === 0 ? 'text-xl lg:text-2xl' : 'text-lg'
                }`}>
                  {update.title}
                </h3>
                <p className="mt-3 text-muted-foreground text-sm leading-relaxed line-clamp-3">
                  {update.excerpt}
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Read More
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/>
                    <path d="m12 5 7 7-7 7"/>
                  </svg>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
