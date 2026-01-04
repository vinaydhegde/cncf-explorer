#!/bin/bash

# Quick fix script to update MongoDB URI in backend deployment

NAMESPACE="cncf-explorer"
RELEASE_NAME="cncf-explorer"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔧 Fixing MongoDB URI in backend deployment..."

MONGODB_URI="mongodb://cncf-explorer-mongodb:27017/cncf-explorer"

helm upgrade ${RELEASE_NAME}-backend ${SCRIPT_DIR}/backend \
  --namespace $NAMESPACE \
  --set mongodbUri="$MONGODB_URI" \
  --timeout 1m

echo "✅ Backend deployment updated with correct MongoDB URI: $MONGODB_URI"
echo ""
echo "Checking backend pods..."
kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=cncf-explorer-backend

