import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

console.log('🔧 Starting Disaster Platform Local Setup...');

// 1. Copy .env if not exists
if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from .env.example');
  } else {
    console.error('❌ Error: .env.example not found!');
    process.exit(1);
  }
} else {
  console.log('ℹ️ .env file already exists. Skipping copy.');
}

console.log('\n🚀 Setup completed! Here is how to run the project:');
console.log('------------------------------------------------------');
console.log('1. Start the Docker containers:');
console.log('   docker compose up --build');
console.log('   (This will launch client, server, and mongodb)');
console.log('\n2. Access the services:');
console.log('   - Frontend: http://localhost:8080');
console.log('   - Backend API: http://localhost:5000');
console.log('   - MongoDB: localhost:27017');
console.log('------------------------------------------------------\n');
