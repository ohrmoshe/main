import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy | Kollel Ohr Moshe',
  description: 'Privacy Policy for Kollel Ohr Moshe - How we collect, use, and protect your information.',
}

export default function PrivacyPolicyPage() {
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
        
        <h1 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
        
        <div className="prose prose-neutral max-w-none">
          <p className="text-muted-foreground mb-6">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          
          <p className="text-foreground leading-relaxed mb-6">
            Kollel Ohr Moshe (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
            when you visit our website or interact with our services.
          </p>

          <section className="mb-8">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Information We Collect</h2>
            <p className="text-foreground leading-relaxed mb-4">
              We may collect information about you in various ways, including:
            </p>
            <ul className="list-disc pl-6 text-foreground space-y-2 mb-4">
              <li><strong>Personal Data:</strong> Name, email address, phone number, mailing address, and payment information when you make a donation or subscribe to our communications.</li>
              <li><strong>Usage Data:</strong> Information about how you use our website, including pages visited, time spent, and browsing patterns.</li>
              <li><strong>Device Data:</strong> Information about your device, including IP address, browser type, and operating system.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
            <p className="text-foreground leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-foreground space-y-2 mb-4">
              <li>Process your donations and provide tax receipts</li>
              <li>Send you updates about our programs and events (if you opt in)</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8 p-6 bg-primary/5 border border-primary/20 rounded-lg">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Mobile Information & SMS Communications</h2>
            <p className="text-foreground leading-relaxed mb-4">
              <strong>No mobile information will be shared with third parties/affiliates for marketing/promotional purposes.</strong>
            </p>
            <p className="text-foreground leading-relaxed mb-4">
              All other categories exclude text messaging originator opt-in data and consent; 
              this information will not be shared with any third parties.
            </p>
            <p className="text-foreground leading-relaxed mb-4">
              If you opt in to receive SMS messages from Kollel Ohr Moshe:
            </p>
            <ul className="list-disc pl-6 text-foreground space-y-2">
              <li>Message frequency varies (approximately 2-4 messages per month)</li>
              <li>Message and data rates may apply</li>
              <li>You can opt out at any time by replying STOP to any message</li>
              <li>For help, reply HELP or contact us at amit@kollelohrmoshe.com</li>
              <li>Consent to receive SMS is not a condition of purchase or donation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Information Sharing</h2>
            <p className="text-foreground leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share 
              your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-foreground space-y-2 mb-4">
              <li><strong>Service Providers:</strong> With trusted third-party service providers who assist us in operating our website and processing donations (e.g., payment processors).</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and the safety of others.</li>
              <li><strong>With Your Consent:</strong> In any other circumstance with your explicit consent.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Data Security</h2>
            <p className="text-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction. However, 
              no method of transmission over the Internet or electronic storage is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Your Rights</h2>
            <p className="text-foreground leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-foreground space-y-2 mb-4">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information (subject to legal requirements)</li>
              <li>Opt out of marketing communications at any time</li>
              <li>Opt out of SMS messages by replying STOP</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Contact Us</h2>
            <p className="text-foreground leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="text-foreground space-y-1">
              <p><strong>Kollel Ohr Moshe</strong></p>
              <p>Email: <a href="mailto:amit@kollelohrmoshe.com" className="text-primary hover:underline">amit@kollelohrmoshe.com</a></p>
              <p>Phone: <a href="tel:+18187442970" className="text-primary hover:underline">(818) 744-2970</a></p>
              <p>Address: Los Angeles, California</p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Changes to This Policy</h2>
            <p className="text-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
