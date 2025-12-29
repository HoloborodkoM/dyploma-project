import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import PreloaderWrapper from '@/components/PreloaderWrapper'
import { AuthProvider } from '@/components/AuthContext'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'Платформа для навчання навичкам екстреної медичної допомоги',
  description: 'Інтерактивна платформа для навчання навичкам екстреної медичної допомоги',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk">
      <body className={`${inter.className} bg-gray-800 min-h-screen flex flex-col`}>
        <AuthProvider>
          <PreloaderWrapper>
            <main className="flex-1 bg-white rounded-t-lg">
              {children}
            </main>
          </PreloaderWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}