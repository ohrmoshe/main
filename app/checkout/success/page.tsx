import Link from "next/link"
import { getCheckoutSession } from "@/app/actions/stripe"

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams
  const sessionId = params.session_id

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-teal flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-heading text-4xl text-cream mb-4">Session Not Found</h1>
          <p className="text-foreground/60 mb-8">We couldn&apos;t find your checkout session.</p>
          <Link href="/" className="text-gold hover:text-gold2 underline">
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  const session = await getCheckoutSession(sessionId)
  const entries = session.metadata?.entries || "1"

  return (
    <div className="min-h-screen bg-teal flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 mx-auto mb-8 border-2 border-gold rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="font-heading text-4xl lg:text-5xl text-cream mb-4">Thank You!</h1>
        <p className="text-foreground/70 text-lg mb-2">
          Your monthly donation has been set up successfully.
        </p>
        <p className="text-gold text-xl font-heading mb-8">
          You now have {entries} {parseInt(entries) === 1 ? "entry" : "entries"} in every monthly drawing!
        </p>
        
        <div className="bg-teal2 border border-gold/20 p-6 rounded mb-8">
          <p className="text-sm text-foreground/60 mb-2">Confirmation sent to:</p>
          <p className="text-cream">{session.customer_details?.email}</p>
        </div>
        
        <p className="text-foreground/50 text-sm mb-8">
          You&apos;ll receive an email confirmation shortly. Your entries will be included in all future drawings as long as your subscription is active.
        </p>
        
        <Link 
          href="/"
          className="inline-block px-12 py-4 border border-gold text-gold2 text-xs tracking-[0.35em] uppercase transition-colors hover:bg-gold hover:text-teal"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}
