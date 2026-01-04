#!/bin/bash

# Build script for CNCF Explorer Docker images

set -e

echo "🐳 Building CNCF Explorer Docker images..."

# Build backend image
echo "📦 Building backend image..."
cd backend
docker build -t cncf-explorer-backend:latest .
cd ..

# Build frontend image
echo "📦 Building frontend image..."
cd frontend
docker build -t cncf-explorer-frontend:latest .
cd ..

echo "✅ All images built successfully!"
echo ""
echo "Images created:"
echo "  - cncf-explorer-backend:latest"
echo "  - cncf-explorer-frontend:latest"
echo ""
echo "To push to a registry:"
echo "  docker tag cncf-explorer-backend:latest <registry>/cncf-explorer-backend:latest"
echo "  docker tag cncf-explorer-frontend:latest <registry>/cncf-explorer-frontend:latest"
echo "  docker push <registry>/cncf-explorer-backend:latest"
echo "  docker push <registry>/cncf-explorer-frontend:latest"

