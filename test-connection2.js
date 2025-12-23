const { Pool } = require('pg');

console.log('Testing with test user...');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'eloar',
  user: 'eloar_test',
  password: 'test123',
});

async function testConnection() {
  try {
    console.log('Attempting to connect...');
    const client = await pool.connect();
    console.log('✓ Connection successful!');

    const result = await client.query('SELECT COUNT(*) FROM grade_levels');
    console.log('✓ Query successful! Grade levels count:', result.rows[0].count);

    client.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ Connection failed!');
    console.error('Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

testConnection();
