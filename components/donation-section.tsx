import DonationForm from './donation-form'

export default function DonationSection() {
  return (
    <section id="donate" className="py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <div>
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">Support Torah Learning</p>
            <h2 className="font-serif text-3xl lg:text-4xl xl:text-5xl font-semibold text-foreground text-balance">
              100% Goes to Torah Scholars
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed text-pretty">
              Your entire donation goes directly to supporting full-time Torah scholars. 
              No expenses on resources. No expenses on facilities. 
              <span className="font-semibold text-foreground"> Pure Torah.</span>
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed text-pretty">
              Partner with us in this vital mission and share in the eternal merit of Torah learning. 
              Every dollar you give supports an Avreich dedicated to intensive Torah study.
            </p>
            
            <div className="mt-8 p-6 bg-primary/5 rounded-lg border-2 border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">100%</span>
                </div>
                <h3 className="font-semibold text-foreground text-lg">Direct to Stipends</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                  <span className="text-muted-foreground text-sm"><span className="font-medium text-foreground">Stipends only</span> — supporting 35 full-time Torah scholars</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                  <span className="text-muted-foreground text-sm"><span className="font-medium text-foreground">No overhead</span> — zero facility or resource expenses</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                  <span className="text-muted-foreground text-sm"><span className="font-medium text-foreground">Pure Torah</span> — every dollar funds dedicated learning</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                  <span className="text-muted-foreground text-sm"><span className="font-medium text-foreground">$30K monthly</span> — distributed across 4 locations</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Donation Form */}
          <div className="bg-card p-6 lg:p-8 rounded-xl border border-border shadow-sm">
            <DonationForm />
          </div>
        </div>
      </div>
    </section>
  )
}
