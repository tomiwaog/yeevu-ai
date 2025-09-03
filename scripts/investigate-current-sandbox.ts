#!/usr/bin/env node

// Investigation script for the current sandbox
// This will connect and investigate what happened with the latest generation

import { Daytona } from "@daytonaio/sdk";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const sandboxId = "3283d57d-f9ff-4dc8-80c3-b631d3a5258a"; // Latest sandbox from the logs

async function investigate() {
  if (!process.env.DAYTONA_API_KEY) {
    console.error("DAYTONA_API_KEY required");
    process.exit(1);
  }

  const daytona = new Daytona({
    apiKey: process.env.DAYTONA_API_KEY,
  });

  try {
    console.log("🔍 Connecting to sandbox:", sandboxId);
    
    const sandbox = await daytona.get(sandboxId);
    console.log("✅ Connected to sandbox");
    console.log("Sandbox status:", sandbox.status);
    
    const rootDir = await sandbox.getUserRootDir();
    const projectDir = `${rootDir}/website-project`;
    
    console.log("\n📂 Root directory contents:");
    const listRoot = await sandbox.process.executeCommand("ls -la", rootDir);
    console.log(listRoot.result);
    
    console.log("\n📂 Project directory contents:");
    const listProject = await sandbox.process.executeCommand("ls -la", projectDir);
    console.log(listProject.result);
    
    console.log("\n📁 Looking for app directory:");
    const findApp = await sandbox.process.executeCommand("find . -type d -name 'app' -ls", projectDir);
    console.log(findApp.result);
    
    console.log("\n📄 All .tsx files:");
    const findTsx = await sandbox.process.executeCommand("find . -name '*.tsx' -ls", projectDir);
    console.log(findTsx.result);
    
    console.log("\n📄 All .ts files:");
    const findTs = await sandbox.process.executeCommand("find . -name '*.ts' -ls", projectDir);
    console.log(findTs.result);
    
    console.log("\n📄 All .js files:");
    const findJs = await sandbox.process.executeCommand("find . -name '*.js' -ls", projectDir);
    console.log(findJs.result);
    
    console.log("\n📄 All .json files:");
    const findJson = await sandbox.process.executeCommand("find . -name '*.json' -ls", projectDir);
    console.log(findJson.result);
    
    console.log("\n📄 All .css files:");
    const findCss = await sandbox.process.executeCommand("find . -name '*.css' -ls", projectDir);
    console.log(findCss.result);
    
    console.log("\n🗂️ Complete file tree:");
    const tree = await sandbox.process.executeCommand("find . -type f | head -50", projectDir);
    console.log(tree.result);
    
    console.log("\n📝 Checking if package.json exists and its contents:");
    const packageJson = await sandbox.process.executeCommand("cat package.json 2>/dev/null || echo 'package.json not found'", projectDir);
    console.log(packageJson.result);
    
    console.log("\n📝 Checking generation script logs/output:");
    const logs = await sandbox.process.executeCommand("ls -la *.log *.out 2>/dev/null || echo 'No log files found'", projectDir);
    console.log(logs.result);
    
    console.log("\n🔍 Any recent files modified in last hour:");
    const recent = await sandbox.process.executeCommand("find . -type f -mmin -60 -ls", projectDir);
    console.log(recent.result);
    
  } catch (error) {
    console.error("❌ Investigation failed:", error.message);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
  }
}

investigate().catch(console.error);