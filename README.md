# Yeevu AI


An AI-powered code generation platform built with the Claude Code SDK, featuring isolated code generation using Daytona sandboxes.


## Features

- **Isolated Code Generation**: Generated code runs in Daytona sandboxes, not your local environment
- **Real-time Preview**: Preview generated websites instantly with live iframe integration
- **Streaming Progress**: Watch the AI generate your code in real-time with visual feedback
- **Download Functionality**: Download generated projects as ZIP files for local development
- **Multiple Hosting Options**: Deploy projects to various hosting platforms directly from the interface
- **Error Handling**: Comprehensive error messages and user feedback throughout the process
- **Cross-Platform Support**: Works on Windows (with WSL), macOS, and Linux
- **API Integration**: Seamless integration with Claude Code SDK and Daytona sandboxes

## Architecture Flow

### 1. User Input
- User enters a prompt on the main page (`app/page.tsx`)
- Form navigates to `/generate?prompt=<user_prompt>`

### 2. Code Generation
- Generate page (`app/generate/page.tsx`) calls `/api/generate-multimodel`
- API creates a new Daytona sandbox with isolated environment
- Anthropic SDK with custom tool handlers generates code directly in the sandbox

### 3. Preview & Deployment
- Generated website becomes available at a preview URL
- User can:
  - View live preview in iframe
  - Download project as ZIP file
  - Deploy to hosting platforms (Not implemented Yet)

### 4. File Management
- Generated files stay in Daytona sandbox (isolated)
- Downloads saved to `temp-downloads/<sandbox-id>/`
- Your local codebase remains unchanged

## Getting Started

Before you begin, please make sure to **replace the API keys** in your `.env` file:

- Get your Anthropic API key from: [Anthropic Console](https://console.anthropic.com/dashboard)
- Get your Daytona API key from: [Daytona Dashboard](https://www.daytona.io/)

Add these keys to your `.env` file as follows:

``` .env
ANTHROPIC_API_KEY=your_anthropic_api_key
DAYTONA_API_KEY=your_daytona_api_key
```

### Daytona Live Preview Requirements

To use the live preview feature with Daytona sandboxes, you'll need to activate **TIER 2 Organization status** on Daytona. At the time of publishing, this requires:
- **$20 Wallet Top-up** on your Daytona account
- **GitHub Account connection** to your Daytona organization

This tier enables the live preview functionality that allows you to see generated websites in real-time within the application.

## Install & Run

From the `yeevu-ui` directory, install all dependencies and start the development server:

```bash
cd yeevu-ui

npm install
npm run dev
```

This will launch the app locally (by default at http://localhost:3000).

**Note for Windows Users**: If you're testing this locally on Windows, you'll need to use Windows Subsystem for Linux (WSL) to run the development environment properly.

## Testing the Workflow

1. Navigate to `http://localhost:3000`
2. Enter a prompt like "Create a simple blog website"
3. Watch the AI generate code in real-time
4. Preview the generated website
5. Download or deploy as needed

The entire process happens in isolated Daytona sandboxes - your local files are never modified.

## Technical Highlights

- **Isolated Environment**: All code generation happens in secure Daytona sandboxes
- **Real-time Streaming**: Live progress updates during code generation
- **Preview Integration**: Seamless iframe preview of generated websites
- **Download Management**: Organized file downloads with sandbox-specific folders
- **API Architecture**: Clean separation between frontend and backend services
- **Error Recovery**: Robust error handling with user-friendly messages

## Pending Tasks

### High Priority
- [ ] **Deploy to Hosting Platforms**: Implement direct deployment to Vercel, Netlify, and other hosting services
- [ ] **User Authentication**: Add user accounts and project history management

### Medium Priority
- [ ] **Project Sharing**: Enable users to share generated projects with others
- [ ] **Enhanced Error Handling**: Implement retry mechanisms and better error recovery
- [ ] **Performance Optimization**: Improve code generation speed and resource usage

### Future Enhancements
- [ ] **Custom Domain Support**: Allow users to deploy with custom domains
- [ ] **Database Integration**: Add database setup and configuration options
- [ ] **API Documentation**: Generate API documentation for created projects
- [ ] **Mobile App**: Develop mobile companion app for project management
- [ ] **Plugin System**: Create extensible plugin architecture for custom integrations
- [ ] **Analytics Dashboard**: Track project generation metrics and usage statistics

### Infrastructure Improvements
- [ ] **Multi-region Support**: Deploy sandboxes in different geographic regions
- [ ] **Resource Scaling**: Implement automatic scaling based on demand
- [ ] **Backup & Recovery**: Add project backup and version control features
- [ ] **Security Enhancements**: Implement additional security measures and audits

