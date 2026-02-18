#!/bin/bash

# Build Bug Bounty App for Production
echo "🏗️ Building Bug Bounty App for Production..."

# Build frontend
echo "🎨 Building frontend..."
cd frontend
npm run build

echo "✅ Frontend build completed"
echo "📁 Build files are in frontend/build/"
