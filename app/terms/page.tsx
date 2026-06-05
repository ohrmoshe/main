import Link from "next/link"

export const metadata = {
  title: "Terms & Conditions | Watch & Learn",
  description: "Official sweepstakes rules for the Kollel Ohr Moshe Monthly Watch Sweepstakes",
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-cream py-20 px-6 lg:px-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-gold hover:text-gold2 text-sm tracking-[0.2em] uppercase mb-8 inline-block">
          &larr; Back to Home
        </Link>
        
        <h1 className="font-heading text-4xl lg:text-5xl font-light text-teal mb-8">
          Terms &amp; Conditions
        </h1>
        
        <div className="prose prose-teal max-w-none space-y-8 text-teal/80">
          <section>
            <h2 className="font-heading text-2xl text-teal mb-4">Kollel Ohr Moshe Monthly Watch Sweepstakes</h2>
            <p className="font-bold text-teal">NO PURCHASE OR DONATION NECESSARY TO ENTER OR WIN.</p>
            <p>A purchase or donation will not increase your chances of winning. Void where prohibited by law.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-teal mb-4">Sponsor</h2>
            <p>Kollel Ohr Moshe (&ldquo;Sponsor&rdquo;)</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-teal mb-4">Monthly Sweepstakes Program</h2>
            <p>The Kollel Ohr Moshe Monthly Watch Sweepstakes is an ongoing promotional program in which Sponsor may award one luxury watch prize each calendar month.</p>
            <p>Each monthly sweepstakes shall constitute a separate promotion with its own Entry Period, prize description, approximate retail value (&ldquo;ARV&rdquo;), drawing date, and winner.</p>
            <p>Details for the current month&apos;s prize, entry period, and drawing date will be posted on Sponsor&apos;s website.</p>
            <p>Sponsor reserves the right to modify, replace, postpone, or discontinue any monthly sweepstakes or prize offering at any time as permitted by law.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-teal mb-4">Eligibility</h2>
            <p>Open only to legal residents of the fifty (50) United States and the District of Columbia who are at least eighteen (18) years old at the time of entry.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-teal mb-4">Monthly Prize</h2>
            <p>Each month, Sponsor will award one luxury watch selected by Sponsor.</p>
            <p>Examples may include watches manufactured by Rolex, Audemars Piguet, Patek Philippe, Cartier, Omega, Tudor, Breitling, or other luxury brands.</p>
            <p>The specific prize, model, and approximate retail value for each monthly sweepstakes will be disclosed on the applicable promotion page.</p>
            <p>No cash redemption shall be permitted except at Sponsor&apos;s sole discretion.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-teal mb-4">How To Enter</h2>
            <p>Participants may enter by making a voluntary donation through Sponsor&apos;s website or through the Free Alternative Method of Entry described below.</p>
            <p className="font-bold text-teal">A donation is not required to enter or win.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-teal mb-4">Free Alternative Method of Entry (AMOE)</h2>
            <p>To enter without making a donation, handwrite your:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Full Legal Name</li>
              <li>Mailing Address</li>
              <li>Phone Number</li>
              <li>Email Address</li>
            </ul>
            <p>on a 3&rdquo; × 5&rdquo; card and mail it in a stamped envelope to:</p>
            <address className="not-italic bg-teal/5 p-4 rounded my-4">
              Kollel Ohr Moshe Sweepstakes<br />
              1428 S Shenandoah St #4<br />
              Los Angeles, CA 90035
            </address>
            <p>Mail-in entries must be postmarked no later than the final day of the applicable monthly Entry Period and received within seven (7) calendar days thereafter.</p>
            <p>Limit one entry per person per monthly sweepstakes.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-teal mb-4">Winner Selection</h2>
            <p>One winner will be selected in a random drawing from all eligible entries received during the applicable monthly Entry Period.</p>
            <p>Odds of winning depend on the number of eligible entries received.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-teal mb-4">Winner Notification</h2>
            <p>Winner will be contacted by telephone and/or email within approximately seven (7) days following the drawing.</p>
            <p>If a selected winner cannot be contacted, is found ineligible, or fails to provide required documentation within seven (7) days, Sponsor may select an alternate winner.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-teal mb-4">Taxes</h2>
            <p>Winner is solely responsible for all federal, state, and local taxes associated with the prize.</p>
            <p>Sponsor may issue IRS Form 1099-MISC or any other tax forms required by law.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-teal mb-4">Current Sweepstakes Information</h2>
            <p>Current prize details, retail value, entry deadlines, drawing dates, winner announcements, and complete promotion information will be posted at:</p>
            <p><Link href="https://watchnlearn.org" className="text-gold hover:text-gold2">https://watchnlearn.org/</Link></p>
          </section>
        </div>
      </div>
    </main>
  )
}
