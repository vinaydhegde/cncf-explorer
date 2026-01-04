#!/bin/bash

# Quick fix script to update backend API URL in frontend deployment

NAMESPACE="cncf-explorer"
RELEASE_NAME="cncf-explorer"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔧 Fixing backend API URL in frontend deployment..."

BACKEND_SERVICE="${RELEASE_NAME}-backend"
BACKEND_API_URL="http://${BACKEND_SERVICE}:3000/api"

helm upgrade ${RELEASE_NAME}-frontend ${SCRIPT_DIR}/frontend \
  --namespace $NAMESPACE \
  --set backendApiUrl="$BACKEND_API_URL" \
  --timeout 2m

echo "✅ Frontend deployment updated with correct backend API URL: $BACKEND_API_URL"
echo ""
echo "Checking frontend pods..."
kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=cncf-explorer-frontend

