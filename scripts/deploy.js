#!/usr/bin/env node

import { config } from 'dotenv';
import { execSync } from 'child_process';

const mode = process.argv[2] || 'production'; // 'development' or 'production'
const deployTarget = process.argv[3] || 'hosting'; // 'hosting' or 'all'

// Determine env file path
const envFile = mode === 'development' 
  ? '.env' 
  : '.env.production';

// Load environment variables from the appropriate file
const result = config({ path: envFile });

if (result.error) {
  console.error(`❌ Error loading ${envFile}:`, result.error.message);
  console.error(`   Make sure ${envFile} exists and contains FIREBASE_PROJECT_ID`);
  process.exit(1);
}

// Get project ID from environment
const projectId = process.env.FIREBASE_PROJECT_ID;

if (!projectId) {
  console.error(`❌ FIREBASE_PROJECT_ID not found in ${envFile}`);
  console.error(`   Make sure ${envFile} contains FIREBASE_PROJECT_ID=your-project-id`);
  process.exit(1);
}

// Build command
const buildCmd = mode === 'development' 
  ? 'npm run build:dev' 
  : 'npm run build:prod';

// Deploy command
let deployCmd = `firebase deploy --project ${projectId}`;
if (deployTarget === 'hosting') {
  deployCmd += ' --only hosting';
}

console.log(`📦 Building for ${mode}...`);
try {
  execSync(buildCmd, { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Build failed');
  process.exit(1);
}

console.log(`🚀 Deploying to Firebase project: ${projectId}`);
try {
  execSync(deployCmd, { stdio: 'inherit' });
  console.log('✅ Deployment successful!');
} catch (error) {
  console.error('❌ Deployment failed');
  process.exit(1);
}

