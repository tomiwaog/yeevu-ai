// Fixed generation prompt that should force file creation
const fixedPrompt = `You are tasked with creating a complete Next.js website from scratch in an EMPTY directory.

USER REQUEST: create a website about mobile phones

TASK: Build this as a complete Next.js app with TypeScript and Tailwind CSS.

CRITICAL: You MUST create ALL files listed below. The directory is currently EMPTY.

REQUIRED FILES TO CREATE:
1. package.json - Next.js project with React, TypeScript, Tailwind dependencies
2. next.config.js - Next.js configuration  
3. tailwind.config.js - Tailwind CSS configuration
4. postcss.config.js - PostCSS configuration
5. tsconfig.json - TypeScript configuration
6. app/globals.css - Global styles with Tailwind directives
7. app/layout.tsx - Root layout component
8. app/page.tsx - Homepage component (MOST IMPORTANT - THIS FILE MUST BE CREATED)

START by creating package.json first, then create ALL other files.

EXAMPLE app/page.tsx (YOU MUST CREATE THIS):
export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <h1 className="text-4xl font-bold text-center py-16">Mobile Phone Central</h1>
      <p className="text-center text-gray-600">Your guide to the latest smartphones</p>
    </div>
  );
}

EXAMPLE app/layout.tsx:
import './globals.css'
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

DO NOT assume any files exist. CREATE everything from scratch.`;

console.log("Fixed prompt:");
console.log(fixedPrompt);