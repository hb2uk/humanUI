import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { EntityNavigation } from '../components/EntityNavigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HumanUI Admin',
  description: 'Admin dashboard for HumanUI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <EntityNavigation />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  )
} 