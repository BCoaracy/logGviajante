import { query, pool } from '../../src/lib/db';

describe('PostgreSQL Connection', () => {
  test('should successfully connect to the database and run a simple query', async () => {
    const result = await query('SELECT 1 AS connected');
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.rows[0].connected).toBe(1);
  });

  afterAll(async () => {
    await pool.end();
  });
});
