import type { Metadata } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-cormorant',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-inter',
  display: 'swap',
})

import { AuthProvider } from '@/contexts/AuthContext'
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  title: "ClientDining — Business dining in London",
  description: "A private booking platform for professionals who host business dining in London. Membership is verified for City professionals.",
  keywords: "London business dining, City professionals, private members clubs, professional dining, business entertainment London",
  authors: [{ name: "ClientDining" }],
  creator: "ClientDining",
  publisher: "ClientDining",
  metadataBase: new URL('https://www.clientdining.com'),
  alternates: {
    canonical: 'https://www.clientdining.com',
  },
  openGraph: {
    title: "ClientDining — Business dining in London",
    description: "A private booking platform for professionals who host business dining in London.",
    url: 'https://www.clientdining.com',
    siteName: 'ClientDining',
    locale: 'en_GB',
    type: 'website',
    images: [
      {
        url: 'https://www.clientdining.com/og.jpg',
        width: 1200,
        height: 630,
        alt: 'ClientDining — Business dining in London',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "ClientDining — Business dining in London",
    description: "A private booking platform for professionals who host business dining in London.",
    images: ['https://www.clientdining.com/og.jpg'],
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
  verification: {
    // Add these after you get the codes from Google/Bing
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body className={`${inter.variable} ${cormorant.variable}`}>
      <AuthProvider>
        {children}
        <Analytics />
        <SpeedInsights />
      </AuthProvider>
      <GoogleAnalytics gaId="G-CYRRR3H4T9" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "ClientDining",
            "url": "https://www.clientdining.com",
            "description": "A private booking platform for professionals who host business dining in London.",
            "publisher": {
              "@type": "Organization",
              "name": "ClientDining",
              "url": "https://www.clientdining.com"
            }
          })
        }}
      />
    </body>
    </html>
  );
}