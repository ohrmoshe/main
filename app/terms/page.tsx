import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Terms & Conditions | Kollel Ohr Moshe',
  description: 'Terms and Conditions for Kollel Ohr Moshe website and services.',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>
        
        <h1 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-8">Terms & Conditions</h1>
        
        <div className="prose prose-neutral max-w-none">
          <p className="text-muted-foreground mb-6">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          
          <p className="text-foreground leading-relaxed mb-6">
            Welcome to Kollel Ohr Moshe. By accessing or using our website, making donations, 
            or subscribing to our communications, you agree to be bound by these Terms & Conditions.
          </p>

          <section className="mb-8">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-foreground leading-relaxed">
              By using our website and services, you acknowledge that you have read, understood, 
              and agree to be bound by these Terms & Conditions and our Privacy Policy. If you 
              do not agree, please do not use our website or services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">2. Donations</h2>
            <p className="text-foreground leading-relaxed mb-4">
              All donations made to Kollel Ohr Moshe are voluntary and tax-deductible to the extent 
              permitted by law. By making a donation, you agree that:
            </p>
            <ul className="list-disc pl-6 text-foreground space-y-2 mb-4">
              <li>Donations are final and non-refundable unless made in error</li>
              <li>You are authorized to use the payment method provided</li>
              <li>For recurring donations, you authorize us to charge your payment method on a recurring basis until canceled</li>
              <li>You may cancel recurring donations at any time by contacting us</li>
            </ul>
          </section>

          <section className="mb-8 p-6 bg-primary/5 border border-primary/20 rounded-lg">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">3. SMS/Text Message Terms</h2>
            <p className="text-foreground leading-relaxed mb-4">
              By opting in to receive SMS/text messages from Kollel Ohr Moshe, you agree to the following:
            </p>
            <ul className="list-disc pl-6 text-foreground space-y-2 mb-4">
              <li><strong>Program:</strong> You will receive recurring automated promotional and informational text messages from Kollel Ohr Moshe.</li>
              <li><strong>Frequency:</strong> Message frequency varies, approximately 2-4 messages per month.</li>
              <li><strong>Costs:</strong> Message and data rates may apply. Check with your mobile carrier for details about your plan.</li>
              <li><strong>Opt-Out:</strong> You may opt out at any time by texting STOP to any message you receive. You will receive one final confirmation message.</li>
              <li><strong>Help:</strong> For assistance, text HELP to any message or contact us at amit@kollelohrmoshe.com.</li>
              <li><strong>Consent:</strong> Consent to receive text messages is not a condition of making a donation or using our services.</li>
              <li><strong>Carriers:</strong> Supported carriers include but are not limited to AT&T, Verizon, T-Mobile, Sprint, and other major carriers. Carrier participation may vary.</li>
            </ul>
            <p className="text-foreground leading-relaxed">
              <strong>Your mobile information will not be shared with third parties for marketing purposes.</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">4. Email Communications</h2>
            <p className="text-foreground leading-relaxed">
              By subscribing to our email list, you agree to receive periodic emails about our programs, 
              events, and updates. You may unsubscribe at any time by clicking the unsubscribe link 
              in any email or by contacting us directly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">5. Intellectual Property</h2>
            <p className="text-foreground leading-relaxed">
              All content on this website, including text, images, logos, and design, is the property 
              of Kollel Ohr Moshe and is protected by copyright and other intellectual property laws. 
              You may not reproduce, distribute, or use our content without prior written permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">6. Limitation of Liability</h2>
            <p className="text-foreground leading-relaxed">
              Kollel Ohr Moshe provides this website and its services on an &quot;as is&quot; basis. We make no 
              warranties, express or implied, regarding the accuracy, reliability, or availability of 
              our website. To the fullest extent permitted by law, we shall not be liable for any 
              damages arising from your use of our website or services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">7. Privacy</h2>
            <p className="text-foreground leading-relaxed">
              Your use of our website is also governed by our{' '}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, 
              which is incorporated into these Terms by reference.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">8. Changes to Terms</h2>
            <p className="text-foreground leading-relaxed">
              We reserve the right to modify these Terms & Conditions at any time. Changes will be 
              effective immediately upon posting to our website. Your continued use of our website 
              after changes are posted constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">9. Governing Law</h2>
            <p className="text-foreground leading-relaxed">
              These Terms & Conditions shall be governed by and construed in accordance with the 
              laws of the State of New York, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">10. Contact Us</h2>
            <p className="text-foreground leading-relaxed mb-4">
              If you have any questions about these Terms & Conditions, please contact us:
            </p>
            <div className="text-foreground space-y-1">
              <p><strong>Kollel Ohr Moshe</strong></p>
              <p>Email: <a href="mailto:amit@kollelohrmoshe.com" className="text-primary hover:underline">amit@kollelohrmoshe.com</a></p>
              <p>Phone: <a href="tel:+18187442970" className="text-primary hover:underline">(818) 744-2970</a></p>
              <p>Address: Los Angeles, California</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
