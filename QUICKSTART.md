# Quick Start Guide

Get up and running with CNCF Explorer in 5 minutes!

## Prerequisites Check

- ✅ Node.js 18+ installed
- ✅ Docker installed (for MongoDB) OR MongoDB running locally
- ✅ npm or yarn package manager

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# Option A: Use the setup script
./scripts/setup.sh

# Option B: Manual installation
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Start MongoDB

```bash
# Option A: Using Docker (Recommended)
docker-compose up -d

# Option B: Using local MongoDB
# Ensure MongoDB is running on localhost:27017
```

### 3. Configure Backend

```bash
cd backend
cp .env.example .env
# Edit .env if needed (defaults should work)
```

### 4. Initialize Database (Optional)

```bash
# Initialize indexes
node ../scripts/init-db.js

# Seed sample enterprise solutions (optional)
node ../scripts/seed-sample-data.js
```

### 5. Start Backend

```bash
cd backend
npm run start:dev
```

Backend will be available at `http://localhost:3000`

### 6. Start Frontend (New Terminal)

```bash
cd frontend
npm start
```

Frontend will be available at `http://localhost:4200`

### 7. Sync CNCF Landscape Data

1. Open `http://localhost:4200` in your browser
2. Click the **"Sync CNCF Landscape"** button
3. Wait for the sync to complete (may take 1-2 minutes)
4. Projects will appear in the list

## Using Make Commands (Alternative)

If you have `make` installed:

```bash
make setup          # Full setup
make start-mongo    # Start MongoDB
make dev-backend    # Start backend
make dev-frontend   # Start frontend
make init-db        # Initialize database
make seed-db        # Seed sample data
```

## Troubleshooting

### MongoDB Connection Error

```bash
# Check if MongoDB is running
docker ps  # If using Docker
# OR
mongosh  # If using local MongoDB

# Verify connection string in backend/.env
```

### Port Already in Use

```bash
# Backend (default: 3000)
# Change PORT in backend/.env

# Frontend (default: 4200)
# Use: npm start -- --port 4201
```

### CORS Errors

- Ensure backend is running on port 3000
- Check that CORS is enabled in `backend/src/main.ts`
- Verify frontend is making requests to `http://localhost:3000`

## Next Steps

- Explore projects using filters
- Add enterprise solutions for different categories
- Customize the UI and add more features
- Deploy to Kubernetes (future enhancement)

## API Testing

Test the API directly:

```bash
# Get all projects
curl http://localhost:3000/api/projects

# Get projects by category
curl http://localhost:3000/api/projects?category=Observability

# Get projects by maturity
curl http://localhost:3000/api/projects?maturityLevel=Graduated

# Sync landscape
curl -X POST http://localhost:3000/api/landscape/sync
```

Happy exploring! 🚀

