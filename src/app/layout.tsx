import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Math Tutor',
  description: 'An AI-powered math tutoring application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

