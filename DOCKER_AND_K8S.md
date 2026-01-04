# Docker & Kubernetes Quick Reference

## Docker Images

### Build Images

```bash
# Build both images
./docker-build.sh

# Or individually
cd backend && docker build -t cncf-explorer-backend:latest .
cd frontend && docker build -t cncf-explorer-frontend:latest .
```

### Image Details

- **Backend**: `cncf-explorer-backend:latest`
  - Base: `node:18-alpine`
  - Port: 3000
  - Health check: HTTP GET `/api/projects`

- **Frontend**: `cncf-explorer-frontend:latest`
  - Base: `nginx:alpine`
  - Port: 80
  - Health check: HTTP GET `/health`

## Helm Charts Structure

```
helm/
├── backend/
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── ingress.yaml
│       ├── hpa.yaml
│       ├── serviceaccount.yaml
│       ├── configmap.yaml
│       └── _helpers.tpl
├── frontend/
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── ingress.yaml
│       ├── hpa.yaml
│       └── _helpers.tpl
├── mongodb/
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/
│       ├── statefulset.yaml
│       ├── service.yaml
│       ├── secret.yaml
│       └── _helpers.tpl
└── deploy.sh
```

## Quick Deployment

### Using Make

```bash
# Build images
make docker-build

# Deploy to Kubernetes
make helm-deploy

# Check status
make helm-status
```

### Using Scripts

```bash
# Build images
./docker-build.sh

# Deploy to Kubernetes
./helm/deploy.sh
```

### Manual Deployment

```bash
# 1. Create namespace
kubectl create namespace cncf-explorer

# 2. Deploy MongoDB
helm install mongodb ./helm/mongodb --namespace cncf-explorer

# 3. Deploy Backend
helm install backend ./helm/backend \
  --namespace cncf-explorer \
  --set env[1].value="mongodb://mongodb-cncf-explorer-mongodb:27017/cncf-explorer"

# 4. Deploy Frontend
helm install frontend ./helm/frontend \
  --namespace cncf-explorer \
  --set backendApiUrl="http://backend-cncf-explorer-backend:3000/api"
```

## Service Names

After deployment, services will be named:
- MongoDB: `mongodb-cncf-explorer-mongodb` (StatefulSet)
- Backend: `backend-cncf-explorer-backend` (Deployment)
- Frontend: `frontend-cncf-explorer-frontend` (Deployment)

## Accessing Services

### Port Forward

```bash
# Frontend
kubectl port-forward -n cncf-explorer svc/frontend-cncf-explorer-frontend 8080:80

# Backend
kubectl port-forward -n cncf-explorer svc/backend-cncf-explorer-backend 3000:3000

# MongoDB
kubectl port-forward -n cncf-explorer svc/mongodb-cncf-explorer-mongodb 27017:27017
```

### Ingress (if enabled)

Update values.yaml to enable ingress, then access via the configured hostname.

## MongoDB StatefulSet Features

- **Persistent Storage**: 10Gi by default (configurable)
- **StatefulSet**: Ensures stable network identity
- **Headless Service**: For direct pod access
- **Data Persistence**: Survives pod restarts
- **Scalable**: Can scale replicas (with proper MongoDB replica set configuration)

## Environment Variables

### Backend
- `PORT`: Server port (default: 3000)
- `MONGODB_URI`: MongoDB connection string

### Frontend
- `BACKEND_API_URL`: Backend API URL (injected at runtime)

## Resource Limits

Default resource limits (configurable in values.yaml):

**Backend:**
- Requests: 100m CPU, 128Mi memory
- Limits: 500m CPU, 512Mi memory

**Frontend:**
- Requests: 50m CPU, 64Mi memory
- Limits: 200m CPU, 256Mi memory

**MongoDB:**
- Requests: 500m CPU, 1Gi memory
- Limits: 1000m CPU, 2Gi memory

## Troubleshooting Commands

```bash
# Check all resources
kubectl get all -n cncf-explorer

# Check pods
kubectl get pods -n cncf-explorer

# Check services
kubectl get svc -n cncf-explorer

# Check StatefulSet
kubectl get statefulset -n cncf-explorer

# View logs
kubectl logs -n cncf-explorer -l app.kubernetes.io/name=cncf-explorer-backend
kubectl logs -n cncf-explorer -l app.kubernetes.io/name=cncf-explorer-frontend
kubectl logs -n cncf-explorer -l app.kubernetes.io/name=cncf-explorer-mongodb

# Describe resources
kubectl describe pod <pod-name> -n cncf-explorer
```

