import { Pool } from "pg";


const globalForPg = global as unknown as { pgPool: Pool};

export const pool = 
    globalForPg.pgPool ||
    new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

if (process.env.NODE_ENV !== 'production') {
    globalForPg.pgPool = pool;
};

export const query = async (text: string, params?: any[]) => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`Executed query: { query: '${text}', duration: ${duration}ms, rows: ${res.rowCount} }`);
    return res;
}
