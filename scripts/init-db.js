// MongoDB initialization script
// This script can be run to initialize the database with sample data or indexes

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cncf-explorer';

async function initDatabase() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('cncf-explorer');

    // Create indexes for better performance
    const projectsCollection = db.collection('projects');
    await projectsCollection.createIndex({ category: 1 });
    await projectsCollection.createIndex({ maturityLevel: 1 });
    await projectsCollection.createIndex({ name: 1 });
    console.log('Created indexes on projects collection');

    const enterpriseSolutionsCollection = db.collection('enterprisesolutions');
    await enterpriseSolutionsCollection.createIndex({ category: 1 });
    await enterpriseSolutionsCollection.createIndex({ name: 1 });
    console.log('Created indexes on enterprise solutions collection');

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

initDatabase();

