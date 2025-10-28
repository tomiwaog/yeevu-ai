# Yeevu AI Generation Scripts

Clean, minimal scripts for generating websites using Anthropic SDK in Daytona sandboxes.

## Core Functionality

### 1. Main Generation - API Integration
**Purpose:** Website generation happens through `/api/generate-multimodel` endpoint

**Features:**
- ✅ **Anthropic SDK** - Direct SDK integration with custom tool handlers
- ✅ **Dynamic Generation** - AI generates all files based on user prompt through tool calls
- ✅ **Multi-turn Conversations** - Manages conversation loops until website is complete
- ✅ **Sandbox Isolation** - Code generation happens in Daytona sandbox
- ✅ **Live Preview** - Get preview URLs for generated websites
- ✅ **Streaming Progress** - Real-time feedback during generation

**Script:** `generate-anthropic-sdk.js` - Custom tool implementation (Write, Read, Edit, Bash, Glob, Grep)

**Usage:** Called automatically through the web interface at `/generate?prompt=your-prompt`

### 2. `download-simple.ts` - Project Download
**Purpose:** Downloads generated projects from Daytona sandboxes as ZIP files

**Features:**
- 📦 **ZIP Download** - Complete project download
- 🔒 **Isolated Downloads** - Files saved to `temp-downloads/<sandbox-id>/`
- 🧹 **Auto Cleanup** - Temporary files are cleaned up

**API Integration:** Used by `/api/download` endpoint

## Utility Scripts

### 3. `get-preview-url.ts` - Preview URL Helper
**Purpose:** Get preview URL for existing Daytona sandbox

**Usage:**
```bash
npx tsx scripts/get-preview-url.ts <sandbox-id>
```

### 4. `remove-sandbox.ts` - Sandbox Cleanup  
**Purpose:** Remove Daytona sandboxes to free resources

**Usage:**
```bash
npx tsx scripts/remove-sandbox.ts <sandbox-id>
```

### 5. `test-preview-url.ts` - Preview URL Testing
**Purpose:** Test Daytona preview URL functionality

**Usage:**
```bash
npx tsx scripts/test-preview-url.ts
```

## Environment Setup

Create `.env` file in the `yeevu-ui` directory:

```bash
# Required
ANTHROPIC_API_KEY=your_anthropic_api_key
DAYTONA_API_KEY=your_daytona_api_key
```

## Architecture Flow

```
User Prompt → API Route → Claude Code SDK → Generated Website
     ↓              ↓              ↓              ↓
  "Create blog"   /api/generate   Daytona Sandbox   Live Preview URL
```

## How It Works

1. **User submits prompt** via web interface
2. **API creates Daytona sandbox** with Node.js environment  
3. **Claude Code SDK installed** in sandbox
4. **User's prompt passed directly to Claude** - no templates or restrictions
5. **Claude generates files** using Write/Read/Edit tools based on the prompt
6. **Dependencies installed** and dev server started
7. **Preview URL returned** for live website viewing

## Key Benefits

✅ **No Hardcoded Templates** - Every website is unique based on user prompt  
✅ **True AI Generation** - Claude decides technology stack and design  
✅ **Isolated Execution** - Code runs in sandbox, not local environment  
✅ **Live Preview** - Instant preview of generated websites  
✅ **Clean Architecture** - Minimal, focused scripts doing one thing well

## Troubleshooting

### "JSON parse error"
- Fixed with improved error handling in streaming response
- Empty data chunks are now skipped automatically

### "Generation failed"
- Check `ANTHROPIC_API_KEY` is set correctly
- Verify sufficient API credits
- Check network connectivity

### "Preview URL not working" 
- Wait 20-30 seconds for server startup
- Check Daytona sandbox is still active
- Try refreshing the page

### "Download failed"
- Verify sandbox ID exists
- Check file permissions
- Ensure adequate disk space

## Development Notes

- **Simplified Architecture** - Direct Anthropic SDK integration with custom tool handlers
- **Single API Route** - Only `/api/generate-multimodel` for generation
- **Better Control** - Manual tool implementation for full control over generation process
- **Better Error Handling** - JSON parsing errors are caught and logged
- **Minimal Dependencies** - Only what's essential for core functionality
- **TypeScript & JavaScript** for type safety and better debugging