#!/bin/bash

# CNCF Explorer Setup Script
# This script helps set up the development environment

set -e

echo "🚀 Setting up CNCF Explorer..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create .env file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend/.env file..."
    if [ -f backend/.env.example ]; then
        cp backend/.env.example backend/.env
        echo "✅ Created backend/.env from .env.example"
    elif [ -f backend/env.template ]; then
        cp backend/env.template backend/.env
        echo "✅ Created backend/.env from env.template"
    else
        # Create .env file with default values
        cat > backend/.env << 'ENVEOF'
PORT=3000
MONGODB_URI=mongodb://localhost:27017/cncf-explorer
ENVEOF
        echo "✅ Created backend/.env with default values"
    fi
    echo "💡 Please review backend/.env and update if needed"
else
    echo "✅ backend/.env already exists"
fi

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "🐳 Docker detected"
    echo "💡 To start MongoDB with Docker, run: docker-compose up -d"
else
    echo "⚠️  Docker not found. Please ensure MongoDB is running locally."
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start MongoDB (docker-compose up -d or local MongoDB)"
echo "2. Start backend: cd backend && npm run start:dev"
echo "3. Start frontend: cd frontend && npm start"
echo "4. Open http://localhost:4200 in your browser"
echo "5. Click 'Sync CNCF Landscape' to load projects"

