import { NextRequest } from "next/server";
import { Daytona } from "@daytonaio/sdk";

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
        JSON.stringify({ error: "Missing required API keys" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    console.log("[API] Starting Daytona generation for prompt:", prompt);
    
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
            message: "🚀 Creating Daytona sandbox..."
          })}\n\n`)
        );

        // Create sandbox
        const sandbox = await daytona.create({
          public: true,
          image: "node:20",
        });

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
            message: "📦 Installing Claude Code SDK..."
          })}\n\n`)
        );

        // Install Claude Code SDK
        const installResult = await sandbox.process.executeCommand(
          "npm install @anthropic-ai/claude-code@latest",
          projectDir,
          undefined,
          180000
        );

        if (installResult.exitCode !== 0) {
          throw new Error("Failed to install Claude Code SDK");
        }

        await writer.write(
          encoder.encode(`data: ${JSON.stringify({
            type: "progress",
            message: "✓ Claude Code SDK installed"
          })}\n\n`)
        );

        // Create generation script
        const generationScript = `const { query } = require('@anthropic-ai/claude-code');

async function generateWebsite() {
  const prompt = \`${prompt}
  
  Important requirements:
  - Create a NextJS app with TypeScript and Tailwind CSS
  - Use the app directory structure
  - Create all files in the current directory
  - Include a package.json with all necessary dependencies
  - Make the design modern and responsive
  - Add at least a home page and one other page
  - Include proper navigation between pages
  \`;

  console.log('Starting website generation with Claude Code...');
  
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
      
      // Log progress with special markers for parsing
      if (message.type === 'text') {
        console.log('__CLAUDE_MESSAGE__', JSON.stringify({ type: 'claude_message', content: message.text }));
      } else if (message.type === 'tool_use') {
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
    
  } catch (error) {
    console.error('Generation error:', error);
    process.exit(1);
  }
}

generateWebsite().catch(console.error);`;

        await sandbox.process.executeCommand(
          `cat > generate.js << 'SCRIPT_EOF'
${generationScript}
SCRIPT_EOF`,
          projectDir
        );

        await writer.write(
          encoder.encode(`data: ${JSON.stringify({
            type: "progress",
            message: "🤖 Starting Claude AI generation..."
          })}\n\n`)
        );

        // Run generation script and parse output
        const genProcess = sandbox.process.executeCommand(
          "node generate.js",
          projectDir,
          {
            ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
            NODE_PATH: `${projectDir}/node_modules`,
          },
          600000
        );

        // Stream the output as it comes
        // Note: This is a simplified version - the real implementation would need to stream the process output
        const result = await genProcess;

        // Parse the output for special markers
        const lines = result.result?.split('\n') || [];
        for (const line of lines) {
          if (line.includes('__CLAUDE_MESSAGE__')) {
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
          }
        }

        if (result.exitCode !== 0) {
          throw new Error("Generation failed");
        }

        await writer.write(
          encoder.encode(`data: ${JSON.stringify({
            type: "progress",
            message: "📦 Installing project dependencies..."
          })}\n\n`)
        );

        // Install dependencies
        await sandbox.process.executeCommand("npm install", projectDir, undefined, 300000);

        await writer.write(
          encoder.encode(`data: ${JSON.stringify({
            type: "progress",
            message: "🚀 Starting development server..."
          })}\n\n`)
        );

        // Start dev server
        await sandbox.process.executeCommand(
          `nohup npm run dev > dev-server.log 2>&1 &`,
          projectDir,
          { PORT: "3000" }
        );

        // Wait for server to start
        await new Promise(resolve => setTimeout(resolve, 8000));

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
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ 
            type: "error",
            message: error.message 
          })}\n\n`)
        );
      } finally {
        await writer.close();
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