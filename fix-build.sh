#!/bin/bash

echo "🔧 Fixing build issues..."

# Remove node_modules and package-lock.json
echo "📦 Removing existing dependencies..."
rm -rf node_modules package-lock.json

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Install minimatch types specifically
echo "📥 Installing minimatch types..."
npm install --save-dev @types/minimatch@^6.0.0

# Test the build
echo "🔨 Testing build..."
npm run build

echo "✅ Build fix completed!" 