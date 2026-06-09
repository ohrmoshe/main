import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ 
  subsets: ["latin"],
  variable: '--font-geist',
})
const _geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono',
})
const _playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://kollelohrmoshe.com'),
  title: 'Kollel Ohr Moshe | Supporting Torah Learning',
  description: 'Dedicated to Torah learning and spiritual growth. Support our mission to illuminate the world with wisdom through your generous donations.',
  generator: 'v0.app',
  keywords: ['Kollel', 'Torah', 'Jewish education', 'donations', 'Torah study', 'spiritual growth'],
  openGraph: {
    title: 'Kollel Ohr Moshe | Supporting Torah Learning',
    description: 'Dedicated to Torah learning and spiritual growth. Support our mission to illuminate the world with wisdom through your generous donations.',
    url: 'https://kollelohrmoshe.com',
    siteName: 'Kollel Ohr Moshe',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kollel Ohr Moshe | Supporting Torah Learning',
    description: 'Dedicated to Torah learning and spiritual growth. Support our mission to illuminate the world with wisdom through your generous donations.',
  },
}

export const viewport: Viewport = {
  themeColor: '#8B7355',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background scroll-smooth">
      <body className={`${_geist.variable} ${_geistMono.variable} ${_playfair.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
