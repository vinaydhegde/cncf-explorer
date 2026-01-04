# CNCF Explorer Helm Charts

This directory contains Helm charts for deploying the CNCF Explorer application to Kubernetes.

## Charts

- **backend**: NestJS backend service
- **frontend**: Angular frontend service
- **mongodb**: MongoDB database (StatefulSet)

## Prerequisites

- Kubernetes cluster (1.19+)
- Helm 3.x
- kubectl configured to access your cluster

## Quick Start

### 1. Build Docker Images

```bash
# Build images locally
./docker-build.sh

# Or build and push to your registry
docker tag cncf-explorer-backend:latest <your-registry>/cncf-explorer-backend:latest
docker tag cncf-explorer-frontend:latest <your-registry>/cncf-explorer-frontend:latest
docker push <your-registry>/cncf-explorer-backend:latest
docker push <your-registry>/cncf-explorer-frontend:latest
```

### 2. Update Image References

Edit the `values.yaml` files in each chart to point to your image registry:

```yaml
# helm/backend/values.yaml
image:
  repository: <your-registry>/cncf-explorer-backend
  tag: "latest"

# helm/frontend/values.yaml
image:
  repository: <your-registry>/cncf-explorer-frontend
  tag: "latest"
```

### 3. Deploy MongoDB

```bash
helm install mongodb ./helm/mongodb \
  --namespace cncf-explorer \
  --create-namespace
```

### 4. Deploy Backend

```bash
helm install backend ./helm/backend \
  --namespace cncf-explorer \
  --set env[0].value="mongodb://mongodb-cncf-explorer-mongodb:27017/cncf-explorer"
```

### 5. Deploy Frontend

```bash
helm install frontend ./helm/frontend \
  --namespace cncf-explorer \
  --set backendApiUrl="http://backend-cncf-explorer-backend:3000"
```

## Configuration

### MongoDB

Key settings in `helm/mongodb/values.yaml`:

- `replicaCount`: Number of MongoDB replicas (default: 1)
- `persistence.size`: Storage size (default: 10Gi)
- `persistence.storageClass`: Storage class (empty = default)
- `mongodb.auth.enabled`: Enable authentication (default: false)

### Backend

Key settings in `helm/backend/values.yaml`:

- `replicaCount`: Number of backend replicas (default: 2)
- `env[1].value`: MongoDB connection string
- `resources`: CPU and memory limits/requests
- `autoscaling.enabled`: Enable HPA (default: false)

### Frontend

Key settings in `helm/frontend/values.yaml`:

- `replicaCount`: Number of frontend replicas (default: 2)
- `backendApiUrl`: Backend API URL
- `ingress.enabled`: Enable ingress (default: false)
- `resources`: CPU and memory limits/requests

## Upgrading

```bash
# Upgrade MongoDB
helm upgrade mongodb ./helm/mongodb --namespace cncf-explorer

# Upgrade Backend
helm upgrade backend ./helm/backend --namespace cncf-explorer

# Upgrade Frontend
helm upgrade frontend ./helm/frontend --namespace cncf-explorer
```

## Uninstalling

```bash
helm uninstall frontend --namespace cncf-explorer
helm uninstall backend --namespace cncf-explorer
helm uninstall mongodb --namespace cncf-explorer
```

## Production Considerations

1. **Enable MongoDB Authentication**:
   ```yaml
   mongodb:
     auth:
       enabled: true
       rootPassword: "secure-password"
       databasePassword: "secure-password"
   ```

2. **Use Persistent Storage Class**:
   ```yaml
   persistence:
     storageClass: "fast-ssd"
   ```

3. **Enable Ingress**:
   ```yaml
   ingress:
     enabled: true
     hosts:
       - host: cncf-explorer.yourdomain.com
   ```

4. **Enable Autoscaling**:
   ```yaml
   autoscaling:
     enabled: true
     minReplicas: 2
     maxReplicas: 5
   ```

5. **Use Secrets for Sensitive Data**:
   - Store MongoDB passwords in Kubernetes Secrets
   - Use external secret management (e.g., Sealed Secrets, External Secrets Operator)

## Troubleshooting

### Check Pod Status
```bash
kubectl get pods -n cncf-explorer
```

### View Logs
```bash
# Backend logs
kubectl logs -n cncf-explorer deployment/backend-cncf-explorer-backend

# Frontend logs
kubectl logs -n cncf-explorer deployment/frontend-cncf-explorer-frontend

# MongoDB logs
kubectl logs -n cncf-explorer statefulset/mongodb-cncf-explorer-mongodb
```

### Port Forward for Testing
```bash
# Backend
kubectl port-forward -n cncf-explorer svc/backend-cncf-explorer-backend 3000:3000

# Frontend
kubectl port-forward -n cncf-explorer svc/frontend-cncf-explorer-frontend 8080:80

# MongoDB
kubectl port-forward -n cncf-explorer svc/mongodb-cncf-explorer-mongodb 27017:27017
```

