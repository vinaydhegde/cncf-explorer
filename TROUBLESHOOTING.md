# Troubleshooting Guide

## RxJS Type Errors

If you see errors like:
```
Type 'import("/path/to/node_modules/rxjs/...").Observable<...>' is not assignable to type 'import("/path/to/frontend/node_modules/rxjs/...").Observable<...>'
```

This is caused by npm workspaces hoisting dependencies. To fix:

1. **Remove root node_modules** (if using workspaces):
   ```bash
   rm -rf node_modules package-lock.json
   ```

2. **Clean frontend dependencies**:
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json .angular
   ```

3. **Reinstall frontend dependencies**:
   ```bash
   npm install
   ```

4. **Restart the dev server**:
   ```bash
   npm start
   ```

## MongoDB Connection Issues

### Check MongoDB is Running

```bash
# If using Docker
docker ps | grep mongodb

# If using local MongoDB
mongosh --eval "db.version()"
```

### Verify Connection String

Check `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017/cncf-explorer
```

### Common Issues

- **Port 27017 in use**: Change MongoDB port or update connection string
- **MongoDB not started**: Run `docker-compose up -d` or start MongoDB service
- **Wrong host**: If MongoDB is on a different host, update `MONGODB_URI`

## Port Already in Use

### Backend (Port 3000)

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in backend/.env
PORT=3001
```

### Frontend (Port 4200)

```bash
# Find process using port 4200
lsof -i :4200

# Kill the process
kill -9 <PID>

# Or use different port
cd frontend
npm start -- --port 4201
```

## CORS Errors

If you see CORS errors in the browser console:

1. **Verify backend is running** on `http://localhost:3000`
2. **Check CORS configuration** in `backend/src/main.ts`
3. **Verify frontend API URL** in `frontend/src/app/services/*.service.ts`:
   ```typescript
   private apiUrl = 'http://localhost:3000/api';
   ```

## CNCF Landscape Sync Fails

### Network Issues

- Check internet connection
- Verify GitHub is accessible: `curl https://github.com`
- Check if behind a proxy/firewall

### Rate Limiting

If you see rate limit errors:
- Wait a few minutes and try again
- The sync may take 1-2 minutes for large datasets

### Data Structure Issues

If projects aren't loading correctly:
- The CNCF landscape structure may have changed
- Check `backend/src/landscape/landscape.service.ts` parsing logic
- Review backend logs for specific errors

## Angular Build Errors

### TypeScript Errors

```bash
# Clean and rebuild
cd frontend
rm -rf node_modules .angular dist
npm install
npm run build
```

### Missing Dependencies

```bash
cd frontend
npm install --legacy-peer-deps
```

## NestJS Build Errors

### TypeScript Errors

```bash
cd backend
rm -rf node_modules dist
npm install
npm run build
```

### Missing Dependencies

```bash
cd backend
npm install --legacy-peer-deps
```

## Database Issues

### Reset Database

```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/cncf-explorer

# Drop collections
db.projects.drop()
db.enterprisesolutions.drop()

# Reinitialize
node scripts/init-db.js
```

### Index Creation Fails

```bash
# Manually create indexes
mongosh mongodb://localhost:27017/cncf-explorer --eval "
  db.projects.createIndex({ category: 1 });
  db.projects.createIndex({ maturityLevel: 1 });
  db.projects.createIndex({ name: 1 });
  db.enterprisesolutions.createIndex({ category: 1 });
  db.enterprisesolutions.createIndex({ name: 1 });
"
```

## Still Having Issues?

1. **Check logs**: Review backend and frontend console output
2. **Verify versions**: Ensure Node.js 18+ is installed
3. **Clean install**: Remove all `node_modules` and reinstall
4. **Check file permissions**: Ensure you have read/write access

For more help, check the main README.md file.

