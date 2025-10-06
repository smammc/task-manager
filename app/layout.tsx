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
  title: 'Task Manager',
  description: 'A modern project management application built with Next.js and Tailwind CSS',
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
