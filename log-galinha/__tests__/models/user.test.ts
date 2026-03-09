import { pool } from '../../src/lib/db';
import { createUser, getUserById, getUserByEmail, updateUser, deleteUser, loginUser, searchUsers, followUser, unfollowUser, getFollowing, getFollowers } from '../../src/models/user';
import { User } from '../../src/types/user';

describe('User Model Operations', () => { // Changed description to be more general
    // Dummy user objects for testing
    const testUser: Omit<User, 'id'> = {
        name: 'Test User',
        email: 'test@example.com',
        nickname: 'testuser',
        password: 'password123',
    };

    const anotherTestUser: Omit<User, 'id'> = {
        name: 'Another User',
        email: 'another@example.com',
        nickname: 'anotheruser',
        password: 'securepassword',
    };

    // Ensure necessary tables exist before running tests
    beforeAll(async () => {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                nickname VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL
            );
            CREATE TABLE IF NOT EXISTS user_follows (
                follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                PRIMARY KEY (follower_id, following_id)
            );
        `);
    });

    // Clean up tables after each test to ensure test isolation
    afterEach(async () => {
        await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE;');
        await pool.query('TRUNCATE TABLE user_follows RESTART IDENTITY CASCADE;');
    });

    // Close the database connection pool after all tests are done
    afterAll(async () => {
        await pool.end();
    });

    // --- CRUD Operations Tests ---

    describe('createUser', () => {
        it('should create a new user and return the created user with an ID', async () => {
            const newUser = await createUser(testUser);
            expect(newUser).toBeDefined();
            expect(newUser.id).toBeGreaterThan(0);
            expect(newUser.name).toBe(testUser.name);
            expect(newUser.email).toBe(testUser.email);
            expect(newUser.nickname).toBe(testUser.nickname);
            expect(newUser.password).toBe(testUser.password); // In a real app, we wouldn't assert on raw password

            // Verify the user can be fetched by ID
            const fetchedUser = await getUserById(newUser.id!);
            expect(fetchedUser).toEqual(newUser);
        });

        it('should throw an error if trying to create a user with a duplicate email', async () => {
            await createUser(testUser); // Create the first user
            await expect(createUser(testUser)).rejects.toThrow(); // Attempt to create with same email
        });

        it('should throw an error if trying to create a user with a duplicate nickname', async () => {
            await createUser(testUser); // Create the first user
            const userWithSameNickname = { ...anotherTestUser, email: 'unique@email.com', nickname: testUser.nickname };
            await expect(createUser(userWithSameNickname)).rejects.toThrow(); // Attempt to create with same nickname
        });
    });

    describe('getUserById', () => {
        it('should retrieve a user by their ID', async () => {
            const newUser = await createUser(testUser);
            const fetchedUser = await getUserById(newUser.id!);
            expect(fetchedUser).toEqual(newUser);
        });

        it('should return null if the user ID does not exist', async () => {
            const fetchedUser = await getUserById(99999); // A non-existent ID
            expect(fetchedUser).toBeNull();
        });
    });

    describe('getUserByEmail', () => {
        it('should retrieve a user by their email', async () => {
            const newUser = await createUser(testUser);
            const fetchedUser = await getUserByEmail(testUser.email);
            expect(fetchedUser).toEqual(newUser);
        });

        it('should return null if the user email does not exist', async () => {
            const fetchedUser = await getUserByEmail('nonexistent@example.com');
            expect(fetchedUser).toBeNull();
        });
    });

    describe('updateUser', () => {
        it('should update an existing user and return the updated user', async () => {
            const newUser = await createUser(testUser);
            const updates = { name: 'Updated Name', nickname: 'updateduser' };
            const updatedUser = await updateUser(newUser.id!, updates);

            expect(updatedUser).toBeDefined();
            expect(updatedUser!.id).toBe(newUser.id);
            expect(updatedUser!.name).toBe(updates.name);
            expect(updatedUser!.nickname).toBe(updates.nickname);
            expect(updatedUser!.email).toBe(newUser.email); // Email should not change via this method
            expect(updatedUser!.password).toBe(newUser.password); // Password should remain same if not updated

            // Verify the changes are persisted in the database
            const fetchedUser = await getUserById(newUser.id!);
            expect(fetchedUser).toEqual(updatedUser);
        });

        it('should return null if the user to update does not exist', async () => {
            const updates = { name: 'Nonexistent User' };
            const updatedUser = await updateUser(99999, updates);
            expect(updatedUser).toBeNull();
        });

        it('should not update email or ID fields even if provided in updates', async () => {
            const newUser = await createUser(testUser);
            const updates = { email: 'new@example.com', id: 100, name: 'Still Same Name' }; // These should be ignored for update logic
            const updatedUser = await updateUser(newUser.id!, updates);

            expect(updatedUser).toBeDefined();
            expect(updatedUser!.id).toBe(newUser.id); // ID should not change
            expect(updatedUser!.email).toBe(newUser.email); // Email should not change
            expect(updatedUser!.name).toBe(updates.name); // Other fields should change
        });

        it('should return the original user if no valid fields are provided for update', async () => {
            const newUser = await createUser(testUser);
            const updates = { }; // Empty updates
            const updatedUser = await updateUser(newUser.id!, updates);

            expect(updatedUser).toEqual(newUser);
        });
    });

    describe('deleteUser', () => {
        it('should delete an existing user and return true', async () => {
            const newUser = await createUser(testUser);
            const isDeleted = await deleteUser(newUser.id!);
            expect(isDeleted).toBe(true);

            // Verify the user is no longer in the database
            const fetchedUser = await getUserById(newUser.id!);
            expect(fetchedUser).toBeNull();
        });

        it('should return false if the user to delete does not exist', async () => {
            const isDeleted = await deleteUser(99999);
            expect(isDeleted).toBe(false);
        });
    });

    describe('loginUser', () => {
        const loginTestUser: Omit<User, 'id'> = {
            name: 'Login User',
            email: 'login@example.com',
            nickname: 'loginuser',
            password: 'loginPassword123',
        };

        it('should authenticate a user with correct credentials and return a token', async () => {
            await createUser(loginTestUser);
            const token = await loginUser(loginTestUser.email, loginTestUser.password);

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token!.length).toBeGreaterThan(0);
        });

        it('should return null for incorrect password', async () => {
            await createUser(loginTestUser);
            const token = await loginUser(loginTestUser.email, 'wrongPassword');

            expect(token).toBeNull();
        });

        it('should return null for non-existent email', async () => {
            const token = await loginUser('nonexistent@example.com', 'anypassword');
            expect(token).toBeNull();
        });
    });

    describe('searchUsers', () => {
        const user1: Omit<User, 'id'> = { name: 'Alice Smith', email: 'alice@example.com', nickname: 'ali_s', password: 'passA' };
        const user2: Omit<User, 'id'> = { name: 'Bob Johnson', email: 'bob@example.com', nickname: 'b_j', password: 'passB' };
        const user3: Omit<User, 'id'> = { name: 'Charlie Brown', email: 'charlie@test.com', nickname: 'charles', password: 'passC' };
        const user4: Omit<User, 'id'> = { name: 'David Smith', email: 'david@domain.com', nickname: 'dsmith', password: 'passD' };

        beforeEach(async () => {
            await createUser(user1);
            await createUser(user2);
            await createUser(user3);
            await createUser(user4);
        });

        it('should find users by partial name match', async () => {
            const results = await searchUsers('smith');
            expect(results).toHaveLength(2);
            expect(results.some(u => u.email === user1.email)).toBe(true);
            expect(results.some(u => u.email === user4.email)).toBe(true);
        });

        it('should find users by partial email match', async () => {
            const results = await searchUsers('example.com');
            expect(results).toHaveLength(2);
            expect(results.some(u => u.email === user1.email)).toBe(true);
            expect(results.some(u => u.email === user2.email)).toBe(true);
        });

        it('should find users by partial nickname match', async () => {
            const results = await searchUsers('ali');
            expect(results).toHaveLength(1);
            expect(results[0].email).toBe(user1.email);
        });

        it('should return an empty array if no users match the search term', async () => {
            const results = await searchUsers('nonexistent');
            expect(results).toHaveLength(0);
        });

        it('should be case-insensitive', async () => {
            const results = await searchUsers('alice');
            expect(results).toHaveLength(1);
            expect(results[0].email).toBe(user1.email);

            const results2 = await searchUsers('BOB');
            expect(results2).toHaveLength(1);
            expect(results2[0].email).toBe(user2.email);
        });

        it('should return all relevant user fields except password', async () => {
            const results = await searchUsers('alice');
            expect(results).toHaveLength(1);
            const foundUser = results[0];
            expect(foundUser).toHaveProperty('id');
            expect(foundUser.name).toBe(user1.name);
            expect(foundUser.email).toBe(user1.email);
            expect(foundUser.nickname).toBe(user1.nickname);
            expect(foundUser).not.toHaveProperty('password'); // Password should not be returned
        });

        it('should return a user if term matches across multiple fields', async () => {
            // "test" matches charlie@test.com and Charlie Brown
            const results = await searchUsers('test');
            expect(results).toHaveLength(1);
            expect(results[0].email).toBe(user3.email);
        });
    });

    // --- User Following Operations Tests ---
    describe('User Following Operations', () => {
        let userA: User;
        let userB: User;
        let userC: User;

        beforeEach(async () => {
            userA = await createUser({ name: 'User Alpha', email: 'alpha@example.com', nickname: 'alpha', password: 'passA' });
            userB = await createUser({ name: 'User Beta', email: 'beta@example.com', nickname: 'beta', password: 'passB' });
            userC = await createUser({ name: 'User Gamma', email: 'gamma@example.com', nickname: 'gamma', password: 'passC' });
        });

        describe('followUser', () => {
            it('should allow a user to follow another user', async () => {
                const result = await followUser(userA.id!, userB.id!);
                expect(result).toBe(true);

                const following = await getFollowing(userA.id!);
                expect(following).toHaveLength(1);
                expect(following[0].id).toBe(userB.id);

                const followers = await getFollowers(userB.id!);
                expect(followers).toHaveLength(1);
                expect(followers[0].id).toBe(userA.id);
            });

            it('should not allow a user to follow themselves', async () => {
                await expect(followUser(userA.id!, userA.id!)).rejects.toThrow();
            });

            it('should not allow duplicate follows', async () => {
                await followUser(userA.id!, userB.id!);
                await expect(followUser(userA.id!, userB.id!)).rejects.toThrow();
            });

            it('should return false if follower or following user does not exist', async () => {
                await expect(followUser(99999, userB.id!)).rejects.toThrow(); // Non-existent follower
                await expect(followUser(userA.id!, 88888)).rejects.toThrow(); // Non-existent following
            });
        });

        describe('unfollowUser', () => {
            it('should allow a user to unfollow another user', async () => {
                await followUser(userA.id!, userB.id!);
                const result = await unfollowUser(userA.id!, userB.id!);
                expect(result).toBe(true);

                const following = await getFollowing(userA.id!);
                expect(following).toHaveLength(0);

                const followers = await getFollowers(userB.id!);
                expect(followers).toHaveLength(0);
            });

            it('should return false if no follow relationship exists', async () => {
                const result = await unfollowUser(userA.id!, userB.id!); // No prior follow
                expect(result).toBe(false);
            });
        });

        describe('getFollowing', () => {
            it('should return a list of users that a given user is following', async () => {
                await followUser(userA.id!, userB.id!);
                await followUser(userA.id!, userC.id!);

                const following = await getFollowing(userA.id!);
                expect(following).toHaveLength(2);
                expect(following.some(u => u.id === userB.id)).toBe(true);
                expect(following.some(u => u.id === userC.id)).toBe(true);
                // Ensure passwords are not returned
                expect(following[0]).not.toHaveProperty('password');
            });

            it('should return an empty array if the user is not following anyone', async () => {
                const following = await getFollowing(userA.id!);
                expect(following).toHaveLength(0);
            });
        });

        describe('getFollowers', () => {
            it('should return a list of users who are following a given user', async () => {
                await followUser(userA.id!, userC.id!);
                await followUser(userB.id!, userC.id!);

                const followers = await getFollowers(userC.id!);
                expect(followers).toHaveLength(2);
                expect(followers.some(u => u.id === userA.id)).toBe(true);
                expect(followers.some(u => u.id === userB.id)).toBe(true);
                // Ensure passwords are not returned
                expect(followers[0]).not.toHaveProperty('password');
            });

            it('should return an empty array if no one is following the user', async () => {
                const followers = await getFollowers(userA.id!);
                expect(followers).toHaveLength(0);
            });
        });
    });
});
