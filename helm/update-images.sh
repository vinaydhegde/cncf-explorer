#!/bin/bash

# Script to rebuild, tag, and push Docker images to Docker Hub
# Then update Helm deployments

set -e

DOCKER_USER="vinaydhegde"
NAMESPACE="cncf-explorer"

echo "🔨 Building Docker images..."
./docker-build.sh

echo ""
echo "🏷️  Tagging images for Docker Hub..."
docker tag cncf-explorer-backend:latest ${DOCKER_USER}/cncf-explorer-backend:latest
docker tag cncf-explorer-frontend:latest ${DOCKER_USER}/cncf-explorer-frontend:latest

echo ""
echo "📤 Pushing images to Docker Hub..."
docker push ${DOCKER_USER}/cncf-explorer-backend:latest
docker push ${DOCKER_USER}/cncf-explorer-frontend:latest

echo ""
echo "🔄 Restarting pods to pull new images..."
kubectl rollout restart deployment -n ${NAMESPACE} cncf-explorer-backend
kubectl rollout restart deployment -n ${NAMESPACE} cncf-explorer-frontend

echo ""
echo "⏳ Waiting for rollout to complete..."
kubectl rollout status deployment -n ${NAMESPACE} cncf-explorer-backend --timeout=5m
kubectl rollout status deployment -n ${NAMESPACE} cncf-explorer-frontend --timeout=5m

echo ""
echo "✅ Images updated and deployments restarted!"

