import Link from "next/link"

export const metadata = {
  title: "Privacy Policy | Watch & Learn",
  description: "Privacy Policy for Watch & Learn and Kollel Ohr Moshe",
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-cream py-20 px-6 lg:px-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-gold hover:text-gold2 text-sm tracking-[0.2em] uppercase mb-8 inline-block">
          &larr; Back to Home
        </Link>
        
        <h1 className="font-heading text-4xl lg:text-5xl font-light text-teal mb-4">
          Privacy Policy
        </h1>
        <p className="text-teal/60 text-sm mb-8">Last Updated: June 2026</p>
        
        <div className="prose prose-teal max-w-none space-y-8 text-teal/80">
          <section>
            <h2 className="font-heading text-2xl text-teal mb-4">Introduction</h2>
            <p>Kollel Ohr Moshe (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the Watch &amp; Learn website at watchnlearn.org. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or participate in our sweepstakes program.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-teal mb-4">Information We Collect</h2>
            <h3 className="font-heading text-xl text-teal mb-2">Personal Information</h3>
            <p>When you make a donation or enter our sweepstakes, we may collect:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Mailing address</li>
              <li>Payment information (processed securely through Stripe)</li>
            </ul>
            
            <h3 className="font-heading text-xl text-teal mb-2 mt-6">Automatically Collected Information</h3>
            <p>When you visit our website, we may automatically collect certain information about your device, including:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>IP address</li>
              <li>Browser type</li>
              <li>Operating system</li>
              <li>Access times</li>
              <li>Pages viewed</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-teal mb-4">How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Process donations and subscriptions</li>
              <li>Administer our monthly sweepstakes</li>
              <li>Contact winners and deliver prizes</li>
              <li>Send receipts and tax documentation</li>
              <li>Respond to your inquiries</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-teal mb-4">Information Sharing</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Service Providers:</strong> Third-party vendors who assist us in operating our website, processing payments (Stripe), and conducting our business</li>
              <li><strong>Legal Requirements:</strong> When required by law, subpoena, or other legal process</li>
              <li><strong>Winner Announcements:</strong> Winner names may be publicly announced on our website and social media (first name and last initial only, unless you consent to full name disclosure)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-teal mb-4">Payment Security</h2>
            <p>All payment transactions are processed through Stripe, a PCI-DSS compliant payment processor. We do not store your full credit card information on our servers. Stripe&apos;s privacy policy and security practices can be found at <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold2">stripe.com/privacy</a>.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-teal mb-4">Data Retention</h2>
            <p>We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements. Donation and subscription records are retained for tax and legal compliance purposes.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-teal mb-4">Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information (subject to legal retention requirements)</li>
              <li>Opt out of marketing communications</li>
              <li>Cancel your subscription at any time</li>
            </ul>
            <p className="mt-4">To exercise these rights, please contact us at <a href="mailto:amit@watchnlearn.org" className="text-gold hover:text-gold2">amit@watchnlearn.org</a>.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-teal mb-4">Cookies</h2>
            <p>Our website may use cookies and similar tracking technologies to enhance your browsing experience. You can set your browser to refuse cookies, but this may limit some features of our website.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-teal mb-4">Children&apos;s Privacy</h2>
            <p>Our website and sweepstakes are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected such information, we will take steps to delete it.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-teal mb-4">Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &ldquo;Last Updated&rdquo; date.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-teal mb-4">Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us:</p>
            <address className="not-italic bg-teal/5 p-4 rounded my-4">
              Kollel Ohr Moshe<br />
              1428 S Shenandoah St #4<br />
              Los Angeles, CA 90035<br /><br />
              Email: <a href="mailto:amit@watchnlearn.org" className="text-gold hover:text-gold2">amit@watchnlearn.org</a><br />
              Phone: <a href="tel:+18187442970" className="text-gold hover:text-gold2">(818) 744-2970</a>
            </address>
          </section>
        </div>
      </div>
    </main>
  )
}
