import { pool } from '../lib/db';
import { User } from '../types/user';

export async function createUser(user: Omit<User, 'id'>): Promise<User> {
    const query = `
        INSERT INTO users (name, email, nickname, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, nickname, password;
    `;
    const values = [user.name, user.email, user.nickname, user.password];
    const { rows } = await pool.query<User>(query, values);
    return rows[0];
}

export async function getUserById(id: number): Promise<User | null> {
    const query = 'SELECT id, name, email, nickname, password FROM users WHERE id = $1;';
    const { rows } = await pool.query<User>(query, [id]);
    return rows.length ? rows[0] : null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const query = 'SELECT id, name, email, nickname, password FROM users WHERE email = $1;';
    const { rows } = await pool.query<User>(query, [email]);
    return rows.length ? rows[0] : null;
}

export async function updateUser(id: number, updates: Partial<Omit<User, 'id' | 'email'>>): Promise<User | null> {
    const fields: string[] = [];
    const values: (string | number)[] = [];
    let paramIndex = 1;

    for (const key in updates) {
        if (Object.prototype.hasOwnProperty.call(updates, key)) {
            // Do not allow updating email or id directly via this method
            if (key !== 'email' && key !== 'id') {
                fields.push(`${key} = $${paramIndex++}`);
                values.push((updates as any)[key]);
            }
        }
    }

    if (fields.length === 0) {
        // No fields to update, just return the existing user
        return getUserById(id);
    }

    values.push(id); // The last parameter is the ID for the WHERE clause
    const query = `
        UPDATE users
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, name, email, nickname, password;
    `;
    const { rows } = await pool.query<User>(query, values);
    return rows.length ? rows[0] : null;
}

export async function deleteUser(id: number): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id;';
    const { rows } = await pool.query(query, [id]);
    return rows.length > 0;
}

export async function loginUser(email: string, password: string): Promise<string | null> {
    const user = await getUserByEmail(email);

    if (!user) {
        return null; // User not found
    }

    // In a real application, you would compare hashed passwords (e.g., using bcrypt)
    // For now, a direct comparison is used for simplicity.
    if (user.password !== password) {
        return null; // Incorrect password
    }

    // In a real application, a JWT (JSON Web Token) would be generated here.
    // For demonstration, a simple token string is returned.
    const token = `dummy-jwt-token-for-user-${user.id}`;
    return token;
}
