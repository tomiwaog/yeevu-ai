import { Daytona } from "@daytonaio/sdk";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });

async function debugSandboxStructure(sandboxId: string) {
  if (!process.env.DAYTONA_API_KEY) {
    console.error("ERROR: DAYTONA_API_KEY must be set");
    process.exit(1);
  }

  const daytona = new Daytona({
    apiKey: process.env.DAYTONA_API_KEY,
  });

  try {
    // Connect to existing sandbox
    const sandbox = await daytona.get(sandboxId);
    const rootDir = await sandbox.getUserRootDir();
    const projectDir = `${rootDir}/website-project`;

    console.log(`🔍 Debugging sandbox: ${sandboxId}`);
    console.log(`📁 Project directory: ${projectDir}`);

    // Run the optimized tree command you suggested
    const treeResult = await sandbox.process.executeCommand(
      `find . -maxdepth 8 -not -path '*/node_modules*' \\( -name '.env' -o -not -path '*/\\.*' \\) | sort | sed -e "s/[^-][^\/]*\\// |/g" -e "s/|\\([^ ]\\)/|-\\1/"`,
      projectDir
    );

    console.log("\n📂 File Structure:");
    console.log("==================");
    console.log(treeResult.result);

    // Specifically check for page.tsx files anywhere
    console.log("\n🔍 Searching for page.tsx files:");
    console.log("================================");
    const pageSearch = await sandbox.process.executeCommand(
      `find . -name "*page*" -type f`,
      projectDir
    );
    console.log(pageSearch.result);

    // Check app directory contents specifically
    console.log("\n📁 App directory contents:");
    console.log("========================");
    const appContents = await sandbox.process.executeCommand(
      `ls -la app/ 2>/dev/null || echo "app directory does not exist"`,
      projectDir
    );
    console.log(appContents.result);

    // Check if there are any React/TSX files
    console.log("\n⚛️  React/TypeScript files:");
    console.log("=========================");
    const reactFiles = await sandbox.process.executeCommand(
      `find . -name "*.tsx" -o -name "*.jsx" | head -10`,
      projectDir
    );
    console.log(reactFiles.result);

    // Check if there's any content in existing files
    console.log("\n📄 Key file contents:");
    console.log("====================");
    
    // Check layout.tsx
    const layoutCheck = await sandbox.process.executeCommand(
      `if [ -f app/layout.tsx ]; then echo "=== app/layout.tsx (first 10 lines) ==="; head -10 app/layout.tsx; fi`,
      projectDir
    );
    console.log(layoutCheck.result);

    // Check package.json
    const packageCheck = await sandbox.process.executeCommand(
      `if [ -f package.json ]; then echo "=== package.json ==="; cat package.json; fi`,
      projectDir
    );
    console.log(packageCheck.result);

    // Check for any generation logs
    console.log("\n📋 Generation logs:");
    console.log("==================");
    const logFiles = await sandbox.process.executeCommand(
      `find . -name "*log*" -type f | head -5`,
      projectDir
    );
    console.log(logFiles.result);

    // Show recent generation log if exists
    const genLog = await sandbox.process.executeCommand(
      `if [ -f generation-log.json ]; then echo "=== Last few generation messages ==="; tail -n 20 generation-log.json; fi`,
      projectDir
    );
    console.log(genLog.result);

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

// Get sandbox ID from command line
const sandboxId = process.argv[2];
if (!sandboxId) {
  console.error("Usage: npx tsx debug-sandbox-structure.ts <sandbox-id>");
  console.log("From the logs, the sandbox ID was: 5dd6e151-855b-43ec-88ba-4c255233a6e6");
  process.exit(1);
}

debugSandboxStructure(sandboxId).catch(console.error);