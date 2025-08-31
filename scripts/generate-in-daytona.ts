import { Daytona } from "@daytonaio/sdk";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

async function generateWebsiteInDaytona(
  sandboxIdArg?: string,
  prompt?: string
) {
  console.log("🚀 Starting website generation in Daytona sandbox...\n");

  if (!process.env.DAYTONA_API_KEY || !process.env.ANTHROPIC_API_KEY) {
    console.error("ERROR: DAYTONA_API_KEY and ANTHROPIC_API_KEY must be set");
    process.exit(1);
  }

  const daytona = new Daytona({
    apiKey: process.env.DAYTONA_API_KEY,
  });

  let sandbox;
  let sandboxId = sandboxIdArg;

  try {
    // Step 1: Always create a fresh sandbox for generation
    console.log("1. Creating new Daytona sandbox...");
    sandbox = await daytona.create({
      public: true,
      image: "node:20",
    });
    sandboxId = sandbox.id;
    console.log(`✓ Sandbox created: ${sandboxId}`);
    
    // If an old sandboxId was provided, ignore it and use the new one
    if (sandboxIdArg) {
      console.log(`Note: Ignoring provided sandbox ${sandboxIdArg} and using fresh ${sandboxId}`);
    }

    // Get the root directory
    const rootDir = await sandbox.getUserRootDir();
    console.log(`✓ Working directory: ${rootDir}`);

    // Step 2: Create project directory
    console.log("\n2. Setting up project directory...");
    const projectDir = `${rootDir}/website-project`;
    await sandbox.process.executeCommand(`mkdir -p ${projectDir}`, rootDir);
    console.log(`✓ Created project directory: ${projectDir}`);

    // Step 3: Initialize npm project
    console.log("\n3. Initializing npm project...");
    const npmInitResult = await sandbox.process.executeCommand("npm init -y", projectDir);
    if (npmInitResult.exitCode !== 0) {
      throw new Error(`Failed to initialize npm project: ${npmInitResult.result}`);
    }
    console.log("✓ Package.json created");

    // Step 4: Install Claude Code SDK locally in project
    console.log("\n4. Installing Claude Code SDK locally...");
    const installResult = await sandbox.process.executeCommand(
      "npm install @anthropic-ai/claude-code@latest",
      projectDir,
      undefined,
      180000 // 3 minute timeout
    );

    if (installResult.exitCode !== 0) {
      console.error("Installation failed:", installResult.result);
      throw new Error("Failed to install Claude Code SDK");
    }
    console.log("✓ Claude Code SDK installed");

    // Verify installation
    console.log("\n5. Verifying installation...");
    const checkInstall = await sandbox.process.executeCommand(
      "ls -la node_modules/@anthropic-ai/claude-code",
      projectDir
    );
    
    if (checkInstall.exitCode !== 0) {
      throw new Error("Claude Code SDK installation verification failed");
    }
    console.log("Installation check:", checkInstall.result);

    // Step 6: Create the generation script file
    console.log("\n6. Creating generation script file...");

    const generationScript = `const { query } = require('@anthropic-ai/claude-code');
const fs = require('fs');

async function generateWebsite() {
  const prompt = \`${
    prompt ||
    "Create a modern blog website with markdown support and a dark theme"
  }

  Build a Next.js app with TypeScript and Tailwind CSS.

  REQUIRED FILES:
  • package.json (Next.js, React, TypeScript, Tailwind dependencies)
  • next.config.js, tailwind.config.js, postcss.config.js, tsconfig.json
  • app/globals.css (@tailwind base; @tailwind components; @tailwind utilities;)
  • app/layout.tsx (React component with RootLayout export)
  • app/page.tsx (React component with Home export)

  CRITICAL RULES:
  • Create components BEFORE importing them
  • Use proper spacing: py-16, mb-8, max-w-6xl mx-auto px-4
  • Verify the required files exist before finishing

  EXAMPLE app/layout.tsx:
  import './globals.css'
  export default function RootLayout({children}: {children: React.ReactNode}) {
    return <html><body>{children}</body></html>
  }
  \`;

  console.log('Starting website generation with Claude Code...');
  console.log('Working directory:', process.cwd());
  
  const messages = [];
  const abortController = new AbortController();
  
  try {
    for await (const message of query({
      prompt: prompt,
      abortController: abortController,
      options: {
        maxTurns: 20,
        allowedTools: [
          'Read',
          'Write',
          'Edit',
          'MultiEdit',
          'Bash',
          'LS',
          'Glob',
          'Grep'
        ]
      }
    })) {
      messages.push(message);
      
      // Log progress
      if (message.type === 'text') {
        console.log('[Claude]:', (message.text || '').substring(0, 80) + '...');
        console.log('__CLAUDE_MESSAGE__', JSON.stringify({ type: 'assistant', content: message.text }));
      } else if (message.type === 'tool_use') {
        console.log('[Tool]:', message.name, message.input?.file_path || '');
        console.log('__TOOL_USE__', JSON.stringify({ 
          type: 'tool_use', 
          name: message.name, 
          input: message.input 
        }));
      } else if (message.type === 'result') {
        console.log('__TOOL_RESULT__', JSON.stringify({ 
          type: 'tool_result', 
          result: message.result 
        }));
      }
    }
    
    console.log('\\nGeneration complete!');
    console.log('Total messages:', messages.length);
    
    // Save generation log
    fs.writeFileSync('generation-log.json', JSON.stringify(messages, null, 2));
    
    // List generated files
    const files = fs.readdirSync('.').filter(f => !f.startsWith('.'));
    console.log('\\nGenerated files:', files.join(', '));
    
    // Verify critical files exist
    const criticalFiles = ['package.json', 'app/layout.tsx', 'app/page.tsx'];
    const missingFiles = [];
    
    for (const file of criticalFiles) {
      if (!fs.existsSync(file)) {
        missingFiles.push(file);
      }
    }
    
    if (missingFiles.length > 0) {
      console.error('\\n❌ CRITICAL FILES MISSING:', missingFiles.join(', '));
      console.log('Available files in app directory:');
      try {
        const appFiles = fs.readdirSync('./app');
        console.log('App files:', appFiles.join(', '));
      } catch (e) {
        console.log('App directory does not exist');
      }
      console.error('Generation failed - required React components not created');
      process.exit(1);
    } else {
      console.log('\\n✅ All critical files verified');
      
      // Verify the files contain React components
      try {
        const layoutContent = fs.readFileSync('app/layout.tsx', 'utf8');
        const pageContent = fs.readFileSync('app/page.tsx', 'utf8');
        
        if (!layoutContent.includes('export default') || !pageContent.includes('export default')) {
          console.error('❌ React components missing export default');
          process.exit(1);
        }
        
        console.log('✅ React components verified');
      } catch (e) {
        console.error('❌ Error reading React components:', e.message);
        process.exit(1);
      }
    }
    
  } catch (error) {
    console.error('Generation error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

generateWebsite().catch(console.error);`;

    // Write the script to a file with timestamp to ensure freshness
    const timestamp = new Date().getTime();
    const scriptName = `generate-${timestamp}.js`;
    
    const writeResult = await sandbox.process.executeCommand(
      `cat > ${scriptName} << 'SCRIPT_EOF'
${generationScript}
SCRIPT_EOF`,
      projectDir
    );
    
    if (writeResult.exitCode !== 0) {
      throw new Error(`Failed to write generation script: ${writeResult.result}`);
    }
    console.log(`✓ Generation script written to ${scriptName}`);

    // Verify the script was created
    const checkScript = await sandbox.process.executeCommand(
      `ls -la ${scriptName} && head -10 ${scriptName}`,
      projectDir
    );
    console.log("Script verification:", checkScript.result);

    // Step 7: Run the generation script
    console.log("\n7. Running Claude Code generation...");
    console.log(`Prompt: "${prompt || "Create a modern blog website"}"`);
    console.log("\nThis may take several minutes...\n");

    const genResult = await sandbox.process.executeCommand(
      `node ${scriptName}`,
      projectDir,
      {
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
        NODE_PATH: `${projectDir}/node_modules`,
      },
      600000 // 10 minute timeout
    );

    console.log("\nGeneration output:");
    console.log(genResult.result);

    if (genResult.exitCode !== 0) {
      throw new Error("Generation failed");
    }

    // Step 8: Check generated files
    console.log("\n8. Checking generated files...");
    const filesResult = await sandbox.process.executeCommand(
      "ls -la",
      projectDir
    );
    console.log(filesResult.result);

    // Step 9: Install dependencies if package.json was updated
    const hasNextJS = await sandbox.process.executeCommand(
      "test -f package.json && grep -q next package.json && echo yes || echo no",
      projectDir
    );

    if (hasNextJS.result?.trim() === "yes") {
      console.log("\n9. Installing project dependencies...");
      const npmInstall = await sandbox.process.executeCommand(
        "npm install",
        projectDir,
        undefined,
        300000 // 5 minute timeout
      );

      if (npmInstall.exitCode !== 0) {
        console.log("⚠️  npm install had issues but continuing:", npmInstall.result);
        
        // Try to fix common npm issues and retry once
        console.log("Attempting to fix npm issues and retry...");
        await sandbox.process.executeCommand("rm -rf node_modules package-lock.json", projectDir);
        
        const retryInstall = await sandbox.process.executeCommand(
          "npm install --no-audit --no-fund",
          projectDir,
          undefined,
          300000
        );
        
        if (retryInstall.exitCode !== 0) {
          throw new Error(`npm install failed after retry: ${retryInstall.result}`);
        }
        console.log("✓ Dependencies installed after retry");
      } else {
        console.log("✓ Dependencies installed");
      }

      // Step 10: Check for critical files before starting server
      console.log("\n10. Checking critical files...");
      const criticalFiles = ['app/layout.tsx', 'app/page.tsx', 'next.config.js', 'tailwind.config.js'];
      let missingFiles = [];
      
      for (const file of criticalFiles) {
        const checkFile = await sandbox.process.executeCommand(
          `test -f ${file} && echo "exists" || echo "missing"`,
          projectDir
        );
        if (checkFile.result?.trim() === 'missing') {
          missingFiles.push(file);
        }
      }
      
      if (missingFiles.length > 0) {
        console.log(`⚠️  Missing critical files: ${missingFiles.join(', ')}`);
        console.log("Attempting to create minimal files...");
        
        // Create minimal app/page.tsx if missing
        if (missingFiles.includes('app/page.tsx')) {
          await sandbox.process.executeCommand(
            `mkdir -p app && cat > app/page.tsx << 'EOF'
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Welcome to My Portfolio</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">Your website has been generated successfully! This is a placeholder portfolio page.</p>
          <div className="inline-flex gap-3 mb-12">
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium">Next.js</span>
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium">TypeScript</span>
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium">Tailwind CSS</span>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">About Me</h2>
          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto">
            This is a generated portfolio website. Add your own content, projects, and styling to make it your own.
          </p>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Project {i}</h3>
                  <p className="text-gray-600">Description of project {i}. Add your own projects here.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
EOF`,
            projectDir
          );
        }
        
        // Create minimal app/layout.tsx if missing
        if (missingFiles.includes('app/layout.tsx')) {
          await sandbox.process.executeCommand(
            `mkdir -p app && cat > app/layout.tsx << 'EOF'
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Generated Website',
  description: 'Created with Claude Code',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
EOF`,
            projectDir
          );
        }
        
        // Create minimal globals.css if missing
        await sandbox.process.executeCommand(
          `mkdir -p app && cat > app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF`,
          projectDir
        );
        
        // Create next.config.js if missing
        if (missingFiles.includes('next.config.js')) {
          await sandbox.process.executeCommand(
            `cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;
EOF`,
            projectDir
          );
        }
        
        // Create tailwind.config.js if missing
        if (missingFiles.includes('tailwind.config.js')) {
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
};
EOF`,
            projectDir
          );
        }
      }

      // Step 11: Start dev server in background  
      console.log("\n11. Starting development server...");

      // Kill any existing servers first
      await sandbox.process.executeCommand(
        "pkill -f 'npm run dev' || pkill -f 'next dev' || true",
        projectDir
      );

      // Start the server in background using nohup
      await sandbox.process.executeCommand(
        `nohup npm run dev -- --port 3000 > dev-server.log 2>&1 &`,
        projectDir,
        { PORT: "3000" }
      );

      console.log("✓ Server started in background");

      // Wait for server to initialize with progressive checks
      console.log("Waiting for server to start...");
      let serverRunning = false;
      let attempts = 0;
      const maxAttempts = 15;

      while (!serverRunning && attempts < maxAttempts) {
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        console.log(`Checking server... (${attempts}/${maxAttempts})`);
        
        const checkServer = await sandbox.process.executeCommand(
          "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 || echo 'failed'",
          projectDir
        );

        if (checkServer.result?.trim() === '200') {
          serverRunning = true;
          console.log("✓ Server is running and responding!");
        } else {
          console.log(`Server not ready yet... (got: ${checkServer.result?.trim()})`);
          
          // Check server logs for errors
          if (attempts % 3 === 0) {
            const logs = await sandbox.process.executeCommand(
              "tail -5 dev-server.log || echo 'No logs yet'",
              projectDir
            );
            console.log("Recent server logs:", logs.result);
          }
        }
      }
      
      if (!serverRunning) {
        console.log("⚠️  Server may still be starting or has issues");
        const fullLogs = await sandbox.process.executeCommand(
          "cat dev-server.log || echo 'No logs'",
          projectDir
        );
        console.log("Full server logs:", fullLogs.result);
        
        // Don't fail here - server might work even if health check fails
        console.log("Proceeding despite server health check issues...");
      }
    }

    // Step 12: Get preview URL
    console.log("\n12. Getting preview URL...");
    let preview;
    
    try {
      preview = await sandbox.getPreviewLink(3000);
      if (!preview || !preview.url) {
        throw new Error("Preview URL not generated");
      }
    } catch (error: any) {
      console.error("Failed to get preview URL:", error.message);
      throw new Error(`Preview URL generation failed: ${error.message}`);
    }

    console.log("\n✨ SUCCESS! Website generated!");
    console.log("\n📊 SUMMARY:");
    console.log("===========");
    console.log(`Sandbox ID: ${sandboxId}`);
    console.log(`Project Directory: ${projectDir}`);
    console.log(`Preview URL: ${preview.url}`);
    if (preview.token) {
      console.log(`Access Token: ${preview.token}`);
    }

    console.log("\n🌐 VISIT YOUR WEBSITE:");
    console.log(preview.url);

    console.log("\n💡 TIPS:");
    console.log("- The sandbox will stay active for debugging");
    console.log("- Server logs: SSH in and run 'cat website-project/dev-server.log'");
    console.log(
      `- To get preview URL again: npx tsx scripts/get-preview-url.ts ${sandboxId}`
    );
    console.log(
      `- To reuse this sandbox: npx tsx scripts/generate-in-daytona.ts ${sandboxId}`
    );
    console.log(`- To remove: npx tsx scripts/remove-sandbox.ts ${sandboxId}`);

    return {
      success: true,
      sandboxId: sandboxId,
      projectDir: projectDir,
      previewUrl: preview.url,
    };
  } catch (error: any) {
    console.error("\n❌ ERROR:", error.message);

    if (sandbox && sandboxId) {
      console.log(`\nSandbox ID: ${sandboxId}`);
      console.log("The sandbox is still running for debugging.");

      // Try to get comprehensive debug info
      try {
        const rootDir = await sandbox.getUserRootDir();
        const projectDir = `${rootDir}/website-project`;
        
        // Check multiple things in parallel for better debugging
        const [dirInfo, packageInfo, appDirInfo, serverLogs] = await Promise.allSettled([
          sandbox.process.executeCommand("pwd && ls -la", projectDir),
          sandbox.process.executeCommand("test -f package.json && cat package.json | head -10 || echo 'No package.json'", projectDir),
          sandbox.process.executeCommand("test -d app && ls -la app || echo 'No app directory'", projectDir),
          sandbox.process.executeCommand("test -f dev-server.log && tail -20 dev-server.log || echo 'No server logs'", projectDir)
        ]);
        
        console.log("\n🔍 Debug Information:");
        console.log("===================");
        
        if (dirInfo.status === 'fulfilled') {
          console.log("Directory contents:", dirInfo.value.result);
        }
        
        if (packageInfo.status === 'fulfilled') {
          console.log("Package.json:", packageInfo.value.result);
        }
        
        if (appDirInfo.status === 'fulfilled') {
          console.log("App directory:", appDirInfo.value.result);
        }
        
        if (serverLogs.status === 'fulfilled') {
          console.log("Server logs:", serverLogs.value.result);
        }
        
      } catch (e) {
        console.log("Could not retrieve debug info:", e);
      }
    }

    throw error;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  let sandboxId: string | undefined;
  let prompt: string | undefined;

  // Parse arguments
  if (args.length > 0) {
    // Check if first arg is a sandbox ID (UUID format)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(args[0])) {
      sandboxId = args[0];
      prompt = args.slice(1).join(" ");
    } else {
      prompt = args.join(" ");
    }
  }

  if (!prompt) {
    prompt =
      "Create a modern blog website with markdown support and a dark theme. Include a home page, blog listing page, and individual blog post pages.";
  }

  console.log("📝 Configuration:");
  console.log(
    `- Sandbox: ${sandboxId ? `Using existing ${sandboxId}` : "Creating new"}`
  );
  console.log(`- Prompt: ${prompt}`);
  console.log();

  try {
    await generateWebsiteInDaytona(sandboxId, prompt);
  } catch (error) {
    console.error("Failed to generate website:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n👋 Exiting... The sandbox will continue running.");
  process.exit(0);
});

main();
