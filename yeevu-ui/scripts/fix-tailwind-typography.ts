import { Daytona } from "@daytonaio/sdk";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

async function fixTailwindTypography(sandboxId: string) {
  console.log("🔧 Fixing Tailwind CSS typography plugin issue...\n");

  if (!process.env.DAYTONA_API_KEY) {
    console.error("ERROR: DAYTONA_API_KEY must be set");
    process.exit(1);
  }

  const daytona = new Daytona({
    apiKey: process.env.DAYTONA_API_KEY,
  });

  try {
    // Connect to existing sandbox
    console.log(`1. Connecting to sandbox: ${sandboxId}`);
    const sandbox = await daytona.get(sandboxId);
    console.log("✓ Connected to sandbox");

    // Get the project directory
    const rootDir = await sandbox.getUserRootDir();
    const projectDir = `${rootDir}/website-project`;
    console.log(`✓ Project directory: ${projectDir}`);

    // Step 2: Install the missing @tailwindcss/typography plugin
    console.log("\n2. Installing @tailwindcss/typography plugin...");
    const installResult = await sandbox.process.executeCommand(
      "npm install @tailwindcss/typography",
      projectDir
    );

    if (installResult.exitCode !== 0) {
      console.error("Installation failed:", installResult.result);
      throw new Error("Failed to install @tailwindcss/typography");
    }
    console.log("✓ @tailwindcss/typography plugin installed");

    // Step 3: Check if tailwind.config.js exists and fix it if needed
    console.log("\n3. Checking tailwind.config.js...");
    const configCheck = await sandbox.process.executeCommand(
      "test -f tailwind.config.js && echo 'exists' || echo 'missing'",
      projectDir
    );

    if (configCheck.result?.trim() === 'exists') {
      console.log("✓ tailwind.config.js exists");
      
      // Read the current config to see if it needs fixing
      const readConfig = await sandbox.process.executeCommand(
        "cat tailwind.config.js",
        projectDir
      );
      
      console.log("Current config:", readConfig.result);
      
      // If the config doesn't have the typography plugin, add it
      if (!readConfig.result?.includes('@tailwindcss/typography')) {
        console.log("\n4. Adding typography plugin to tailwind.config.js...");
        
        // Create a fixed tailwind.config.js
        const fixedConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};`;

        await sandbox.process.executeCommand(
          `cat > tailwind.config.js << 'EOF'
${fixedConfig}
EOF`,
          projectDir
        );
        console.log("✓ Updated tailwind.config.js with typography plugin");
      } else {
        console.log("✓ tailwind.config.js already has typography plugin");
      }
    } else {
      console.log("Creating tailwind.config.js with typography plugin...");
      
      const newConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};`;

      await sandbox.process.executeCommand(
        `cat > tailwind.config.js << 'EOF'
${newConfig}
EOF`,
        projectDir
      );
      console.log("✓ Created tailwind.config.js with typography plugin");
    }

    // Step 4: Restart the development server
    console.log("\n5. Restarting development server...");
    
    // Kill any existing servers
    await sandbox.process.executeCommand(
      "pkill -f 'npm run dev' || pkill -f 'next dev' || true",
      projectDir
    );

    // Start the server in background
    await sandbox.process.executeCommand(
      `nohup npm run dev -- --port 3000 > dev-server.log 2>&1 &`,
      projectDir,
      { PORT: "3000" }
    );

    console.log("✓ Server restarted");

    // Step 5: Wait for server to be ready
    console.log("\n6. Waiting for server to start...");
    let serverRunning = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!serverRunning && attempts < maxAttempts) {
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
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
        
        // Show recent logs if server is having issues
        if (attempts > 3) {
          const logs = await sandbox.process.executeCommand(
            "tail -10 dev-server.log",
            projectDir
          );
          console.log("Recent server logs:", logs.result);
        }
      }
    }

    if (serverRunning) {
      console.log("\n✅ SUCCESS! Tailwind typography issue fixed!");
      console.log("🌐 Your website should now be working at:");
      console.log(`https://3000-${sandboxId}.proxy.daytona.works`);
    } else {
      console.log("\n⚠️ Server may still be starting or has other issues");
      console.log("Check the server logs for more details");
    }

  } catch (error: any) {
    console.error("\n❌ ERROR:", error.message);
    throw error;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error("Usage: npx tsx scripts/fix-tailwind-typography.ts <sandbox-id>");
    console.error("Example: npx tsx scripts/fix-tailwind-typography.ts 8deed679-17de-4d4c-b09a-e6208516f61a");
    process.exit(1);
  }

  const sandboxId = args[0];

  try {
    await fixTailwindTypography(sandboxId);
  } catch (error) {
    console.error("Failed to fix Tailwind typography issue:", error);
    process.exit(1);
  }
}

main();
