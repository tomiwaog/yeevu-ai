import { NextRequest } from "next/server";
import { Daytona } from "@daytonaio/sdk";
import fs from "fs";
import path from "path";

// Configuration constants
const TIMEOUTS = {
  SDK_INSTALL: 180000,        // 3 minutes
  DEPENDENCY_INSTALL: 300000, // 5 minutes
  GENERATION: 600000,         // 10 minutes
  SERVER_STARTUP: 10000       // 10 seconds wait + health check
};

// Simplified to use Anthropic SDK only
// The generation script (scripts/generate-anthropic-sdk.js) handles the prompt and tool calling

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!process.env.DAYTONA_API_KEY || !process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing required API keys. Need DAYTONA_API_KEY and ANTHROPIC_API_KEY" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("[API] Starting Anthropic SDK generation for prompt:", prompt);
    console.log("[API] Environment check:", {
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      hasDaytonaKey: !!process.env.DAYTONA_API_KEY,
      anthropicKeyPrefix: process.env.ANTHROPIC_API_KEY?.substring(0, 10) + '...'
    });

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    
    // Start the async generation
    (async () => {
      try {
        const daytona = new Daytona({
          apiKey: process.env.DAYTONA_API_KEY,
        });

        // Send progress update
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({
            type: "progress",
            message: "🚀 Creating sandbox environment..."
          })}\n\n`)
        );

        // Create sandbox
        let sandbox;
        try {
          sandbox = await daytona.create({
            public: true,
            image: "node:20",
          });
          console.log("[API] Sandbox created successfully:", sandbox.id);
        } catch (error: any) {
          console.error("[API] CRITICAL FAILURE: Sandbox creation failed:", error);
          await writer.write(
            encoder.encode(`data: ${JSON.stringify({
              type: "error",
              message: "Failed to create Daytona sandbox. Please check your Daytona configuration."
            })}\n\n`)
          );
          throw new Error(`Sandbox creation failed: ${error.message}`);
        }

        await writer.write(
          encoder.encode(`data: ${JSON.stringify({
            type: "progress",
            message: `✓ Sandbox created: ${sandbox.id}`
          })}\n\n`)
        );

        // Get root directory and setup project
        const rootDir = await sandbox.getUserRootDir();
        const projectDir = `${rootDir}/website-project`;

        await writer.write(
          encoder.encode(`data: ${JSON.stringify({
            type: "progress",
            message: "📁 Setting up project directory..."
          })}\n\n`)
        );

        await sandbox.process.executeCommand(`mkdir -p ${projectDir}`, rootDir);
        await sandbox.process.executeCommand("npm init -y", projectDir);

        await writer.write(
          encoder.encode(`data: ${JSON.stringify({
            type: "progress",
            message: "📦 Installing Anthropic SDK..."
          })}\n\n`)
        );

        // Install Anthropic SDK
        const installResult = await sandbox.process.executeCommand(
          "npm install @anthropic-ai/sdk",
          projectDir,
          undefined,
          TIMEOUTS.SDK_INSTALL
        );

        if (installResult.exitCode !== 0) {
          console.error("[API] CRITICAL FAILURE: SDK installation failed:", installResult.result);
          await writer.write(
            encoder.encode(`data: ${JSON.stringify({
              type: "error",
              message: "Failed to install Anthropic SDK. Generation cannot continue."
            })}\n\n`)
          );
          throw new Error(`Failed to install Anthropic SDK: ${installResult.result}`);
        }

        console.log("[API] ✓ Anthropic SDK installed successfully");

        await writer.write(
          encoder.encode(`data: ${JSON.stringify({
            type: "progress",
            message: "✓ Anthropic SDK installed"
          })}\n\n`)
        );

        // Read the generation script from local file system
        const scriptPath = path.join(process.cwd(), 'scripts', 'generate-anthropic-sdk.js');
        const generationScript = fs.readFileSync(scriptPath, 'utf8');

        await sandbox.process.executeCommand(
          `cat > generate.js << 'SCRIPT_EOF'
${generationScript}
SCRIPT_EOF`,
          projectDir
        );

        await writer.write(
          encoder.encode(`data: ${JSON.stringify({
            type: "progress",
            message: "🤖 Starting AI generation with Anthropic SDK..."
          })}\n\n`)
        );

        // Run generation with proper timeout and error handling
        let result;
        try {
          console.log("[API] Starting generation script...");

          const genProcess = sandbox.process.executeCommand(
            `node generate.js "${prompt.replace(/"/g, '\\"')}"`,
            projectDir,
            {
              ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
              NODE_PATH: `${projectDir}/node_modules`,
            },
            TIMEOUTS.GENERATION
          );

          result = await genProcess;

          if (result.exitCode !== 0) {
            console.error("[API] CRITICAL FAILURE: Generation script failed with exit code:", result.exitCode);
            console.error("[API] Generation script output:", result.result);
            await writer.write(
              encoder.encode(`data: ${JSON.stringify({
                type: "error",
                message: "AI generation failed. Please check the logs."
              })}\n\n`)
            );
            throw new Error(`Generation failed with exit code ${result.exitCode}: ${result.result}`);
          }

          console.log("[API] Generation script completed successfully");
        } catch (error: any) {
          console.error("[API] CRITICAL FAILURE: Generation script error:", error);

          if (error.message?.includes('timeout') || error.message?.includes('504')) {
            await writer.write(
              encoder.encode(`data: ${JSON.stringify({
                type: "error",
                message: "AI generation timed out after 10 minutes. Please try a simpler prompt or try again."
              })}\n\n`)
            );
            throw new Error("Generation timed out - please try a simpler prompt");
          }

          await writer.write(
            encoder.encode(`data: ${JSON.stringify({
              type: "error",
              message: "AI generation failed. Please try again."
            })}\n\n`)
          );
          throw error;
        }

        // Parse the output for streaming updates
        const lines = result.result?.split('\n') || [];

        for (const line of lines) {
          // Track file creations
          if (line.includes('[FILE_CREATED]')) {
            const filePath = line.split('[FILE_CREATED]')[1]?.trim();
            if (filePath) {
              console.log(`[API] Claude generated file: ${filePath}`);
              await writer.write(
                encoder.encode(`data: ${JSON.stringify({
                  type: "file_created",
                  file: filePath
                })}\n\n`)
              );
            }
          } else if (line.includes('__CLAUDE_MESSAGE__')) {
            const messageData = line.split('__CLAUDE_MESSAGE__')[1];
            try {
              const parsed = JSON.parse(messageData);
              await writer.write(
                encoder.encode(`data: ${JSON.stringify(parsed)}\n\n`)
              );
            } catch (e) {
              // Ignore parse errors
            }
          } else if (line.includes('__TOOL_USE__')) {
            const messageData = line.split('__TOOL_USE__')[1];
            try {
              const parsed = JSON.parse(messageData);
              await writer.write(
                encoder.encode(`data: ${JSON.stringify(parsed)}\n\n`)
              );
            } catch (e) {
              // Ignore parse errors
            }
          } else if (line.includes('__TOOL_RESULT__')) {
            const messageData = line.split('__TOOL_RESULT__')[1];
            try {
              const parsed = JSON.parse(messageData);
              await writer.write(
                encoder.encode(`data: ${JSON.stringify(parsed)}\n\n`)
              );
            } catch (e) {
              // Ignore parse errors
            }
          } else if (line.includes('[BACKEND]')) {
            try {
              const logMessage = line.split('[BACKEND]')[1].trim();
              await writer.write(
                encoder.encode(`data: ${JSON.stringify({
                  type: "backend_log",
                  message: logMessage,
                  timestamp: new Date().toISOString()
                })}\n\n`)
              );
            } catch (e) {
              // Ignore parse errors
            }
          }
        }

        await writer.write(
          encoder.encode(`data: ${JSON.stringify({
            type: "progress",
            message: "📦 Installing project dependencies..."
          })}\n\n`)
        );

        // Install project dependencies
        const installDepsResult = await sandbox.process.executeCommand("npm install", projectDir, undefined, TIMEOUTS.DEPENDENCY_INSTALL);
        
        if (installDepsResult.exitCode !== 0) {
          console.error("[API] CRITICAL FAILURE: npm install failed:", installDepsResult.result);
          await writer.write(
            encoder.encode(`data: ${JSON.stringify({
              type: "error",
              message: "Failed to install project dependencies. Generation incomplete."
            })}\n\n`)
          );
          throw new Error(`npm install failed: ${installDepsResult.result}`);
        }

        console.log("[API] Dependencies installed successfully");

        await writer.write(
          encoder.encode(`data: ${JSON.stringify({
            type: "progress",
            message: "🚀 Starting development server..."
          })}\n\n`)
        );

        // Validate file structure
        const expectedFiles = ['package.json', 'app/page.tsx', 'app/layout.tsx'];
        let missingFiles = [];
        
        for (const file of expectedFiles) {
          const checkResult = await sandbox.process.executeCommand(`test -f ${file} && echo "EXISTS" || echo "MISSING"`, projectDir);
          const exists = checkResult.result?.trim() === 'EXISTS';
          
          if (!exists) {
            missingFiles.push(file);
          }
        }
        
        if (missingFiles.length > 0) {
          console.error('[API] MISSING REQUIRED FILES:', missingFiles);
          //throw new Error(`Critical files missing: ${missingFiles.join(', ')}. Generation incomplete.`);
        }

        // Start dev server
        await sandbox.process.executeCommand(
          `nohup npm run dev > dev-server.log 2>&1 &`,
          projectDir,
          { PORT: "3000" }
        );

        // Wait for server to start and check if it's running
        await new Promise(resolve => setTimeout(resolve, TIMEOUTS.SERVER_STARTUP));
        
        const serverCheck = await sandbox.process.executeCommand(`curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "FAILED"`, projectDir);
        console.log("[API] Server health check:", serverCheck.result);
        
        if (serverCheck.result?.includes('FAILED') || !serverCheck.result?.includes('200')) {
          console.error("[API] CRITICAL FAILURE: Development server failed to start");
          
          const logs = await sandbox.process.executeCommand(`tail -50 dev-server.log`, projectDir);
          console.log("[API] Server logs:", logs.result);
          
          await writer.write(
            encoder.encode(`data: ${JSON.stringify({
              type: "error",
              message: "Development server failed to start. Please check the generated code for errors."
            })}\n\n`)
          );
        }

        console.log("[API] Development server started successfully");

        // Get preview URL
        const preview = await sandbox.getPreviewLink(3000);

        // Send completion
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({
            type: "complete",
            previewUrl: preview.url,
            sandboxId: sandbox.id
          })}\n\n`)
        );

        await writer.write(encoder.encode("data: [DONE]\n\n"));
        
      } catch (error: any) {
        console.error("[API] Error during generation:", error);
        try {
          await writer.write(
            encoder.encode(`data: ${JSON.stringify({ 
              type: "error",
              message: error.message 
            })}\n\n`)
          );
        } catch (writeError) {
          console.error("[API] Failed to write error to stream:", writeError);
        }
      } finally {
        try {
          await writer.close();
        } catch (closeError) {
          console.error("[API] Failed to close stream:", closeError);
        }
      }
    })();
    
    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
    
  } catch (error: any) {
    console.error("[API] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Note: Generation script is now loaded from scripts/generate-anthropic-sdk.js
// This provides full multi-turn conversation loop with tool handling