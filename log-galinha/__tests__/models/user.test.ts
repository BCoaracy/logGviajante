import { pool } from '../../src/lib/db';
import { createUser, getUserById, getUserByEmail, getUserByKeycloakId, inactivateUser, deleteUser, searchUsers, followUser, unfollowUser, getFollowing, getFollowers } from '../../src/models/user';
import { User } from '../../src/types/user';

describe('User Model Operations with Keycloak', () => { 
    const testUser: Omit<User, 'id'> = {
        keycloak_id: 'kc-test-uuid',
        name: 'Test User',
        email: 'test@example.com',
        nickname: 'testuser',
        status: 'active'
    };

    beforeAll(async () => {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                keycloak_id VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                nickname VARCHAR(255) UNIQUE NOT NULL,
                status VARCHAR(50) DEFAULT 'active'
            );
            CREATE TABLE IF NOT EXISTS user_follows (
                follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                PRIMARY KEY (follower_id, following_id)
            );
        `);
    });

    afterEach(async () => {
        await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE;');
        await pool.query('TRUNCATE TABLE user_follows RESTART IDENTITY CASCADE;');
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('createUser', () => {
        it('should create a new user tied to a Keycloak ID', async () => {
            const newUser = await createUser(testUser);
            expect(newUser.id).toBeGreaterThan(0);
            expect(newUser.keycloak_id).toBe(testUser.keycloak_id);
            expect(newUser.email).toBe(testUser.email);
            expect(newUser.status).toBe('active');
        });

        it('should throw an error if keycloak_id is duplicate', async () => {
            await createUser(testUser);
            await expect(createUser({ ...testUser, email: 'x@x.com', nickname: 'x' })).rejects.toThrow();
        });
    });

    describe('inactivateUser (Update Status)', () => {
        it('should update user status to inactive via keycloak_id', async () => {
            await createUser(testUser);
            const inact = await inactivateUser('kc-test-uuid');
            expect(inact).toBeDefined();
            expect(inact!.status).toBe('inactive');
        });
    });

    describe('getUserByKeycloakId', () => {
        it('should retrieve matching user', async () => {
             await createUser(testUser);
             const user = await getUserByKeycloakId('kc-test-uuid');
             expect(user!.email).toBe(testUser.email);
        });
    });

    describe('deleteUser', () => {
        it('should hard delete an existing user based on keycloak id string and return true', async () => {
            await createUser(testUser);
            const isDeleted = await deleteUser('kc-test-uuid');
            expect(isDeleted).toBe(true);

            const fetchedUser = await getUserByKeycloakId('kc-test-uuid');
            expect(fetchedUser).toBeNull();
        });
    });

    // --- Social Tests preserverd ---
    describe('Social Operations', () => {
        let userA: User;
        let userB: User;

        beforeEach(async () => {
            userA = await createUser({ keycloak_id: 'a', name: 'User Alpha', email: 'alpha@example.com', nickname: 'alpha', status: 'active' });
            userB = await createUser({ keycloak_id: 'b', name: 'User Beta', email: 'beta@example.com', nickname: 'beta', status: 'active' });
        });

        it('should allow a user to follow another user', async () => {
            const result = await followUser(userA.id!, userB.id!);
            expect(result).toBe(true);

            const following = await getFollowing(userA.id!);
            expect(following).toHaveLength(1);
            expect(following[0].id).toBe(userB.id);
        });
    });
});
