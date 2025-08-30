import { Daytona } from "@daytonaio/sdk";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

async function investigateSandbox(sandboxId: string) {
  try {
    console.log(`🔍 Investigating sandbox: ${sandboxId}`);
    
    const daytona = new Daytona({
      apiKey: process.env.DAYTONA_API_KEY!,
    });

    // Get the sandbox
    const sandbox = await daytona.get(sandboxId);
    console.log(`✅ Sandbox found: ${sandbox.id}`);
    console.log(`📊 Status: ${sandbox.status}`);

    // Get root directory
    const rootDir = await sandbox.getUserRootDir();
    const projectDir = `${rootDir}/website-project`;
    console.log(`📁 Project directory: ${projectDir}`);

    // Check if project directory exists
    console.log("🔍 Checking project structure...");
    const dirCheck = await sandbox.process.executeCommand(
      "ls -la",
      rootDir
    );
    console.log("Root directory contents:", dirCheck.result);

    // Check if website-project exists
    const projectCheck = await sandbox.process.executeCommand(
      "ls -la",
      projectDir
    );
    console.log("Project directory contents:", projectCheck.result);

    // Check what files were created
    console.log("📋 Checking all created files...");
    const fileCheck = await sandbox.process.executeCommand(
      "find . -type f -name '*.tsx' -o -name '*.ts' -o -name '*.js' -o -name '*.json' -o -name '*.css' | head -20",
      projectDir
    );
    console.log("Files found:", fileCheck.result);

    // Check if app directory exists
    console.log("📁 Checking app directory...");
    const appCheck = await sandbox.process.executeCommand(
      "ls -la app/",
      projectDir
    );
    console.log("App directory contents:", appCheck.result);

    // Check if layout.tsx exists
    console.log("📄 Checking layout.tsx...");
    const layoutCheck = await sandbox.process.executeCommand(
      "cat app/layout.tsx",
      projectDir
    );
    console.log("Layout.tsx content:", layoutCheck.result);

    // Check if page.tsx exists
    console.log("📄 Checking page.tsx...");
    const pageCheck = await sandbox.process.executeCommand(
      "cat app/page.tsx",
      projectDir
    );
    console.log("Page.tsx content:", pageCheck.result);

    // Check package.json
    console.log("📦 Checking package.json...");
    const packageCheck = await sandbox.process.executeCommand(
      "cat package.json",
      projectDir
    );
    console.log("Package.json content:", packageCheck.result);

    // Check if node_modules exists
    console.log("📦 Checking node_modules...");
    const nodeModulesCheck = await sandbox.process.executeCommand(
      "ls -la node_modules/ | head -10",
      projectDir
    );
    console.log("Node modules (first 10):", nodeModulesCheck.result);

    // Check if server is running
    console.log("🚀 Checking server status...");
    const serverCheck = await sandbox.process.executeCommand(
      "ps aux | grep -E '(npm|next|node)' | grep -v grep",
      projectDir
    );
    console.log("Server processes:", serverCheck.result);

    // Check server logs if they exist
    console.log("📄 Checking server logs...");
    const logCheck = await sandbox.process.executeCommand(
      "ls -la *.log 2>/dev/null || echo 'No log files found'",
      projectDir
    );
    console.log("Log files:", logCheck.result);

    // Try to start the server if it's not running
    console.log("🚀 Attempting to start server...");
    const startResult = await sandbox.process.executeCommand(
      "cd /root/website-project && npm run dev > dev.log 2>&1 &",
      rootDir
    );
    console.log("Start result:", startResult);

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check if server started
    console.log("🔍 Checking if server started...");
    const newServerCheck = await sandbox.process.executeCommand(
      "ps aux | grep -E '(npm|next|node)' | grep -v grep",
      projectDir
    );
    console.log("Updated server processes:", newServerCheck.result);

    // Check the log
    console.log("📄 Checking new server log...");
    const newLogCheck = await sandbox.process.executeCommand(
      "cat dev.log",
      projectDir
    );
    console.log("New server log:", newLogCheck.result);

    console.log("✅ Investigation complete!");

  } catch (error) {
    console.error("❌ Investigation error:", error);
  }
}

// Investigate the problematic sandbox
investigateSandbox("74507cd0-30e0-4c88-ad63-85e4f738621d").catch(console.error);
