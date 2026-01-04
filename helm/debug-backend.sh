#!/bin/bash

# Debug script for backend deployment issues

NAMESPACE="cncf-explorer"
RELEASE_NAME="cncf-explorer"

echo "🔍 Debugging Backend Deployment..."
echo ""

echo "1. Checking Helm release status:"
helm status ${RELEASE_NAME}-backend --namespace $NAMESPACE || echo "Release not found"
echo ""

echo "2. Checking backend pods:"
kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=cncf-explorer-backend
echo ""

echo "3. Checking pod events:"
kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | grep -i backend | tail -10
echo ""

echo "4. Checking pod logs (first pod):"
POD_NAME=$(kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=cncf-explorer-backend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$POD_NAME" ]; then
  echo "Pod: $POD_NAME"
  kubectl logs -n $NAMESPACE $POD_NAME --tail=50
else
  echo "No pods found"
fi
echo ""

echo "5. Checking pod describe (first pod):"
if [ -n "$POD_NAME" ]; then
  kubectl describe pod -n $NAMESPACE $POD_NAME | tail -30
else
  echo "No pods found"
fi
echo ""

echo "6. Checking MongoDB service:"
kubectl get svc -n $NAMESPACE | grep mongodb
echo ""

echo "7. Checking if MongoDB is ready:"
kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=cncf-explorer-mongodb
echo ""

echo "✅ Debug information collected"

