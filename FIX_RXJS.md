# Quick Fix Commands

Run these commands in order to fix the RxJS type errors:

```bash
# 1. Navigate to project root
cd /Users/vinay/Dev/git-repos/cncf-explorer

# 2. Remove root node_modules (if exists)
rm -rf node_modules package-lock.json

# 3. Clean frontend dependencies
cd frontend
rm -rf node_modules package-lock.json .angular

# 4. Reinstall frontend dependencies
npm install

# 5. Go back to root and install backend dependencies (if not done)
cd ../backend
npm install

# 6. Start MongoDB (if not running)
cd ..
docker-compose up -d

# 7. Start backend (in one terminal)
cd backend
npm run start:dev

# 8. Start frontend (in another terminal)
cd frontend
npm start
```

