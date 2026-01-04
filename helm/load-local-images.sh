#!/bin/bash

# Script to load local Docker images into Kubernetes cluster
# Supports: kind, minikube, Docker Desktop, and generic clusters

set -e

echo "🔄 Loading local Docker images into Kubernetes cluster..."
echo ""

# Detect Kubernetes environment
if command -v kind &> /dev/null && kind get clusters &> /dev/null; then
    echo "📦 Detected kind cluster"
    echo "Loading images into kind..."
    kind load docker-image cncf-explorer-backend:latest
    kind load docker-image cncf-explorer-frontend:latest
    echo "✅ Images loaded into kind cluster"
    
elif command -v minikube &> /dev/null && minikube status &> /dev/null; then
    echo "📦 Detected minikube cluster"
    echo "Loading images into minikube..."
    minikube image load cncf-explorer-backend:latest
    minikube image load cncf-explorer-frontend:latest
    echo "✅ Images loaded into minikube cluster"
    
elif docker info &> /dev/null && kubectl cluster-info &> /dev/null; then
    # Docker Desktop or local cluster
    echo "📦 Detected Docker Desktop or local Kubernetes"
    echo "⚠️  For Docker Desktop, images should be available if built locally"
    echo "⚠️  For other local clusters, you may need to:"
    echo "   1. Set up a local registry, OR"
    echo "   2. Use 'imagePullPolicy: Never' and ensure images are on nodes"
    echo ""
    echo "Setting imagePullPolicy to Never for local development..."
    echo ""
    echo "To use Never policy, update your deployment:"
    echo "  helm upgrade --install cncf-explorer-backend ./helm/backend \\"
    echo "    --namespace cncf-explorer \\"
    echo "    --set image.pullPolicy=Never"
    echo ""
    echo "  helm upgrade --install cncf-explorer-frontend ./helm/frontend \\"
    echo "    --namespace cncf-explorer \\"
    echo "    --set image.pullPolicy=Never"
    
else
    echo "❌ Could not detect Kubernetes environment"
    echo ""
    echo "Options:"
    echo "1. Use kind: kind load docker-image cncf-explorer-backend:latest"
    echo "2. Use minikube: minikube image load cncf-explorer-backend:latest"
    echo "3. Set up a local registry"
    echo "4. Push images to a registry (Docker Hub, etc.)"
    exit 1
fi

echo ""
echo "✅ Done! You can now deploy with:"
echo "   ./helm/deploy.sh"

