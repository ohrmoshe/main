import Header from '@/components/header'
import Hero from '@/components/hero'
import WatchNLearnFeature from '@/components/watchnlearn-feature'
import AboutSection from '@/components/about-section'
import UpdatesGrid from '@/components/updates-grid'
import DonationSection from '@/components/donation-section'
import ContactSection from '@/components/contact-section'
import Footer from '@/components/footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <WatchNLearnFeature />
      <AboutSection />
      <UpdatesGrid />
      <DonationSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
