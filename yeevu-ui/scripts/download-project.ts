# Create a simple download script
cat > /home/tee/lovable-clone/yeevu-ui/scripts/download-simple.ts << 'EOF'
import { Daytona } from "@daytonaio/sdk";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config({ path: path.join(__dirname, "../.env") });

async function downloadSimple(sandboxId: string, localPath: string = "./simple-project") {
  if (!process.env.DAYTONA_API_KEY) {
    console.error("ERROR: DAYTONA_API_KEY must be set");
    process.exit(1);
  }

  const daytona = new Daytona({
    apiKey: process.env.DAYTONA_API_KEY,
  });

  try {
    const sandboxes = await daytona.list();
    const sandbox = sandboxes.find((s: any) => s.id === sandboxId);
    
    if (!sandbox) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }

    console.log(`✓ Found sandbox: ${sandboxId}`);

    // Create local directory
    if (!fs.existsSync(localPath)) {
      fs.mkdirSync(localPath, { recursive: true });
    }

    const projectDir = "/root/website-project";
    
    console.log(`📥 Downloading files...`);
    
    // Download essential files
    const files = [
      "package.json",
      "next.config.js",
      "tailwind.config.js", 
      "tsconfig.json",
      "postcss.config.js",
      "app/globals.css",
      "app/layout.tsx", 
      "app/page.tsx",
      "app/services/page.tsx"
    ];
    
    for (const file of files) {
      try {
        console.log(`Downloading ${file}...`);
        const contentResult = await sandbox.process.executeCommand(
          `cat "${file}"`,
          projectDir
        );
        
        const localFilePath = path.join(localPath, file);
        const localDir = path.dirname(localFilePath);
        
        if (!fs.existsSync(localDir)) {
          fs.mkdirSync(localDir, { recursive: true });
        }
        
        fs.writeFileSync(localFilePath, contentResult.result || '');
        console.log(`✓ Downloaded: ${file}`);
      } catch (error) {
        console.log(`❌ Failed to download ${file}: ${error.message}`);
      }
    }
    
    console.log(`\n✅ Project downloaded to: ${localPath}`);
    console.log("\n�� Next steps:");
    console.log(`cd ${localPath}`);
    console.log("npm install");
    console.log("npm run dev");
    
  } catch (error: any) {
    console.error("Failed to download:", error.message);
    process.exit(1);
  }
}

async function main() {
  const sandboxId = process.argv[2];
  const localPath = process.argv[3] || "./simple-project";
  
  if (!sandboxId) {
    console.error("Usage: npx tsx scripts/download-simple.ts <sandbox-id> [local-path]");
    process.exit(1);
  }

  await downloadSimple(sandboxId, localPath);
}

main();
EOF