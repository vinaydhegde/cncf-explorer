#!/bin/bash

# Deployment script for CNCF Explorer using Helm

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

NAMESPACE="cncf-explorer"
RELEASE_NAME="cncf-explorer"

echo "🚀 Deploying CNCF Explorer to Kubernetes..."

# Create namespace if it doesn't exist
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Deploy MongoDB (StatefulSet)
echo "📦 Deploying MongoDB..."
helm upgrade --install ${RELEASE_NAME}-mongodb ${SCRIPT_DIR}/mongodb \
  --namespace $NAMESPACE \
  --wait --timeout 5m

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
kubectl wait --for=condition=ready pod \
  -l app.kubernetes.io/name=cncf-explorer-mongodb \
  --namespace $NAMESPACE \
  --timeout=300s || true

# Get MongoDB service name
# The service name is constructed as: <release-name> where release-name is ${RELEASE_NAME}-mongodb
# Since the chart name is also "cncf-explorer-mongodb", Helm uses just the release name
MONGODB_SERVICE="${RELEASE_NAME}-mongodb"
MONGODB_URI="mongodb://${MONGODB_SERVICE}:27017/cncf-explorer"

# Deploy Backend
echo "📦 Deploying Backend..."
# Use Never pull policy for local images (can be overridden)
helm upgrade --install ${RELEASE_NAME}-backend ${SCRIPT_DIR}/backend \
  --namespace $NAMESPACE \
  --set mongodbUri="$MONGODB_URI" \
  --timeout 2m \
  --wait

# Get Backend service name
# The service name is constructed as: <release-name> where release-name is ${RELEASE_NAME}-backend
# Since the chart name is also "cncf-explorer-backend", Helm uses just the release name
BACKEND_SERVICE="${RELEASE_NAME}-backend"
BACKEND_API_URL="http://${BACKEND_SERVICE}:3000/api"

# Deploy Frontend
echo "📦 Deploying Frontend..."
# Use Never pull policy for local images (can be overridden)
# Note: backendApiUrl is optional - nginx proxies /api to backend service
helm upgrade --install ${RELEASE_NAME}-frontend ${SCRIPT_DIR}/frontend \
  --namespace $NAMESPACE \
  --set backendApiUrl="/api" \
  --wait --timeout 2m

echo "✅ Deployment complete!"
echo ""
# Get Frontend service name (same logic as backend)
FRONTEND_SERVICE="${RELEASE_NAME}-frontend"

echo "Services deployed:"
echo "  - MongoDB: ${MONGODB_SERVICE} (${MONGODB_URI})"
echo "  - Backend: ${BACKEND_SERVICE} (${BACKEND_API_URL})"
echo "  - Frontend: ${FRONTEND_SERVICE}"
echo ""
echo "To access the application:"
echo "  kubectl port-forward -n $NAMESPACE svc/${FRONTEND_SERVICE} 8080:80"
echo "  Then open http://localhost:8080 in your browser"

