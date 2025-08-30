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
            message: "🚀 Creating sandbox environment..."
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
            message: "📦 Installing LLM SDK..."
          })}\n\n`)
        );

        // Install Claude Code SDK and CLI
        const installResult = await sandbox.process.executeCommand(
          "npm install @anthropic-ai/claude-code@latest && npm install -g @anthropic-ai/claude-code",
          projectDir,
          undefined,
          180000
        );

        console.log("[API] Install result:", {
          exitCode: installResult.exitCode,
          result: installResult.result?.substring(0, 500) + "..."
        });

        if (installResult.exitCode !== 0) {
          console.error("[API] Install failed:", installResult.result);
          throw new Error("Failed to install LLM SDK");
        }

        // Debug: Check what was actually installed
        const checkInstallResult = await sandbox.process.executeCommand(
          "ls -la node_modules/@anthropic-ai/ && echo '=== CLI Check ===' && which claude-code || echo 'CLI not found'",
          projectDir,
          undefined,
          30000
        );

        console.log("[API] Installation check:", {
          exitCode: checkInstallResult.exitCode,
          result: checkInstallResult.result
        });

        await writer.write(
          encoder.encode(`data: ${JSON.stringify({
            type: "progress",
            message: "✓ LLM SDK installed"
          })}\n\n`)
        );

        // Create generation script
        const generationScript = `const fs = require('fs');
const path = require('path');

// Debug: Check what's installed
console.log('=== DEBUGGING SDK INSTALLATION ===');
console.log('Current directory:', process.cwd());
console.log('Node modules path:', path.join(process.cwd(), 'node_modules'));

// Check if the SDK package is installed
const sdkPath = path.join(process.cwd(), 'node_modules', '@anthropic-ai', 'claude-code');
console.log('SDK path:', sdkPath);
console.log('SDK exists:', fs.existsSync(sdkPath));

if (fs.existsSync(sdkPath)) {
  console.log('SDK package.json:', fs.readFileSync(path.join(sdkPath, 'package.json'), 'utf8'));
  
  // Check for CLI executable
  const cliPath = path.join(sdkPath, 'entrypoints', 'cli.js');
  console.log('CLI path:', cliPath);
  console.log('CLI exists:', fs.existsSync(cliPath));
  
  // List all files in entrypoints
  const entrypointsPath = path.join(sdkPath, 'entrypoints');
  if (fs.existsSync(entrypointsPath)) {
    console.log('Entrypoints directory contents:', fs.readdirSync(entrypointsPath));
  }
  
  // List all files in the SDK root
  console.log('SDK root contents:', fs.readdirSync(sdkPath));
}

// Check node_modules structure
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
console.log('All packages in node_modules:', fs.readdirSync(nodeModulesPath));

console.log('=== END DEBUGGING ===\\n');

// Try to import the SDK
let query;
try {
  const sdk = require('@anthropic-ai/claude-code');
  query = sdk.query;
  console.log('SDK imported successfully:', typeof query);
} catch (error) {
  console.error('Failed to import Claude Code SDK:', error);
  process.exit(1);
}

async function generateWebsite() {
  if (!query) {
    console.error('Query function is not available');
    process.exit(1);
  }

  const userPrompt = \`${prompt}\`;
  if (!userPrompt || userPrompt.trim() === '') {
    console.error('No prompt provided');
    process.exit(1);
  }

  const fullPrompt = \`Create a website for: \${userPrompt}

  CRITICAL: You MUST create a working Next.js 14 application with the App Router.

  MANDATORY FIRST STEPS:
  1. Initialize a Next.js project with proper package.json
  2. Create the exact file structure that Next.js requires
  3. Ensure app/page.tsx exists and exports a default React component
  4. Verify all required configuration files are present

  REQUIRED FILES (CREATE IN THIS EXACT ORDER):
  
  1. package.json - Must include these exact dependencies:
  {
    "name": "generated-website",
    "version": "0.1.0",
    "private": true,
    "scripts": {
      "dev": "next dev",
      "build": "next build",
      "start": "next start"
    },
    "dependencies": {
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "next": "^14.0.0",
      "@types/node": "^20.0.0",
      "@types/react": "^18.2.0",
      "@types/react-dom": "^18.2.0",
      "typescript": "^5.0.0",
      "tailwindcss": "^3.3.0",
      "autoprefixer": "^10.4.0",
      "postcss": "^8.4.0"
    }
  }

  2. next.config.js:
  /** @type {import('next').NextConfig} */
  const nextConfig = {}
  module.exports = nextConfig

  3. tsconfig.json - Standard Next.js TypeScript config with app router paths
  
  4. tailwind.config.js - Configure Tailwind for the app directory
  
  5. postcss.config.js - PostCSS configuration for Tailwind
  
  6. app/globals.css - Import Tailwind directives
  
  7. app/layout.tsx - Root layout component (MUST exist for App Router)
  
  8. app/page.tsx - Main homepage component (MUST exist and export default function)

  CRITICAL APP/PAGE.TSX REQUIREMENTS:
  - MUST be in the app/ directory (not pages/)
  - MUST export default function (not const)
  - MUST contain actual content, not placeholders
  - MUST be a valid React component

  Example structure:
  
  export default function HomePage() {
    return (
      <main className="min-h-screen">
        <h1>Actual Content Here</h1>
        {/* Real content, not placeholders */}
      </main>
    )
  }

  CONTENT REQUIREMENTS:
  - NO "404", "Page not found", "Coming soon", or "Lorem ipsum"
  - Create REAL content related to the user's request
  - Include multiple sections with actual information
  - Add working navigation and interactive elements
  - Use professional styling with Tailwind CSS

  DEBUGGING CHECKLIST:
  - Verify app/page.tsx exists and has default export
  - Verify app/layout.tsx wraps children properly
  - Verify package.json has correct Next.js dependencies
  - Verify no syntax errors in any files
  - Verify all imports reference existing files

  Build a complete, functional Next.js application that serves real content on the homepage.\`;

  console.log('Starting website generation with Claude Code...');
  
  const abortController = new AbortController();
  
  try {
    for await (const message of query({
      prompt: fullPrompt,
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
        ],
        pathToClaudeCodeExecutable: path.join(process.cwd(), 'node_modules', '@anthropic-ai', 'claude-code', 'cli.js')
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
        // Additional backend logging
        console.log(\`[BACKEND] Tool: \${message.name} - \${message.input ? JSON.stringify(message.input).substring(0, 200) : 'No input'}\`);
        
        // Track file creation specifically
        if (message.name === 'Write' && message.input && message.input.file_path) {
          console.log(\`[FILE_CREATED] \${message.input.file_path}\`);
        }
      } else if (message.type === 'result') {
        const resultPreview = message.result 
          ? (typeof message.result === 'string' 
              ? message.result.substring(0, 200) 
              : JSON.stringify(message.result).substring(0, 200))
          : 'No result';
        console.log('__TOOL_RESULT__', JSON.stringify({ 
          type: 'tool_result', 
          result: resultPreview + (resultPreview.length >= 200 ? '...' : ''),
          full_result_length: message.result 
            ? (typeof message.result === 'string' ? message.result.length : JSON.stringify(message.result).length)
            : 0
        }));
        console.log(\`[BACKEND] Result length: \${message.result 
          ? (typeof message.result === 'string' ? message.result.length : JSON.stringify(message.result).length)
          : 0} chars\`);
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

        // Debug: Check if script was created
        const scriptCheckResult = await sandbox.process.executeCommand(
          "ls -la generate.js && echo '=== Script first 10 lines ===' && head -10 generate.js",
          projectDir,
          undefined,
          30000
        );

        console.log("[API] Script creation check:", {
          exitCode: scriptCheckResult.exitCode,
          result: scriptCheckResult.result
        });

        await writer.write(
          encoder.encode(`data: ${JSON.stringify({
            type: "progress",
            message: "🤖 Starting AI generation..."
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

        // Parse the output for special markers and track files created
        const lines = result.result?.split('\n') || [];
        const generatedFiles: string[] = [];
        
        for (const line of lines) {
          // Track file creations
          if (line.includes('[FILE_CREATED]')) {
            const filePath = line.split('[FILE_CREATED]')[1]?.trim();
            if (filePath) {
              generatedFiles.push(filePath);
              console.log(`[API] Claude generated file: ${filePath}`);
            }
          }
          
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
          } else if (line.includes('[BACKEND]')) {
            // Parse backend logs and send as progress messages
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
          } else if (line.includes('Starting website generation') || 
                     line.includes('Generation complete') ||
                     line.includes('Installing') ||
                     line.includes('Creating')) {
            // Send general progress messages
            try {
              await writer.write(
                encoder.encode(`data: ${JSON.stringify({
                  type: "progress",
                  message: line.trim()
                })}\n\n`)
              );
            } catch (e) {
              // Ignore parse errors
            }
          }
        }

        // DETAILED GENERATION REPORT
        console.log('[API] ========== GENERATION REPORT ==========');
        console.log(`[API] Total files Claude attempted to create: ${generatedFiles.length}`);
        console.log('[API] Files Claude tried to generate:', generatedFiles);
        
        // Cross-reference with actual file system
        const actualFiles = await sandbox.process.executeCommand(`find . -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.css" -o -name "*.md" | grep -v node_modules | grep -v .git`, projectDir);
        console.log('[API] Files actually present on disk:', actualFiles.result?.split('\n').filter(f => f.trim()));
        
        // Check for missing files that Claude should have created
        const expectedCore = ['package.json', 'app/page.tsx', 'app/layout.tsx'];
        for (const expected of expectedCore) {
          const wasGenerated = generatedFiles.some(f => f.includes(expected));
          const actuallyExists = actualFiles.result?.includes(expected);
          console.log(`[API] ${expected}: Generated=${wasGenerated}, Exists=${actuallyExists}`);
        }

        if (result.exitCode !== 0) {
          console.error("[API] Generation script failed with exit code:", result.exitCode);
          console.error("[API] Script output:", result.result);
          throw new Error(`Generation failed with exit code ${result.exitCode}: ${result.result}`);
        }

        await writer.write(
          encoder.encode(`data: ${JSON.stringify({
            type: "progress",
            message: "📦 Installing project dependencies..."
          })}\n\n`)
        );

        // Install dependencies
        const installDepsResult = await sandbox.process.executeCommand("npm install", projectDir, undefined, 300000);
        
        if (installDepsResult.exitCode !== 0) {
          console.error("[API] npm install failed:", installDepsResult.result);
          throw new Error(`npm install failed: ${installDepsResult.result}`);
        }

        await writer.write(
          encoder.encode(`data: ${JSON.stringify({
            type: "progress",
            message: "🚀 Starting development server..."
          })}\n\n`)
        );

        // COMPREHENSIVE FILE STRUCTURE VALIDATION
        console.log('[API] ========== FILE STRUCTURE VALIDATION ==========');
        
        // First, show the complete directory structure
        const dirStructure = await sandbox.process.executeCommand(`find . -type f -name "*.json" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.css" | head -20`, projectDir);
        console.log('[API] Generated files found:', dirStructure.result);
        
        // Show the complete directory tree
        const treeResult = await sandbox.process.executeCommand(`ls -la && echo "=== APP DIR ===" && ls -la app/ 2>/dev/null || echo "app/ directory missing"`, projectDir);
        console.log('[API] Directory structure:', treeResult.result);
        
        // Define expected Next.js files and their requirements
        const expectedFiles = [
          { path: 'package.json', required: true, description: 'Package configuration' },
          { path: 'next.config.js', required: true, description: 'Next.js configuration' },
          { path: 'tsconfig.json', required: true, description: 'TypeScript configuration' },
          { path: 'tailwind.config.js', required: true, description: 'Tailwind CSS configuration' },
          { path: 'postcss.config.js', required: false, description: 'PostCSS configuration' },
          { path: 'app/layout.tsx', required: true, description: 'Root layout component' },
          { path: 'app/page.tsx', required: true, description: 'Homepage component' },
          { path: 'app/globals.css', required: true, description: 'Global styles' }
        ];
        
        let missingFiles = [];
        let validationErrors = [];
        
        for (const file of expectedFiles) {
          const checkResult = await sandbox.process.executeCommand(`test -f ${file.path} && echo "EXISTS" || echo "MISSING"`, projectDir);
          const exists = checkResult.result?.trim() === 'EXISTS';
          
          console.log(`[API] ${file.path}: ${exists ? '✓ EXISTS' : '✗ MISSING'} (${file.description})`);
          
          if (!exists) {
            if (file.required) {
              missingFiles.push(file.path);
            }
          } else {
            // If file exists, validate its content
            const contentCheck = await sandbox.process.executeCommand(`head -10 "${file.path}"`, projectDir);
            const contentPreview = contentCheck.result?.substring(0, 200) || '';
            console.log(`[API] ${file.path} preview:`, contentPreview + '...');
            
            // Specific validations
            if (file.path === 'app/page.tsx') {
              if (!contentCheck.result?.includes('export default') && !contentCheck.result?.includes('export { default }')) {
                validationErrors.push(`${file.path} does not have a default export`);
              }
              if (contentCheck.result?.toLowerCase().includes('404') || contentCheck.result?.toLowerCase().includes('not found')) {
                validationErrors.push(`${file.path} contains 404 or error content`);
              }
            }
            
            if (file.path === 'app/layout.tsx') {
              if (!contentCheck.result?.includes('children')) {
                validationErrors.push(`${file.path} does not accept children prop`);
              }
            }
            
            if (file.path === 'package.json') {
              if (!contentCheck.result?.includes('next')) {
                validationErrors.push(`${file.path} does not include Next.js dependency`);
              }
            }
          }
        }
        
        // Report validation results
        if (missingFiles.length > 0) {
          console.error('[API] MISSING REQUIRED FILES:', missingFiles);
          throw new Error(`Critical files missing: ${missingFiles.join(', ')}. Generation incomplete.`);
        }
        
        if (validationErrors.length > 0) {
          console.error('[API] VALIDATION ERRORS:', validationErrors);
          throw new Error(`File validation failed: ${validationErrors.join('; ')}`);
        }
        
        console.log('[API] ✓ All required files present and valid');
        
        // DETAILED CONTENT VALIDATION
        console.log('[API] ========== CONTENT VALIDATION ==========');
        
        // Show full content of critical files for debugging
        const criticalFilesContent = ['app/page.tsx', 'app/layout.tsx', 'package.json'];
        for (const file of criticalFilesContent) {
          console.log(`[API] ===== ${file} CONTENT =====`);
          const fullContent = await sandbox.process.executeCommand(`cat "${file}"`, projectDir);
          console.log(fullContent.result || 'File not found or empty');
          console.log(`[API] ===== END ${file} =====`);
        }
        
        // Final validation - ensure no 404 content
        const pageContent = await sandbox.process.executeCommand(`cat app/page.tsx`, projectDir);
        if (pageContent.result?.toLowerCase().includes('404') || pageContent.result?.toLowerCase().includes('not found')) {
          console.error('[API] ERROR: Generated page contains 404 content:', pageContent.result);
          throw new Error("Generated page contains 404 content. Generation failed.");
        }
        
        console.log('[API] ✓ Content validation passed');

        // Start dev server
        await sandbox.process.executeCommand(
          `nohup npm run dev > dev-server.log 2>&1 &`,
          projectDir,
          { PORT: "3000" }
        );

        // Wait for server to start and check if it's running
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Check if server is running
        const serverCheck = await sandbox.process.executeCommand(`curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "FAILED"`, projectDir);
        console.log("[API] Server health check:", serverCheck.result);
        
        if (serverCheck.result?.includes('FAILED') || !serverCheck.result?.includes('200')) {
          // Try to get server logs for debugging
          const logs = await sandbox.process.executeCommand(`tail -50 dev-server.log`, projectDir);
          console.log("[API] Server logs:", logs.result);
          throw new Error(`Development server failed to start properly. Server response: ${serverCheck.result}`);
        }

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