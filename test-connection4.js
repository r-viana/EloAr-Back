const { Client } = require('pg');

console.log('Testing with 127.0.0.1 instead of localhost...\n');

const config = {
  host: '127.0.0.1',
  port: 5432,
  database: 'eloar',
  user: 'eloar_user',
  password: 'eloar123',
};

async function test() {
  const client = new Client(config);
  try {
    console.log('Connecting to 127.0.0.1:5432...');
    await client.connect();
    console.log('✓ SUCCESS! Connection works with 127.0.0.1');

    const result = await client.query('SELECT COUNT(*) FROM grade_levels');
    console.log('✓ Grade levels:', result.rows[0].count);

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ FAILED:', error.message);
    await client.end().catch(() => {});
    process.exit(1);
  }
}

test();
