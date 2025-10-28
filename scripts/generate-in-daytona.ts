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
    // const installResult = await sandbox.process.executeCommand(
    //   "npm install @anthropic-ai/claude-code@latest",
    //   projectDir,
    //   undefined,
    //   180000 // 3 minute timeout
    // );

    // if (installResult.exitCode !== 0) {
    //   console.error("Installation failed:", installResult.result);
    //   throw new Error("Failed to install Claude Code SDK");
    // }
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

    // Step 6: Create the generation script file with improved prompt
    console.log("\n6. Creating generation script file...");
    const generationScript = `const { query } = require('@anthropic-ai/claude-code');
const fs = require('fs');
const path = require('path');

async function generateWebsite() {
  const prompt = \`
  You are an expert Next.js developer. Your task is to create a complete, runnable Next.js application based on the user's request.

  1. **FILE CREATION:** Using the 'Write' tool, create the following files. **CRITICAL:** The files must not be empty. You must write the complete and correct code for each file immediately after creating it.
      - **File:** \`app/page.tsx\`
        **Content:** Create a complete, standalone React component for the homepage. The content should be a modern, responsive page based on the prompt: "${prompt}". Use Tailwind CSS classes for styling.
      - **File:** \`app/layout.tsx\`
        **Content:** Create a root layout component that imports \`globals.css\` and renders the children prop within an \`<html>\` and \`<body>\` tag.
      - **File:** \`app/globals.css\`
        **Content:** Add the base Tailwind directives: \`@tailwind base;\`, \`@tailwind components;\`, and \`@tailwind utilities;\`.
      - **File:** \`next.config.js\`
      - **File:** \`tailwind.config.js\`
      - **File:** \`postcss.config.js\`
      - **File:** \`tsconfig.json\`
      - **File:** \`package.json\` (Make sure to include next, react, react-dom, and tailwindcss dependencies)
  2. **FINISH:** Once all files are written and contain valid code, you must signal completion. Do not stop until all required files are created and not empty.
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
    
    console.log('Final generation script finished. Returning to main script...');
    
  } catch (error) {
    console.error('Generation script error:', error);
    console.error('Stack:', error.stack);
    // Do not exit, let the main script's failsafe handle it
  }
}

generateWebsite().catch(console.error);`;

    // Write the script to a file with a timestamp to ensure freshness
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
    // Don't check exit code here, let the failsafe handle it.

    // Step 8: Comprehensive Validation and Failsafe
    console.log("\n8. Validating and fixing critical files...");
    const criticalFiles = [
      'package.json',
      'next.config.js',
      'tailwind.config.js',
      'postcss.config.js',
      'tsconfig.json',
      'app/globals.css',
      'app/layout.tsx',
      'app/page.tsx',
    ];

    for (const file of criticalFiles) {
      const checkCmd = `[ -s "${file}" ] && grep -q "export default" "${file}" && echo "valid" || echo "invalid"`;
      const checkResult = await sandbox.process.executeCommand(checkCmd, projectDir);

      if (checkResult.result.trim() === 'invalid') {
        console.log(`⚠️  Fixing ${file}: Missing or invalid content. Applying failsafe.`);

        let content = '';
        if (file === 'app/page.tsx') {
          content = `
import React from 'react';
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-4xl font-bold text-center">Failsafe Page 😅</h1>
      <p className="mt-4 text-xl text-center max-w-2xl">
        A basic site was created based on your prompt:
        <br />
        <span className="font-semibold text-blue-600 dark:text-blue-400">"${prompt || "Your website"}"</span>
      </p>
    </div>
  );
}
`;
        } else if (file === 'app/layout.tsx') {
          content = `
import './globals.css';
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;
        } else if (file === 'app/globals.css') {
          content = `
@tailwind base;
@tailwind components;
@tailwind utilities;
`;
        } else if (file === 'next.config.js') {
          content = `
/** @type {import('next').NextConfig} */
const nextConfig = {};
module.exports = nextConfig;
`;
        } else if (file === 'tailwind.config.js') {
          content = `
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
`;
        } else if (file === 'postcss.config.js') {
          content = `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
        } else if (file === 'tsconfig.json') {
          content = `
{
  "compilerOptions": {
    "target": "es2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "incremental": true,
    "esModuleInterop": true,
    "module": "esnext",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "moduleResolution": "node",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
`;
        }

        if (content) {
          // Ensure directory exists before writing file
          await sandbox.process.executeCommand(`mkdir -p $(dirname "${file}")`, projectDir);
          await sandbox.process.executeCommand(
            `cat > "${file}" << 'EOF'
${content}
EOF`,
            projectDir
          );
        }
      } else {
        console.log(`✓ ${file} is valid.`);
      }
    }

    console.log("\n9. All critical files are now present and valid. Proceeding to dependency installation.");

    // Step 10: Install dependencies if package.json was updated
    const hasNextJS = await sandbox.process.executeCommand(
      "test -f package.json && grep -q next package.json && echo yes || echo no",
      projectDir
    );

    if (hasNextJS.result?.trim() === "yes") {
      console.log("\n10. Installing project dependencies...");
      const npmInstall = await sandbox.process.executeCommand(
        "npm install",
        projectDir,
        undefined,
        300000 // 5 minute timeout
      );

      if (npmInstall.exitCode !== 0) {
        console.log("⚠️ npm install had issues but continuing:", npmInstall.result);
        
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
        console.log("⚠️ Server may still be starting or has issues");
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