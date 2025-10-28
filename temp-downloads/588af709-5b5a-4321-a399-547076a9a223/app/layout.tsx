import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Modern Blog - Markdown Publishing Platform',
  description: 'A beautiful, modern blog platform with full markdown support for writers and developers',
  keywords: ['blog', 'markdown', 'writing', 'publishing', 'next.js'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet" />
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        backgroundColor: '#fafafa',
        color: '#1a1a1a',
        lineHeight: 1.6,
      }}>
        {children}
      </body>
    </html>
  )
}
