## Project Goals
- I am building Yeevu AI (A lovable clone), an AI-powered code generation platform using the claude-code sdk

## Preferences
- don't try to run the script with your own bash tool. Write the script and tell me how to execute it, asking me for its output instead.

## Progress so far
- We have a website that takes in a prompt, uses claude code SDK to write code. But currently, it directly modifies my websites code by adding it as a page. The next task we are going to work on is making the code gen happen in an isolated environment and opening the dev server there.
- We have created a way to create sandboxes using daytona and preview them in using the getPreviewLink() function. The script scripts/test-preview-url.ts confirms this.

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
- ✅ **API Integration**: `/api/generate-daytona` endpoint for sandbox creation and code generation
- ✅ **Environment Configuration**: Proper `.env` setup for API keys (Anthropic + Daytona)
- ✅ **Script Management**: Download scripts for project management (`download-simple.ts`, `download-project.ts`)

## Current Architecture Flow
1. **User Input**: User enters prompt on main page → navigates to `/generate?prompt=<user_prompt>`
2. **Code Generation**: Generate page calls `/api/generate-daytona` → creates Daytona sandbox → Claude Code SDK generates code
3. **Preview & Deployment**: Generated website available at preview URL → user can view, download, or deploy
4. **File Management**: Generated files isolated in Daytona sandbox → local codebase remains unchanged

## Next Steps / Future Enhancements
- [ ] Add more deployment platform integrations
- [ ] Implement user authentication and project history
- [ ] Add template library for common project types
- [ ] Enhance error handling and retry mechanisms
- [ ] Add project sharing and collaboration features
 