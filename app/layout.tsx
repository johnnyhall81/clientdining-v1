import type { Metadata } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
})

import { AuthProvider } from '@/contexts/AuthContext'
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  title: "ClientDining - Premium Restaurant & Club Reservations for City Professionals",
  description: "Exclusive access to London's finest restaurants and private members' clubs. Verified professional network for City executives. Book premium tables at top venues.",
  keywords: "London restaurants, fine dining, private members clubs, City professionals, premium reservations, exclusive dining",
  authors: [{ name: "ClientDining" }],
  creator: "ClientDining",
  publisher: "ClientDining",
  metadataBase: new URL('https://www.clientdining.com'),
  alternates: {
    canonical: 'https://www.clientdining.com',
  },
  openGraph: {
    title: "ClientDining - Premium Restaurant Reservations",
    description: "Exclusive access to London's finest restaurants and private members' clubs for verified City professionals.",
    url: 'https://www.clientdining.com',
    siteName: 'ClientDining',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "ClientDining - Premium Restaurant Reservations",
    description: "Exclusive access to London's finest restaurants and private members' clubs.",
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
    </body>
    </html>
  );
}