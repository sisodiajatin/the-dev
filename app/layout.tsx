import './global.css'
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Footer from './components/footer'
import Nav from './components/nav'
import SmoothScroll from './components/smooth-scroll'
import { baseUrl, identity, seo } from './lib/profile'
import { Manrope, Playfair } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'

// Playfair Display (serif) — body copy.
const playfair = Playfair({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  style: ['normal', 'italic'],
})

// Manrope (sans) — chat UI and small chrome.
const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
  style: ['normal'],
})

// Generated on demand by app/og/route.tsx from the profile config, so there is
// no static branded image to keep in sync.
const ogImage = `${baseUrl}/og?title=${encodeURIComponent(identity.name)}`

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: seo.titleDefault,
    template: seo.titleTemplate,
  },
  description: seo.description,
  keywords: [...seo.keywords],

  authors: [{ name: identity.name, url: baseUrl }],
  creator: identity.name,

  alternates: {
    canonical: baseUrl,
    types: {
      'application/rss+xml': `${baseUrl}/rss`,
    },
  },

  openGraph: {
    title: seo.titleDefault,
    description: seo.description,
    url: baseUrl,
    siteName: seo.siteName,
    locale: 'en_US',
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630, alt: `${identity.name} — ${identity.role}` }],
  },

  twitter: {
    card: 'summary_large_image',
    title: seo.titleDefault,
    description: seo.description,
    ...(seo.twitterHandle ? { creator: seo.twitterHandle, site: seo.twitterHandle } : {}),
    images: [ogImage],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // TODO: add your Google Search Console token once the domain is verified.
  // verification: { google: 'your-google-verification-code' },
}

const cx = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(' ')

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={cx('text-foreground bg-background', playfair.variable, manrope.variable)}
    >
      <body className="font-serif antialiased max-w-2xl mx-auto px-4 my-16 lg:my-24 text-sm md:text-base tracking-tight lowercase">
        <main className="flex-auto min-w-0 flex flex-col">
          <Nav />
          {children}
          <Footer />
          <SmoothScroll />
          <Analytics />
          <SpeedInsights />
          {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
          )}
        </main>
      </body>
    </html>
  )
}
