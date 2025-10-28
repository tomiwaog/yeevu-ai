const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const Anthropic = require('@anthropic-ai/sdk');

// Tool definitions for Claude - SIMPLIFIED: Only Write tool for testing
const TOOLS = [
  {
    name: "Write",
    description: "Writes content to a file at the specified path. Creates parent directories if needed. Overwrites existing files.",
    input_schema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "The absolute or relative path where the file should be written"
        },
        content: {
          type: "string",
          description: "The content to write to the file"
        }
      },
      required: ["file_path", "content"]
    }
  }
  // Commented out other tools for hello world test
  // {
  //   name: "Read",
  //   description: "Reads the contents of a file at the specified path.",
  //   ...
  // },
  // ... other tools commented out
];

// Tool execution handlers
class ToolExecutor {
  constructor(workDir) {
    this.workDir = workDir;
  }

  execute(toolName, input) {
    const handler = this[`handle_${toolName}`];
    if (!handler) {
      console.log(`Warning: Unknown tool: ${toolName} - returning error string`);
      return `Error: Unknown tool: ${toolName}`;
    }
    return handler.call(this, input);
  }

  handle_Write(input) {
    try {
      const { file_path, content } = input;
      const fullPath = path.isAbsolute(file_path)
        ? file_path
        : path.join(this.workDir, file_path);

      // Create parent directories if needed
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`[FILE_CREATED] ${file_path}`);
      return `Successfully wrote ${content.length} characters to ${file_path}`;
    } catch (error) {
      console.log(`Warning: Write failed for ${input.file_path}:`, error.message);
      return `Error writing file: ${error.message}`;
    }
  }

  handle_Read(input) {
    const { file_path } = input;
    const fullPath = path.isAbsolute(file_path)
      ? file_path
      : path.join(this.workDir, file_path);

    if (!fs.existsSync(fullPath)) {
      return `Error: File not found: ${file_path}`;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    return content;
  }

  handle_Edit(input) {
    const { file_path, old_string, new_string } = input;
    const fullPath = path.isAbsolute(file_path)
      ? file_path
      : path.join(this.workDir, file_path);

    if (!fs.existsSync(fullPath)) {
      return `Error: File not found: ${file_path}`;
    }

    let content = fs.readFileSync(fullPath, 'utf8');

    if (!content.includes(old_string)) {
      return `Error: String not found in file: ${old_string.substring(0, 100)}...`;
    }

    content = content.replace(old_string, new_string);
    fs.writeFileSync(fullPath, content, 'utf8');
    return `Successfully edited ${file_path}`;
  }

  handle_Bash(input) {
    const { command } = input;
    try {
      const output = execSync(command, {
        cwd: this.workDir,
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 60000 // 60 second timeout
      });
      return output;
    } catch (error) {
      return `Error executing command: ${error.message}\nOutput: ${error.stdout || ''}\nError: ${error.stderr || ''}`;
    }
  }

  handle_Glob(input) {
    const { pattern } = input;
    try {
      // Use find command for glob-like pattern matching
      const command = pattern.includes('**')
        ? `find . -type f -path "./${pattern.replace('**/', '*')}"`
        : `find . -maxdepth 2 -type f -name "${pattern.replace('*/', '')}"`;

      const output = execSync(command, {
        cwd: this.workDir,
        encoding: 'utf8'
      });
      return output || 'No files found matching pattern';
    } catch (error) {
      return `No files found matching pattern: ${pattern}`;
    }
  }

  handle_Grep(input) {
    const { pattern, path: searchPath } = input;
    try {
      const grepPath = searchPath || '.';
      const command = `grep -r "${pattern}" ${grepPath} 2>/dev/null || echo "No matches found"`;
      const output = execSync(command, {
        cwd: this.workDir,
        encoding: 'utf8',
        maxBuffer: 5 * 1024 * 1024
      });
      return output;
    } catch (error) {
      return `No matches found for pattern: ${pattern}`;
    }
  }
}

// Main generation function
async function generateWebsite(prompt) {
  if (!prompt || prompt.trim() === '') {
    console.error('No prompt provided');
    process.exit(1);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log('Warning: ANTHROPIC_API_KEY environment variable not set - continuing anyway for testing');
    // process.exit(1); // Commented out - let it continue
  }

  const anthropic = new Anthropic({ apiKey });
  const toolExecutor = new ToolExecutor(process.cwd());

  // Simple Next.js generation with user's topic
  const fullPrompt = `Create a Next.js website about: ${prompt}

Create these 3 files:

1. package.json - Standard Next.js package.json with next, react, react-dom dependencies and dev/build/start scripts

2. app/layout.tsx - Root layout wrapping children in <html> and <body> tags

3. app/page.tsx - Homepage component with content about "${prompt}". Make it look nice with good HTML structure and inline styles if needed.

Use the Write tool to create all 3 files with complete, working code. Make the content relevant to the topic.`;

  let conversationHistory = [];

  console.log('Starting website generation with Anthropic SDK...');

  // Conversation loop - reasonable limits for content generation
  let turnCount = 0;
  const maxTurns = 10;  // Enough turns for content generation

  while (turnCount < maxTurns) {
    turnCount++;
    console.log(`\n--- Turn ${turnCount}/${maxTurns} ---`);

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4000,  // Enough for rich content generation
        tools: TOOLS,
        messages: conversationHistory.length > 0
          ? conversationHistory
          : [{ role: 'user', content: fullPrompt }],
      });

      console.log(`Stop reason: ${response.stop_reason}`);

      // Process response content
      for (const content of response.content) {
        if (content.type === 'text') {
          console.log('__CLAUDE_MESSAGE__', JSON.stringify({
            type: 'claude_message',
            content: content.text
          }));
        } else if (content.type === 'tool_use') {
          console.log('__TOOL_USE__', JSON.stringify({
            type: 'tool_use',
            name: content.name,
            input: content.input
          }));
          console.log(`[BACKEND] Tool: ${content.name}`);

          // Execute the tool
          let result;
          try {
            result = toolExecutor.execute(content.name, content.input);
          } catch (error) {
            result = `Error executing tool: ${error.message}`;
          }

          const resultPreview = typeof result === 'string'
            ? result.substring(0, 200)
            : JSON.stringify(result).substring(0, 200);

          console.log('__TOOL_RESULT__', JSON.stringify({
            type: 'tool_result',
            result: resultPreview + (resultPreview.length >= 200 ? '...' : ''),
            full_result_length: result.length
          }));

          // Store tool result for next turn
          if (conversationHistory.length === 0) {
            conversationHistory.push({ role: 'user', content: fullPrompt });
          }

          // Add assistant response
          if (!conversationHistory.find(m => m.role === 'assistant' && m.content.some(c => c.id === content.id))) {
            const lastMessage = conversationHistory[conversationHistory.length - 1];
            if (lastMessage.role === 'assistant') {
              // Append to existing assistant message
              lastMessage.content.push(content);
            } else {
              // Create new assistant message
              conversationHistory.push({
                role: 'assistant',
                content: response.content
              });
            }
          }

          // Add tool result as user message
          conversationHistory.push({
            role: 'user',
            content: [{
              type: 'tool_result',
              tool_use_id: content.id,
              content: result
            }]
          });
        }
      }

      // Check if we're done
      if (response.stop_reason === 'end_turn') {
        console.log('\nGeneration complete!');
        break;
      }

      // If no tool use, we're done
      const hasToolUse = response.content.some(c => c.type === 'tool_use');
      if (!hasToolUse) {
        console.log('\nNo more tools to use, generation complete!');
        break;
      }

    } catch (error) {
      console.error('Error in conversation turn:', error);
      throw error;
    }
  }

  if (turnCount >= maxTurns) {
    console.log('\nReached maximum turns, stopping generation.');
  }
}

// Run the generator
const userPrompt = process.argv[2] || process.env.USER_PROMPT;
if (!userPrompt) {
  console.error('Usage: node generate-anthropic-sdk.js "your prompt here"');
  console.error('Or set USER_PROMPT environment variable');
  process.exit(1);
}

generateWebsite(userPrompt).catch(error => {
  console.error('Generation failed:', error);
  process.exit(1);
});
