import { Poppins } from 'next/font/google'
import './globals.css'
import { ReactQueryProvider } from '@/components/ReactQueryProvider'
import React from 'react'

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

export const metadata = {
  title: 'Next.js Dashboard App',
  description: 'A modern dashboard application built with Next.js',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-[family-name:var(--font-poppins)] antialiased`}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  )
}
