import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { ThisMonth } from "@/components/this-month"
import { HowItWorks } from "@/components/how-it-works"
import { DonationTiers } from "@/components/donation-tiers"
import { About } from "@/components/about"
import { Winners } from "@/components/winners"
import { Footer } from "@/components/footer"
import { StickyDonateButton } from "@/components/sticky-donate-button"

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <ThisMonth />
      <HowItWorks />
      <DonationTiers />
      <About />
      <Winners />
      <Footer />
      <StickyDonateButton />
    </main>
  )
}
