# Using Local Docker Images in Kubernetes

When you build Docker images locally but don't push them to a registry, Kubernetes needs a way to access them. Here are the solutions depending on your Kubernetes setup:

## Quick Solution

Run the helper script **before** deploying:

```bash
./helm/load-local-images.sh
./helm/deploy.sh
```

The deploy script now uses `imagePullPolicy: Never` by default for local development.

## Solutions by Kubernetes Type

### 1. **kind (Kubernetes in Docker)**

If you're using `kind`, load images directly:

```bash
# Build images
./docker-build.sh

# Load into kind
kind load docker-image cncf-explorer-backend:latest
kind load docker-image cncf-explorer-frontend:latest

# Deploy
./helm/deploy.sh
```

### 2. **minikube**

If you're using `minikube`, load images:

```bash
# Build images
./docker-build.sh

# Load into minikube
minikube image load cncf-explorer-backend:latest
minikube image load cncf-explorer-frontend:latest

# Deploy
./helm/deploy.sh
```

### 3. **Docker Desktop Kubernetes**

Docker Desktop can use images from your local Docker daemon. The deploy script sets `imagePullPolicy: Never` which should work if:
- Images are built locally
- Kubernetes is using the same Docker daemon

```bash
# Build images
./docker-build.sh

# Deploy (uses Never pull policy)
./helm/deploy.sh
```

### 4. **Other Local Clusters**

For other local Kubernetes setups, you have options:

#### Option A: Local Registry

```bash
# Start local registry
docker run -d -p 5000:5000 --name registry registry:2

# Tag and push to local registry
docker tag cncf-explorer-backend:latest localhost:5000/cncf-explorer-backend:latest
docker tag cncf-explorer-frontend:latest localhost:5000/cncf-explorer-frontend:latest
docker push localhost:5000/cncf-explorer-backend:latest
docker push localhost:5000/cncf-explorer-frontend:latest

# Update values.yaml to use localhost:5000/...
# Then deploy
./helm/deploy.sh
```

#### Option B: Manual Image Loading

If your cluster supports it, you may need to manually copy images to nodes or use tools specific to your setup.

### 5. **Production: Push to Registry**

For production, push to a container registry:

```bash
# Build images
./docker-build.sh

# Tag for your registry
docker tag cncf-explorer-backend:latest <your-registry>/cncf-explorer-backend:latest
docker tag cncf-explorer-frontend:latest <your-registry>/cncf-explorer-frontend:latest

# Push
docker push <your-registry>/cncf-explorer-backend:latest
docker push <your-registry>/cncf-explorer-frontend:latest

# Update helm/backend/values.yaml and helm/frontend/values.yaml
# Set image.repository to <your-registry>/cncf-explorer-backend
# Set image.pullPolicy to IfNotPresent or Always

# Deploy
./helm/deploy.sh
```

## Overriding Pull Policy

The deploy script sets `imagePullPolicy: Never` by default for local development. To override:

```bash
# Use IfNotPresent (for registry images)
helm upgrade --install cncf-explorer-backend ./helm/backend \
  --namespace cncf-explorer \
  --set image.pullPolicy=IfNotPresent \
  --set mongodbUri="mongodb://..."
```

## Troubleshooting

### ImagePullBackOff Error

If you see `ImagePullBackOff`:

1. **Check if image exists locally:**
   ```bash
   docker images | grep cncf-explorer
   ```

2. **Verify pull policy:**
   ```bash
   kubectl get deployment -n cncf-explorer -o yaml | grep imagePullPolicy
   ```

3. **For kind/minikube, ensure images are loaded:**
   ```bash
   # kind
   kind load docker-image cncf-explorer-backend:latest
   
   # minikube
   minikube image load cncf-explorer-backend:latest
   ```

4. **For Docker Desktop, ensure Kubernetes is using the same Docker daemon**

### Why MongoDB Works But Backend Doesn't

- **MongoDB**: Uses official `mongo` image from Docker Hub (publicly available)
- **Backend/Frontend**: Custom images that only exist locally

This is why MongoDB pods start successfully but backend/frontend fail with `ImagePullBackOff`.

