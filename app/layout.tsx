import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Wedex — Wedding Budget Planner',
  description: 'Plan what you\'ll spend. Wedex watches and makes every dollar work harder.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Wedex',
  },
}

export const viewport: Viewport = {
  themeColor: '#F2A99F',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased bg-warm-white`}>
        {children}
      </body>
    </html>
  )
}
