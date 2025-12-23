const { Pool } = require('pg');
const { Client } = require('pg');
require('dotenv').config();

console.log('Testing PostgreSQL connection with detailed debugging...');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'eloar',
  user: process.env.DB_USER || 'eloar_user',
  password: process.env.DB_PASSWORD,
};

console.log('\nConnection config:');
console.log('Host:', config.host);
console.log('Port:', config.port);
console.log('Database:', config.database);
console.log('User:', config.user);
console.log('Password length:', config.password ? config.password.length : 0);
console.log('Password:', config.password); // Show full password for debugging

async function testConnection() {
  const client = new Client(config);

  try {
    console.log('\nAttempting to connect...');
    await client.connect();
    console.log('✓ Connection successful!');

    const result = await client.query('SELECT version()');
    console.log('✓ Query successful!');
    console.log('PostgreSQL version:', result.rows[0].version);

    const gradeResult = await client.query('SELECT COUNT(*) FROM grade_levels');
    console.log('✓ Grade levels count:', gradeResult.rows[0].count);

    await client.end();
    console.log('✓ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Connection failed!');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    await client.end().catch(() => {});
    process.exit(1);
  }
}

testConnection();
