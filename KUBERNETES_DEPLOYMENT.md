# Kubernetes Deployment Guide

This guide covers deploying CNCF Explorer to Kubernetes using Helm charts and Docker images.

## Prerequisites

- Kubernetes cluster (1.19+)
- Helm 3.x installed
- kubectl configured
- Docker (for building images)
- Access to a container registry (optional, for production)

## Step 1: Build Docker Images

### Build Images Locally

```bash
# Build both images
./docker-build.sh

# Or build individually
cd backend
docker build -t cncf-explorer-backend:latest .

cd ../frontend
docker build -t cncf-explorer-frontend:latest .
```

### Push to Container Registry (Optional)

```bash
# Tag images
docker tag cncf-explorer-backend:latest <your-registry>/cncf-explorer-backend:latest
docker tag cncf-explorer-frontend:latest <your-registry>/cncf-explorer-frontend:latest

# Push images
docker push <your-registry>/cncf-explorer-backend:latest
docker push <your-registry>/cncf-explorer-frontend:latest
```

## Step 2: Update Helm Values

### Update Image References

If using a container registry, update the image repository in values files:

**helm/backend/values.yaml:**
```yaml
image:
  repository: <your-registry>/cncf-explorer-backend
  tag: "latest"
```

**helm/frontend/values.yaml:**
```yaml
image:
  repository: <your-registry>/cncf-explorer-frontend
  tag: "latest"
```

### Configure MongoDB Connection

The backend needs to connect to MongoDB. Update `helm/backend/values.yaml`:

```yaml
env:
  - name: MONGODB_URI
    value: "mongodb://mongodb-cncf-explorer-mongodb:27017/cncf-explorer"
```

### Configure Frontend Backend URL

Update `helm/frontend/values.yaml`:

```yaml
backendApiUrl: "http://backend-cncf-explorer-backend:3000/api"
```

## Step 3: Deploy to Kubernetes

### Option A: Using the Deployment Script

```bash
# Make script executable
chmod +x helm/deploy.sh

# Run deployment
./helm/deploy.sh
```

### Option B: Manual Deployment

```bash
# Create namespace
kubectl create namespace cncf-explorer

# Deploy MongoDB (StatefulSet)
helm install mongodb ./helm/mongodb \
  --namespace cncf-explorer

# Wait for MongoDB to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=cncf-explorer-mongodb \
  --namespace cncf-explorer --timeout=300s

# Deploy Backend
helm install backend ./helm/backend \
  --namespace cncf-explorer \
  --set env[1].value="mongodb://mongodb-cncf-explorer-mongodb:27017/cncf-explorer"

# Deploy Frontend
helm install frontend ./helm/frontend \
  --namespace cncf-explorer \
  --set backendApiUrl="http://backend-cncf-explorer-backend:3000/api"
```

## Step 4: Verify Deployment

### Check Pod Status

```bash
kubectl get pods -n cncf-explorer
```

All pods should be in `Running` state.

### Check Services

```bash
kubectl get svc -n cncf-explorer
```

### View Logs

```bash
# Backend logs
kubectl logs -n cncf-explorer -l app.kubernetes.io/name=cncf-explorer-backend --tail=50

# Frontend logs
kubectl logs -n cncf-explorer -l app.kubernetes.io/name=cncf-explorer-frontend --tail=50

# MongoDB logs
kubectl logs -n cncf-explorer -l app.kubernetes.io/name=cncf-explorer-mongodb --tail=50
```

## Step 5: Access the Application

### Port Forwarding (Development)

```bash
# Frontend
kubectl port-forward -n cncf-explorer svc/frontend-cncf-explorer-frontend 8080:80

# Backend (if needed)
kubectl port-forward -n cncf-explorer svc/backend-cncf-explorer-backend 3000:3000

# MongoDB (if needed)
kubectl port-forward -n cncf-explorer svc/mongodb-cncf-explorer-mongodb 27017:27017
```

Then open `http://localhost:8080` in your browser.

### Ingress (Production)

Enable ingress in the frontend values:

```yaml
ingress:
  enabled: true
  hosts:
    - host: cncf-explorer.yourdomain.com
      paths:
        - path: /
          pathType: Prefix
```

Then deploy:
```bash
helm upgrade frontend ./helm/frontend \
  --namespace cncf-explorer \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=cncf-explorer.yourdomain.com
```

## Architecture

```
┌─────────────────┐
│   Frontend      │ (Angular + Nginx)
│   Deployment    │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│   Backend       │ (NestJS)
│   Deployment    │
└────────┬────────┘
         │ MongoDB
         ▼
┌─────────────────┐
│   MongoDB         │ (StatefulSet)
│   StatefulSet    │
└───────────────────┘
```

## Configuration

### MongoDB StatefulSet

- **Storage**: Persistent volumes (10Gi default)
- **Replicas**: 1 (can be scaled)
- **Service**: Headless service for StatefulSet
- **Data Persistence**: Survives pod restarts

### Backend Deployment

- **Replicas**: 2 (configurable)
- **Health Checks**: Liveness and readiness probes
- **Resource Limits**: Configurable in values.yaml
- **Autoscaling**: Optional HPA support

### Frontend Deployment

- **Replicas**: 2 (configurable)
- **Static Files**: Served via Nginx
- **Environment Injection**: Backend API URL injected at runtime
- **Health Checks**: Liveness and readiness probes

## Upgrading

```bash
# Upgrade MongoDB
helm upgrade mongodb ./helm/mongodb --namespace cncf-explorer

# Upgrade Backend
helm upgrade backend ./helm/backend --namespace cncf-explorer

# Upgrade Frontend
helm upgrade frontend ./helm/frontend --namespace cncf-explorer
```

## Scaling

### Scale Backend

```bash
kubectl scale deployment backend-cncf-explorer-backend \
  --replicas=3 \
  --namespace cncf-explorer
```

### Scale Frontend

```bash
kubectl scale deployment frontend-cncf-explorer-frontend \
  --replicas=3 \
  --namespace cncf-explorer
```

### Enable Autoscaling

Edit `values.yaml` files:

```yaml
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 5
  targetCPUUtilizationPercentage: 80
```

## Troubleshooting

### Pods Not Starting

```bash
# Check pod events
kubectl describe pod <pod-name> -n cncf-explorer

# Check pod logs
kubectl logs <pod-name> -n cncf-explorer
```

### MongoDB Connection Issues

```bash
# Verify MongoDB service
kubectl get svc -n cncf-explorer | grep mongodb

# Test connection from backend pod
kubectl exec -it <backend-pod> -n cncf-explorer -- \
  sh
# Then test: telnet mongodb-cncf-explorer-mongodb 27017
```

### Frontend Can't Reach Backend

```bash
# Verify backend service
kubectl get svc -n cncf-explorer | grep backend

# Check backend API URL in frontend
kubectl exec -it <frontend-pod> -n cncf-explorer -- env | grep BACKEND_API_URL
```

### Storage Issues

```bash
# Check PVC status
kubectl get pvc -n cncf-explorer

# Check storage class
kubectl get storageclass
```

## Production Checklist

- [ ] Enable MongoDB authentication
- [ ] Use persistent storage class
- [ ] Configure resource limits
- [ ] Enable autoscaling
- [ ] Set up ingress with TLS
- [ ] Configure monitoring/logging
- [ ] Set up backup for MongoDB
- [ ] Use secrets for sensitive data
- [ ] Configure network policies
- [ ] Set up CI/CD pipeline

## Cleanup

```bash
# Uninstall all services
helm uninstall frontend --namespace cncf-explorer
helm uninstall backend --namespace cncf-explorer
helm uninstall mongodb --namespace cncf-explorer

# Delete namespace (this will delete all resources)
kubectl delete namespace cncf-explorer
```

## Additional Resources

- [Helm Documentation](https://helm.sh/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [MongoDB on Kubernetes](https://www.mongodb.com/docs/kubernetes-operator/)

