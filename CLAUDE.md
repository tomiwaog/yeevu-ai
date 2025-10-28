## Project Goals
- I am building Yeevu AI (A lovable clone), an AI-powered code generation platform using the Anthropic SDK

## Preferences
- don't try to run the script with your own bash tool. Write the script and tell me how to execute it, asking me for its output instead.

## Critical Rules for AI Generation APIs
- **NEVER add blocking validation that throws errors during file generation**
- **DO NOT interrupt AI generation with premature file existence checks**
- File validation should only LOG warnings, never THROW errors that stop the generation process
- Let the AI complete its full generation cycle before doing any validation
- Example of WRONG approach: `throw new Error("Critical files missing")` during generation
- Example of CORRECT approach: `console.log("Warning: files not yet generated, continuing...")`
- AI generates files through tool calls - validation exceptions will break the process

## Progress so far
- ✅ **Isolated Code Generation**: Code generation happens in Daytona sandboxes (no local file modifications)
- ✅ **Migrated to Anthropic SDK**: Switched from `@anthropic-ai/claude-code` to `@anthropic-ai/sdk` for better reliability
- ✅ **Custom Tool Implementation**: Built manual tool handlers for full control over code generation
- ✅ **Live Preview System**: Created sandbox preview functionality using Daytona's `getPreviewLink()`
- ✅ **Multi-turn Conversations**: Generation script manages conversation loops with up to 30 turns

## Recent Feature Additions

### Isolated Code Generation Environment
- ✅ **Daytona Sandbox Integration**: Code generation now happens in isolated Daytona sandboxes instead of modifying local files
- ✅ **Live Preview System**: Generated websites can be previewed in real-time using Daytona's preview functionality
- ✅ **Streaming Progress**: Users can watch AI generate code in real-time with streaming updates

### Project Management & Deployment
- ✅ **Download Functionality**: Users can download generated projects as ZIP files
- ✅ **Multiple Hosting Options**: Support for deploying to various hosting platforms
- ✅ **File Management**: Generated files stay in Daytona sandbox (isolated) with downloads saved to `temp-downloads/<sandbox-id>/`

### User Experience Enhancements
- ✅ **Real-time Preview**: Preview generated websites instantly in iframe
- ✅ **Progress Tracking**: Visual feedback during code generation process
- ✅ **Error Handling**: Improved error messages and user feedback

### Documentation & Setup
- ✅ **Comprehensive README**: Updated with installation instructions, Windows WSL requirements, and Daytona tier requirements
- ✅ **Windows WSL Support**: Added documentation for Windows users requiring WSL for local development
- ✅ **Daytona Tier Requirements**: Documented TIER 2 Organization requirements ($20 wallet top-up + GitHub connection) for live preview

### Technical Infrastructure
- ✅ **API Integration**: `/api/generate-multimodel` endpoint for sandbox creation and code generation
- ✅ **Anthropic SDK Integration**: Uses `@anthropic-ai/sdk` with custom tool handlers for reliable code generation
- ✅ **Environment Configuration**: Proper `.env` setup for API keys (Anthropic + Daytona)
- ✅ **Script Management**: Download scripts for project management (`download-simple.ts`, `download-project.ts`)
- ✅ **Custom Tool Implementation**: Manual tool handlers (Write, Read, Edit, Bash, Glob, Grep) in `scripts/generate-anthropic-sdk.js`

## Current Architecture Flow
1. **User Input**: User enters prompt on main page → navigates to `/generate?prompt=<user_prompt>`
2. **Code Generation**: Generate page calls `/api/generate-multimodel` → creates Daytona sandbox → installs `@anthropic-ai/sdk` → runs custom generation script
3. **Multi-turn Conversation**: Generation script manages conversation loop, executing tool calls until website is complete
4. **Preview & Deployment**: Generated website available at preview URL → user can view, download, or deploy
5. **File Management**: Generated files isolated in Daytona sandbox → local codebase remains unchanged

## Next Steps / Future Enhancements
- [ ] Add more deployment platform integrations
- [ ] Implement user authentication and project history
- [ ] Add template library for common project types
- [ ] Enhance error handling and retry mechanisms
- [ ] Add project sharing and collaboration features
 