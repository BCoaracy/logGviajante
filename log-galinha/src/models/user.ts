import { pool } from '../lib/db';
import { User } from '../types/user';

export async function createUser(user: Omit<User, 'id'>): Promise<User> {
    const query = `
        INSERT INTO users (keycloak_id, name, email, nickname, status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, keycloak_id, name, email, nickname, status;
    `;
    const values = [user.keycloak_id, user.name, user.email, user.nickname, user.status || 'active'];
    const { rows } = await pool.query<User>(query, values);
    return rows[0];
}

export async function getUserById(id: number): Promise<User | null> {
    const query = 'SELECT id, keycloak_id, name, email, nickname, status FROM users WHERE id = $1;';
    const { rows } = await pool.query<User>(query, [id]);
    return rows.length ? rows[0] : null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const query = 'SELECT id, keycloak_id, name, email, nickname, status FROM users WHERE email = $1;';
    const { rows } = await pool.query<User>(query, [email]);
    return rows.length ? rows[0] : null;
}

export async function getUserByKeycloakId(keycloakId: string): Promise<User | null> {
    const query = 'SELECT id, keycloak_id, name, email, nickname, status FROM users WHERE keycloak_id = $1;';
    const { rows } = await pool.query<User>(query, [keycloakId]);
    return rows.length ? rows[0] : null;
}

export async function inactivateUser(keycloakId: string): Promise<User | null> {
    const query = `
        UPDATE users
        SET status = 'inactive'
        WHERE keycloak_id = $1
        RETURNING id, keycloak_id, name, email, nickname, status;
    `;
    const { rows } = await pool.query<User>(query, [keycloakId]);
    return rows.length ? rows[0] : null;
}

export async function deleteUser(keycloakId: string): Promise<boolean> {
    // Delete by Keycloak ID directly to sync Identity removal
    const query = 'DELETE FROM users WHERE keycloak_id = $1 RETURNING id;';
    const { rows } = await pool.query(query, [keycloakId]);
    return rows.length > 0;
}

export async function searchUsers(searchTerm: string): Promise<User[]> {
    const query = `
        SELECT id, keycloak_id, name, email, nickname, status
        FROM users
        WHERE
            name ILIKE $1 OR
            email ILIKE $1 OR
            nickname ILIKE $1;
    `;
    const values = [`%${searchTerm}%`];
    const { rows } = await pool.query<User>(query, values);
    return rows;
}

export async function followUser(followerId: number, followingId: number): Promise<boolean> {
    if (followerId === followingId) throw new Error("A user cannot follow themselves.");
    const query = `
        INSERT INTO user_follows (follower_id, following_id)
        VALUES ($1, $2)
        ON CONFLICT (follower_id, following_id) DO NOTHING
        RETURNING follower_id;
    `;
    const { rows } = await pool.query(query, [followerId, followingId]);
    return rows.length > 0;
}

export async function unfollowUser(followerId: number, followingId: number): Promise<boolean> {
    const query = `
        DELETE FROM user_follows
        WHERE follower_id = $1 AND following_id = $2
        RETURNING follower_id;
    `;
    const { rows } = await pool.query(query, [followerId, followingId]);
    return rows.length > 0;
}

export async function getFollowing(userId: number): Promise<User[]> {
    const query = `
        SELECT u.id, u.keycloak_id, u.name, u.email, u.nickname, u.status
        FROM users u
        JOIN user_follows uf ON u.id = uf.following_id
        WHERE uf.follower_id = $1;
    `;
    const { rows } = await pool.query<User>(query, [userId]);
    return rows;
}

export async function getFollowers(userId: number): Promise<User[]> {
    const query = `
        SELECT u.id, u.keycloak_id, u.name, u.email, u.nickname, u.status
        FROM users u
        JOIN user_follows uf ON u.id = uf.follower_id
        WHERE uf.following_id = $1;
    `;
    const { rows } = await pool.query<User>(query, [userId]);
    return rows;
}
