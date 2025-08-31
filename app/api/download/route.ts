import { NextRequest } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import AdmZip from "adm-zip";

export async function POST(req: NextRequest) {
  try {
    const { sandboxId } = await req.json();
    
    if (!sandboxId) {
      return new Response(
        JSON.stringify({ error: "Sandbox ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    if (!process.env.DAYTONA_API_KEY) {
      return new Response(
        JSON.stringify({ error: "DAYTONA_API_KEY is not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("[Download API] Starting download for sandbox:", sandboxId);

    try {
      // Use the existing download script to download to temp folder
      const scriptPath = path.join(process.cwd(), "scripts", "download-simple.ts");
      const outputDir = path.join(process.cwd(), "temp-downloads", sandboxId);
      
      // Create a promise to handle the download
      const downloadPromise = new Promise<string>((resolve, reject) => {
        const child = spawn("npx", ["tsx", scriptPath, sandboxId, outputDir], {
          env: {
            ...process.env,
            DAYTONA_API_KEY: process.env.DAYTONA_API_KEY,
          },
        });

        let output = "";
        let error = "";

        child.stdout.on("data", (data) => {
          output += data.toString();
        });

        child.stderr.on("data", (data) => {
          error += data.toString();
        });

        child.on("exit", (code) => {
          if (code === 0) {
            resolve(outputDir);
          } else {
            reject(new Error(`Download script failed: ${error || output}`));
          }
        });

        child.on("error", (err) => {
          reject(new Error(`Failed to execute download script: ${err.message}`));
        });
      });

      const downloadPath = await downloadPromise;
      console.log(`[Download API] Download completed to: ${downloadPath}`);

      // Now create a zip file from the downloaded content
      if (fs.existsSync(downloadPath)) {
        console.log("[Download API] Creating zip file...");
        
        const zip = new AdmZip();
        
        // Add all files from the download directory
        const addDirectoryRecursively = (dirPath: string, zipPath: string = "") => {
          const items = fs.readdirSync(dirPath);
          
          for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const relativePath = zipPath ? path.join(zipPath, item) : item;
            
            const stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
              addDirectoryRecursively(fullPath, relativePath);
            } else {
              zip.addLocalFile(fullPath, zipPath, item);
            }
          }
        };
        
        addDirectoryRecursively(downloadPath);
        
        const zipBuffer = zip.toBuffer();
        console.log(`[Download API] Zip created, size: ${zipBuffer.length} bytes`);
        
        // Return the zip file for download
        return new Response(zipBuffer, {
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="website-project-${sandboxId.substring(0, 8)}.zip"`,
            'Content-Length': zipBuffer.length.toString(),
          },
        });
      } else {
        throw new Error("Download directory not found");
      }

    } catch (error: any) {
      console.error("[Download API] Download failed:", error);
      return new Response(
        JSON.stringify({ error: `Download failed: ${error.message}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

  } catch (error: any) {
    console.error("[Download API] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}