import { Daytona } from "@daytonaio/sdk";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

async function debugSandbox() {
  try {
    console.log("🔍 Starting comprehensive sandbox debugging...");
    
    const daytona = new Daytona({
      apiKey: process.env.DAYTONA_API_KEY!,
    });

    // Create sandbox
    console.log("🚀 Creating sandbox...");
    const sandbox = await daytona.create({
      public: true,
      image: "node:20",
    });
    console.log(`✅ Sandbox created: ${sandbox.id}`);

    // Get root directory
    const rootDir = await sandbox.getUserRootDir();
    const projectDir = `${rootDir}/website-project`;
    console.log(`📁 Project directory: ${projectDir}`);

    // Setup project
    console.log("📦 Setting up project...");
    await sandbox.process.executeCommand(`mkdir -p ${projectDir}`, rootDir);
    await sandbox.process.executeCommand("npm init -y", projectDir);

    // Install dependencies
    console.log("📦 Installing dependencies...");
    const installResult = await sandbox.process.executeCommand(
      "npm install @anthropic-ai/claude-code@latest",
      projectDir,
      undefined,
      180000
    );
    console.log("Install result:", installResult);

    // Create a simple test website
    console.log("🏗️ Creating test website...");
    
    // Create package.json
    await sandbox.process.executeCommand(
      `cat > package.json << 'EOF'
{
  "name": "test-website",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
EOF`,
      projectDir
    );

    // Create next.config.js
    await sandbox.process.executeCommand(
      `cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
}
module.exports = nextConfig
EOF`,
      projectDir
    );

    // Create tsconfig.json
    await sandbox.process.executeCommand(
      `cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF`,
      projectDir
    );

    // Create tailwind.config.js
    await sandbox.process.executeCommand(
      `cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF`,
      projectDir
    );

    // Create postcss.config.js
    await sandbox.process.executeCommand(
      `cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF`,
      projectDir
    );

    // Create app directory
    await sandbox.process.executeCommand("mkdir -p app", projectDir);

    // Create app/layout.tsx
    await sandbox.process.executeCommand(
      `cat > app/layout.tsx << 'EOF'
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Test Website',
  description: 'Generated test website',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
EOF`,
      projectDir
    );

    // Create app/globals.css
    await sandbox.process.executeCommand(
      `cat > app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF`,
      projectDir
    );

    // Create app/page.tsx
    await sandbox.process.executeCommand(
      `cat > app/page.tsx << 'EOF'
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold text-center mb-8">
          Test Website Generated Successfully!
        </h1>
        <p className="text-center text-gray-600">
          This is a simple test website to verify the generation process.
        </p>
      </div>
    </main>
  )
}
EOF`,
      projectDir
    );

    // Install Next.js dependencies
    console.log("📦 Installing Next.js dependencies...");
    const nextInstallResult = await sandbox.process.executeCommand(
      "npm install",
      projectDir,
      undefined,
      300000
    );
    console.log("Next.js install result:", nextInstallResult);

    // Check what files were created
    console.log("📋 Checking created files...");
    const lsResult = await sandbox.process.executeCommand(
      "find . -type f -name '*.tsx' -o -name '*.ts' -o -name '*.js' -o -name '*.json' -o -name '*.css' | sort",
      projectDir
    );
    console.log("Files created:", lsResult.result);

    // Try to start the development server
    console.log("🚀 Starting development server...");
    const devResult = await sandbox.process.executeCommand(
      "nohup npm run dev > dev-server.log 2>&1 &",
      projectDir,
      { PORT: "3000" }
    );
    console.log("Dev server start result:", devResult);

    // Wait for server to start
    console.log("⏳ Waiting for server to start...");
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Check if server is running
    console.log("🔍 Checking server status...");
    const serverCheck = await sandbox.process.executeCommand(
      "ps aux | grep 'npm run dev' | grep -v grep",
      projectDir
    );
    console.log("Server process check:", serverCheck.result);

    // Check server logs
    console.log("📄 Checking server logs...");
    const logCheck = await sandbox.process.executeCommand(
      "cat dev-server.log",
      projectDir
    );
    console.log("Server logs:", logCheck.result);

    // Try to get preview URL
    console.log("🔗 Getting preview URL...");
    try {
      const preview = await sandbox.getPreviewLink(3000);
      console.log("✅ Preview URL:", preview.url);
      
      // Test the URL
      console.log("🌐 Testing preview URL...");
      const testResult = await sandbox.process.executeCommand(
        `curl -s -o /dev/null -w "%{http_code}" ${preview.url}`,
        projectDir
      );
      console.log("URL test result:", testResult.result);
      
    } catch (previewError) {
      console.error("❌ Preview URL error:", previewError);
    }

    console.log("✅ Debugging complete!");

  } catch (error) {
    console.error("❌ Debug error:", error);
  }
}

debugSandbox().catch(console.error);
