import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { RaffleDateBanner } from "@/components/raffle-date-banner"
import { ThisMonth } from "@/components/this-month"
import { HowItWorks } from "@/components/how-it-works"
import { DonationTiers } from "@/components/donation-tiers"
import { About } from "@/components/about"
import { Winners } from "@/components/winners"
import { Footer } from "@/components/footer"
import { SectionDivider } from "@/components/section-divider"

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <RaffleDateBanner />
      <ThisMonth />
      <SectionDivider />
      <HowItWorks />
      <SectionDivider className="max-md:hidden" />
      <DonationTiers />
      <SectionDivider />
      <About />
      <SectionDivider />
      <Winners />
      <Footer />
    </main>
  )
}
