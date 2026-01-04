# CNCF Explorer

A web application for exploring CNCF (Cloud Native Computing Foundation) projects with health snapshots and enterprise solution tracking.

## 🐳 Docker & Kubernetes Ready

This application is fully containerized and ready for Kubernetes deployment:
- **Docker Images**: Pre-configured Dockerfiles for backend and frontend
- **Helm Charts**: Complete Helm charts for all services (frontend, backend, MongoDB StatefulSet)
- **Production Ready**: Includes health checks, resource limits, and scaling configurations

### Quick Deploy with Local Images

```bash
# Build images and deploy (uses imagePullPolicy: Never for local dev)
make helm-deploy-local

# Or manually:
./docker-build.sh
./helm/load-local-images.sh  # For kind/minikube
./helm/deploy.sh
```

**Note**: The deploy script uses `imagePullPolicy: Never` by default for local development. For production, push images to a registry and update `values.yaml` files.

See [KUBERNETES_DEPLOYMENT.md](./KUBERNETES_DEPLOYMENT.md) for deployment instructions and [LOCAL_IMAGES.md](./LOCAL_IMAGES.md) for using local Docker images.

## Features

- **CNCF Landscape Integration**: Fetches and syncs CNCF landscape data from the official repository
- **Project Exploration**: Browse CNCF projects with filtering by:
  - Maturity level (Sandbox, Incubating, Graduated)
  - Category
- **Project Information**: View project details including:
  - Project name
  - Category
  - CNCF maturity level
  - GitHub stars
  - Last updated time
  - Homepage and repository links
- **Enterprise Solutions Management**: Add and manage enterprise solutions that use CNCF projects
  - Track which CNCF projects are used by enterprise solutions
  - Add descriptions, website URLs, and additional information
  - Full CRUD operations (no authentication required for demo purposes)

## Tech Stack

- **Backend**: NestJS (Node.js framework)
- **Database**: MongoDB
- **Frontend**: Angular 17 (standalone components)
- **Containerization**: Docker Compose for MongoDB

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local installation or Docker)
- Angular CLI (optional, can use npm scripts)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install root dependencies (if using workspaces)
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Start MongoDB

#### Option A: Using Docker Compose (Recommended)

```bash
# From project root
docker-compose up -d
```

This will start MongoDB on `localhost:27017`.

#### Option B: Local MongoDB Installation

Ensure MongoDB is running locally on the default port `27017`.

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
# Option 1: Copy from template (if .env.example exists)
cp .env.example .env

# Option 2: Copy from env.template
cp env.template .env

# Option 3: Create manually with these values:
# PORT=3000
# MONGODB_URI=mongodb://localhost:27017/cncf-explorer
```

The setup script (`./scripts/setup.sh`) will automatically create the `.env` file if it doesn't exist.

### 4. Initialize Database (Optional)

```bash
# Install mongodb package for scripts (if not already installed)
npm install mongodb --save-dev

# Run initialization script
node ../scripts/init-db.js

# Optionally seed with sample enterprise solutions
node ../scripts/seed-sample-data.js
```

### 5. Start the Backend

```bash
cd backend
npm run start:dev
```

The backend API will be available at `http://localhost:3000`

### 6. Start the Frontend

In a new terminal:

```bash
cd frontend
npm start
```

The frontend will be available at `http://localhost:4200`

## Usage

### Syncing CNCF Landscape Data

1. Open the application in your browser (`http://localhost:4200`)
2. Click the "Sync CNCF Landscape" button
3. Wait for the sync to complete (this may take a few minutes depending on network speed)
4. Projects will be loaded and displayed

### Filtering Projects

- Use the "Maturity Level" dropdown to filter by Sandbox, Incubating, or Graduated
- Use the "Category" dropdown to filter by project category
- Click "Apply Filters" to apply your selections
- Click "Clear" to reset all filters

### Managing Enterprise Solutions

1. Click "Add Enterprise Solution" to add a new solution
2. Fill in the required fields (Category and Name)
3. Optionally add:
   - CNCF Project Used (e.g., "OpenTelemetry")
   - Description
   - Website URL
   - Additional Information
4. Click "Save" to add the solution
5. Use "Edit" or "Delete" buttons to manage existing solutions

## API Endpoints

### Projects

- `GET /api/projects` - Get all projects (with optional query params: `maturityLevel`, `category`)
- `GET /api/projects/categories` - Get all unique categories
- `GET /api/projects/maturity-levels` - Get all unique maturity levels
- `GET /api/projects/:id` - Get a specific project
- `POST /api/projects` - Create a new project
- `PATCH /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

### Enterprise Solutions

- `GET /api/enterprise-solutions` - Get all solutions (with optional query param: `category`)
- `GET /api/enterprise-solutions/:id` - Get a specific solution
- `POST /api/enterprise-solutions` - Create a new solution
- `PATCH /api/enterprise-solutions/:id` - Update a solution
- `DELETE /api/enterprise-solutions/:id` - Delete a solution

### Landscape

- `POST /api/landscape/sync` - Sync CNCF landscape data to database
- `GET /api/landscape/fetch` - Fetch landscape data (without saving)

## Project Structure

```
cncf-explorer/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── projects/       # Projects module
│   │   ├── enterprise-solutions/  # Enterprise solutions module
│   │   ├── landscape/      # Landscape sync module
│   │   └── app.module.ts
│   └── package.json
├── frontend/               # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── projects/   # Projects component
│   │   │   ├── models/     # TypeScript models
│   │   │   └── services/   # API services
│   │   └── styles.css
│   └── package.json
├── scripts/                # Database scripts
│   ├── init-db.js         # Initialize database indexes
│   └── seed-sample-data.js # Seed sample data
├── docker-compose.yml      # MongoDB Docker setup
└── README.md
```

## Development

### Backend Development

```bash
cd backend
npm run start:dev  # Watch mode
npm run build      # Build for production
npm run test       # Run tests
```

### Frontend Development

```bash
cd frontend
npm start          # Development server
npm run build      # Build for production
npm test           # Run tests
```

## Future Enhancements

This is a demonstration project for DevOps/SRE homelab setup. Planned future features:

- Kubernetes deployment manifests
- CI/CD pipeline configuration
- Enhanced health signals and metrics
- Project health scoring
- GitHub integration for real-time star counts
- Advanced filtering and search
- Project comparison features
- Export/import functionality

## Notes

- The CNCF landscape data is fetched from the official GitHub repository
- GitHub stars are not automatically fetched (would require GitHub API integration)
- No authentication is implemented as this is for demonstration purposes
- MongoDB is configured for local development; Kubernetes StatefulSet configuration will be added later

## Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running: `docker ps` (if using Docker) or check MongoDB service
- Verify connection string in `.env` file
- Check MongoDB logs for errors

### CORS Issues

- Ensure backend CORS is configured for `http://localhost:4200`
- Check browser console for CORS errors

### Landscape Sync Fails

- Check internet connection
- Verify CNCF landscape repository is accessible
- Check backend logs for detailed error messages

## License

MIT

## Contributing

This is a personal project for demonstration purposes. Feel free to fork and modify for your own use.

