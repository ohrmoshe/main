import Link from "next/link"
import { getOfferLinkStatus } from "@/app/actions/offer"
import { getWinbackTiers } from "@/lib/products"
import { OfferTiers } from "@/components/offer-tiers"

export const dynamic = "force-dynamic"

export default async function OfferPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const { status } = await getOfferLinkStatus(token)

  if (status !== "valid") {
    return (
      <main className="min-h-screen bg-teal text-cream flex items-center justify-center px-5">
        <div className="max-w-md text-center">
          <div className="text-[0.76rem] font-extrabold tracking-[0.16em] uppercase text-gold mb-3">
            Watch &amp; Learn
          </div>
          <h1 className="font-heading text-4xl font-light mb-4 text-balance">
            {status === "redeemed" ? "This offer has already been used" : "This link isn't valid"}
          </h1>
          <p className="text-cream/75 leading-relaxed mb-8">
            {status === "redeemed"
              ? "This exclusive win-back offer was a one-time link and has already been claimed. If you think this is a mistake, please reach out to us."
              : "This offer link is invalid or may have expired. Please double-check the link you were sent."}
          </p>
          <Link
            href="/#donate"
            className="inline-block rounded-full px-6 py-3 text-sm font-bold text-teal2 transition-transform hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, var(--gold), var(--gold2))",
              boxShadow: "0 12px 30px rgba(200,155,92,0.32)",
            }}
          >
            View Regular Plans
          </Link>
        </div>
      </main>
    )
  }

  const tiers = getWinbackTiers()

  return (
    <main className="min-h-screen bg-teal text-cream py-16 md:py-20 px-5 lg:px-0">
      <div className="w-full max-w-[1180px] mx-auto">
        <div className="text-center max-w-[760px] mx-auto mb-10">
          <div className="text-[0.76rem] font-extrabold tracking-[0.16em] uppercase text-gold mb-2.5">
            Members-Only Win-Back Offer
          </div>
          <h1 className="font-heading text-[clamp(2.2rem,4vw,4rem)] font-light leading-none tracking-[-0.035em] mb-3.5 text-balance">
            Keep Your Subscription at an Exclusive Rate
          </h1>
          <p className="text-cream/75 text-[1.05rem] text-pretty">
            We&apos;d love to keep you in every drawing. As a thank-you, here&apos;s a private discount just for you
            &mdash; the same entries you had, at a lower monthly price. This is a one-time link, so it can only be
            used once.
          </p>
        </div>

        <OfferTiers token={token} tiers={tiers} />

        <p className="text-center text-cream/70 mt-6 text-sm">
          Cancel anytime · All donations are tax-deductible · Kollel Ohr Moshe is a 501(c)(3) organization
        </p>
      </div>
    </main>
  )
}
