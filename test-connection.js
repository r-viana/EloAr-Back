const { Pool } = require('pg');
require('dotenv').config();

console.log('Testing PostgreSQL connection...');
console.log('Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-4) : 'undefined');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'eloar',
  user: process.env.DB_USER || 'eloar_user',
  password: process.env.DB_PASSWORD,
});

async function testConnection() {
  try {
    console.log('\nAttempting to connect...');
    const client = await pool.connect();
    console.log('✓ Connection successful!');

    const result = await client.query('SELECT COUNT(*) FROM grade_levels');
    console.log('✓ Query successful! Grade levels count:', result.rows[0].count);

    client.release();
    await pool.end();
    console.log('✓ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('✗ Connection failed!');
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
    await pool.end();
    process.exit(1);
  }
}

testConnection();
