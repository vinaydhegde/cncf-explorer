// Sample data seeding script
// This script seeds the database with sample enterprise solutions

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cncf-explorer';

const sampleEnterpriseSolutions = [
  {
    category: 'Observability',
    name: 'Elastic Observability',
    description: 'Elastic distribution of OpenTelemetry (EDOT) for comprehensive observability',
    websiteUrl: 'https://www.elastic.co/observability',
    cncfProjectUsed: 'OpenTelemetry',
    additionalInfo: 'Provides distributed tracing, APM, and log analytics using OpenTelemetry standards'
  },
  {
    category: 'Observability',
    name: 'Azure Monitor',
    description: 'Microsoft Azure monitoring solution using OpenTelemetry',
    websiteUrl: 'https://azure.microsoft.com/en-us/services/monitor/',
    cncfProjectUsed: 'OpenTelemetry',
    additionalInfo: 'Azure-native monitoring with OpenTelemetry integration for cloud-native applications'
  },
  {
    category: 'Observability',
    name: 'Datadog',
    description: 'Cloud monitoring and security platform with OpenTelemetry support',
    websiteUrl: 'https://www.datadoghq.com/',
    cncfProjectUsed: 'OpenTelemetry',
    additionalInfo: 'Full-stack observability platform supporting OpenTelemetry instrumentation'
  }
];

async function seedDatabase() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('cncf-explorer');
    const collection = db.collection('enterprisesolutions');

    // Insert sample data
    const result = await collection.insertMany(sampleEnterpriseSolutions);
    console.log(`Inserted ${result.insertedCount} sample enterprise solutions`);

    console.log('Database seeding completed successfully');
  } catch (error) {
    if (error.code === 11000) {
      console.log('Sample data already exists, skipping seed');
    } else {
      console.error('Error seeding database:', error);
      process.exit(1);
    }
  } finally {
    await client.close();
  }
}

seedDatabase();

