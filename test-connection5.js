const { Client } = require('pg');

console.log('Testing with test_user...\n');

async function test() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    database: 'eloar',
    user: 'test_user',
    password: 'test123',
  });

  try {
    console.log('Connecting...');
    await client.connect();
    console.log('✓ SUCCESS!');

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
