import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Modern Blog',
  description: 'A modern blog website with markdown support',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-white dark:bg-gray-900">
        <header className="border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <nav className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Modern Blog
              </h1>
              <div className="flex space-x-6">
                <a href="/" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
                  Home
                </a>
                <a href="/about" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
                  About
                </a>
              </div>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-gray-200 dark:border-gray-700 mt-16">
          <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2024 Modern Blog. Built with Next.js and Tailwind CSS.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}