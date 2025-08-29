#!/usr/bin/env tsx

import { generateCodeWithClaude } from './generateWithClaudeCode';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: claude-cli <prompt>');
    console.log('Example: claude-cli "Create a simple React todo app"');
    process.exit(1);
  }
  
  const prompt = args.join(' ');
  console.log(`Generating code for prompt: "${prompt}"`);
  console.log('---');
  
  try {
    const result = await generateCodeWithClaude(prompt);
    
    if (result.success) {
      console.log('✅ Code generation completed successfully!');
      console.log(`Generated ${result.messages.length} messages`);
      
      // Display the messages
      result.messages.forEach((message, index) => {
        console.log(`\n--- Message ${index + 1} ---`);
        console.log(`Type: ${message.type}`);
        if (message.content) {
          console.log('Content:', message.content);
        }
      });
    } else {
      console.error('❌ Code generation failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

main();
