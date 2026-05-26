import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle } from 'lucide-react'

export const metadata = {
  title: 'Thank You | Kollel Ohr Moshe',
  description: 'Thank you for your generous donation to Kollel Ohr Moshe.',
}

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/images/logo-gold-black.png"
            alt="Kollel Ohr Moshe Logo"
            width={120}
            height={120}
            className="h-24 w-auto"
          />
        </div>

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Thank You Message */}
        <h1 className="font-serif text-3xl lg:text-4xl font-semibold text-foreground mb-4">
          Thank You for Your Donation!
        </h1>
        
        <p className="text-muted-foreground leading-relaxed mb-6">
          Your generous contribution directly supports our Torah scholars. 
          100% of your donation goes to stipends for full-time Avreichim dedicated to Torah study.
        </p>

        <p className="text-muted-foreground leading-relaxed mb-8">
          May you be blessed with abundant blessings for your support of Torah learning. 
          You will receive a confirmation email shortly.
        </p>

        {/* Share the Merit */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
          <h2 className="font-semibold text-foreground mb-2">Share in the Merit</h2>
          <p className="text-sm text-muted-foreground">
            Your support enables 35 Avreichim across 4 locations to dedicate themselves 
            fully to Torah study. You are a true partner in this holy work.
          </p>
        </div>

        {/* Return Home Button */}
        <Link
          href="/"
          className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors"
        >
          Return to Homepage
        </Link>

        {/* Contact Info */}
        <p className="mt-8 text-sm text-muted-foreground">
          Questions? Contact us at{' '}
          <a href="mailto:amit@kollelohrmoshe.com" className="text-primary hover:underline">
            amit@kollelohrmoshe.com
          </a>
        </p>
      </div>
    </main>
  )
}
