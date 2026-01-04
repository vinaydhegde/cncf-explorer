.PHONY: help install dev-backend dev-frontend build start-mongo stop-mongo init-db seed-db clean docker-build docker-push helm-deploy helm-upgrade helm-uninstall

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	@echo "Installing dependencies..."
	cd backend && npm install
	cd frontend && npm install

dev-backend: ## Start backend in development mode
	cd backend && npm run start:dev

dev-frontend: ## Start frontend in development mode
	cd frontend && npm start

start-mongo: ## Start MongoDB using Docker Compose
	docker-compose up -d
	@echo "MongoDB started. Waiting for it to be ready..."
	@sleep 3

stop-mongo: ## Stop MongoDB Docker container
	docker-compose down

init-db: ## Initialize database with indexes
	@echo "Initializing database..."
	node scripts/init-db.js

seed-db: ## Seed database with sample data
	@echo "Seeding database..."
	node scripts/seed-sample-data.js

build: ## Build both backend and frontend
	cd backend && npm run build
	cd frontend && npm run build

clean: ## Clean build artifacts and node_modules
	rm -rf backend/dist frontend/dist
	rm -rf node_modules backend/node_modules frontend/node_modules

setup: install start-mongo init-db ## Full setup: install deps, start mongo, init db
	@echo "Setup complete!"

# Docker targets
docker-build: ## Build Docker images for backend and frontend
	./docker-build.sh

docker-push: ## Push Docker images to registry (set REGISTRY env var)
	@if [ -z "$(REGISTRY)" ]; then \
		echo "Error: REGISTRY environment variable not set"; \
		echo "Usage: make docker-push REGISTRY=your-registry.com"; \
		exit 1; \
	fi
	docker tag cncf-explorer-backend:latest $(REGISTRY)/cncf-explorer-backend:latest
	docker tag cncf-explorer-frontend:latest $(REGISTRY)/cncf-explorer-frontend:latest
	docker push $(REGISTRY)/cncf-explorer-backend:latest
	docker push $(REGISTRY)/cncf-explorer-frontend:latest

# Helm targets
helm-deploy: ## Deploy all services to Kubernetes using Helm
	./helm/deploy.sh

helm-load-images: ## Load local Docker images into Kubernetes cluster (kind/minikube)
	./helm/load-local-images.sh

helm-deploy-local: docker-build helm-load-images ## Build images, load into cluster, and deploy
	./helm/deploy.sh

helm-upgrade: ## Upgrade all Helm releases
	helm upgrade cncf-explorer-mongodb ./helm/mongodb --namespace cncf-explorer
	helm upgrade cncf-explorer-backend ./helm/backend --namespace cncf-explorer
	helm upgrade cncf-explorer-frontend ./helm/frontend --namespace cncf-explorer

helm-uninstall: ## Uninstall all Helm releases
	helm uninstall cncf-explorer-frontend --namespace cncf-explorer || true
	helm uninstall cncf-explorer-backend --namespace cncf-explorer || true
	helm uninstall cncf-explorer-mongodb --namespace cncf-explorer || true

helm-status: ## Show status of all Helm releases
	helm list --namespace cncf-explorer
