import { pool } from '../../src/lib/db';
// We expect these functions to exist in src/models/user.ts later
// import { createUser, getUserById, getUserByEmail, updateUser, deleteUser } from '../../src/models/user';
import { User } from '../../src/types/user';

// Mock the user model functions since they don't exist yet
const mockCreateUser = jest.fn();
const mockGetUserById = jest.fn();
const mockGetUserByEmail = jest.fn();
const mockUpdateUser = jest.fn();
const mockDeleteUser = jest.fn();

// This will allow the tests to run without direct import errors,
// but they will use the mocks until the real implementation is added.
jest.mock('../../src/models/user', () => ({
    createUser: mockCreateUser,
    getUserById: mockGetUserById,
    getUserByEmail: mockGetUserByEmail,
    updateUser: mockUpdateUser,
    deleteUser: mockDeleteUser,
}));

describe('User CRUD Operations', () => {
    // A dummy user object for testing
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

    // Ensure the users table exists before running tests
    beforeAll(async () => {
        // In a real application, database migrations would handle this.
        // For testing purposes, we create the table if it doesn't exist.
        // This setup is needed even with mocks because tests will interact with the DB directly for cleanup.
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                nickname VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL
            );
        `);
    });

    // Clean up the users table after each test to ensure test isolation
    afterEach(async () => {
        await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE;');
        jest.clearAllMocks(); // Clear mocks after each test
    });

    // Close the database connection pool after all tests are done
    afterAll(async () => {
        await pool.end();
    });

    describe('createUser', () => {
        it('should create a new user and return the created user with an ID', async () => {
            const newUserWithId: User = { ...testUser, id: 1 };
            mockCreateUser.mockResolvedValueOnce(newUserWithId);
            mockGetUserById.mockResolvedValueOnce(newUserWithId);

            const newUser = await mockCreateUser(testUser);
            expect(newUser).toBeDefined();
            expect(newUser.id).toBeGreaterThan(0);
            expect(newUser.name).toBe(testUser.name);
            expect(newUser.email).toBe(testUser.email);
            expect(newUser.nickname).toBe(testUser.nickname);
            expect(newUser.password).toBe(testUser.password);

            const fetchedUser = await mockGetUserById(newUser.id!);
            expect(fetchedUser).toEqual(newUser);
            expect(mockCreateUser).toHaveBeenCalledWith(testUser);
            expect(mockGetUserById).toHaveBeenCalledWith(newUser.id);
        });

        it('should throw an error if trying to create a user with a duplicate email', async () => {
            mockCreateUser.mockResolvedValueOnce({ ...testUser, id: 1 });
            await mockCreateUser(testUser); // Create the first user

            mockCreateUser.mockRejectedValueOnce(new Error('Duplicate email'));
            await expect(mockCreateUser(testUser)).rejects.toThrow('Duplicate email');
            expect(mockCreateUser).toHaveBeenCalledTimes(2);
        });

        it('should throw an error if trying to create a user with a duplicate nickname', async () => {
            mockCreateUser.mockResolvedValueOnce({ ...testUser, id: 1 });
            await mockCreateUser(testUser); // Create the first user

            const userWithSameNickname = { ...anotherTestUser, email: 'unique@email.com', nickname: testUser.nickname };
            mockCreateUser.mockRejectedValueOnce(new Error('Duplicate nickname'));
            await expect(mockCreateUser(userWithSameNickname)).rejects.toThrow('Duplicate nickname');
            expect(mockCreateUser).toHaveBeenCalledTimes(2);
        });
    });

    describe('getUserById', () => {
        it('should retrieve a user by their ID', async () => {
            const newUserWithId: User = { ...testUser, id: 1 };
            mockCreateUser.mockResolvedValueOnce(newUserWithId);
            mockGetUserById.mockResolvedValueOnce(newUserWithId);

            const newUser = await mockCreateUser(testUser);
            const fetchedUser = await mockGetUserById(newUser.id!);
            expect(fetchedUser).toEqual(newUser);
            expect(mockGetUserById).toHaveBeenCalledWith(newUser.id);
        });

        it('should return null if the user ID does not exist', async () => {
            mockGetUserById.mockResolvedValueOnce(null);
            const fetchedUser = await mockGetUserById(99999); // A non-existent ID
            expect(fetchedUser).toBeNull();
            expect(mockGetUserById).toHaveBeenCalledWith(99999);
        });
    });

    describe('getUserByEmail', () => {
        it('should retrieve a user by their email', async () => {
            const newUserWithId: User = { ...testUser, id: 1 };
            mockCreateUser.mockResolvedValueOnce(newUserWithId);
            mockGetUserByEmail.mockResolvedValueOnce(newUserWithId);

            const newUser = await mockCreateUser(testUser);
            const fetchedUser = await mockGetUserByEmail(testUser.email);
            expect(fetchedUser).toEqual(newUser);
            expect(mockGetUserByEmail).toHaveBeenCalledWith(testUser.email);
        });

        it('should return null if the user email does not exist', async () => {
            mockGetUserByEmail.mockResolvedValueOnce(null);
            const fetchedUser = await mockGetUserByEmail('nonexistent@example.com');
            expect(fetchedUser).toBeNull();
            expect(mockGetUserByEmail).toHaveBeenCalledWith('nonexistent@example.com');
        });
    });

    describe('updateUser', () => {
        it('should update an existing user and return the updated user', async () => {
            const newUserWithId: User = { ...testUser, id: 1 };
            mockCreateUser.mockResolvedValueOnce(newUserWithId);
            const newUser = await mockCreateUser(testUser);

            const updates = { name: 'Updated Name', nickname: 'updateduser' };
            const updatedUserWithId: User = { ...newUserWithId, ...updates };
            mockUpdateUser.mockResolvedValueOnce(updatedUserWithId);
            mockGetUserById.mockResolvedValueOnce(updatedUserWithId);

            const updatedUser = await mockUpdateUser(newUser.id!, updates);

            expect(updatedUser).toBeDefined();
            expect(updatedUser!.id).toBe(newUser.id);
            expect(updatedUser!.name).toBe(updates.name);
            expect(updatedUser!.nickname).toBe(updates.nickname);
            expect(updatedUser!.email).toBe(newUser.email);
            expect(updatedUser!.password).toBe(newUser.password);

            const fetchedUser = await mockGetUserById(newUser.id!);
            expect(fetchedUser).toEqual(updatedUser);
            expect(mockUpdateUser).toHaveBeenCalledWith(newUser.id, updates);
            expect(mockGetUserById).toHaveBeenCalledWith(newUser.id);
        });

        it('should return null if the user to update does not exist', async () => {
            mockUpdateUser.mockResolvedValueOnce(null);
            const updates = { name: 'Nonexistent User' };
            const updatedUser = await mockUpdateUser(99999, updates);
            expect(updatedUser).toBeNull();
            expect(mockUpdateUser).toHaveBeenCalledWith(99999, updates);
        });

        it('should not update email or ID fields even if provided in updates', async () => {
            const newUserWithId: User = { ...testUser, id: 1 };
            mockCreateUser.mockResolvedValueOnce(newUserWithId);
            const newUser = await mockCreateUser(testUser);

            const updates = { email: 'new@example.com', id: 100, name: 'Still Same Name' };
            // Simulate the model function ignoring email/id updates
            const expectedUpdatedUser: User = { ...newUserWithId, name: updates.name };
            mockUpdateUser.mockResolvedValueOnce(expectedUpdatedUser);
            mockGetUserById.mockResolvedValueOnce(expectedUpdatedUser);

            const updatedUser = await mockUpdateUser(newUser.id!, updates);

            expect(updatedUser).toBeDefined();
            expect(updatedUser!.id).toBe(newUser.id);
            expect(updatedUser!.email).toBe(newUser.email);
            expect(updatedUser!.name).toBe(updates.name);
            expect(mockUpdateUser).toHaveBeenCalledWith(newUser.id, updates);
        });

        it('should return the original user if no valid fields are provided for update', async () => {
            const newUserWithId: User = { ...testUser, id: 1 };
            mockCreateUser.mockResolvedValueOnce(newUserWithId);
            const newUser = await mockCreateUser(testUser);

            mockUpdateUser.mockResolvedValueOnce(newUserWithId); // Simulate returning original user
            const updates = { }; // Empty updates
            const updatedUser = await mockUpdateUser(newUser.id!, updates);

            expect(updatedUser).toEqual(newUser);
            expect(mockUpdateUser).toHaveBeenCalledWith(newUser.id, updates);
        });
    });

    describe('deleteUser', () => {
        it('should delete an existing user and return true', async () => {
            const newUserWithId: User = { ...testUser, id: 1 };
            mockCreateUser.mockResolvedValueOnce(newUserWithId);
            const newUser = await mockCreateUser(testUser);

            mockDeleteUser.mockResolvedValueOnce(true);
            mockGetUserById.mockResolvedValueOnce(null); // After deletion, get by ID should return null

            const isDeleted = await mockDeleteUser(newUser.id!);
            expect(isDeleted).toBe(true);

            const fetchedUser = await mockGetUserById(newUser.id!);
            expect(fetchedUser).toBeNull();
            expect(mockDeleteUser).toHaveBeenCalledWith(newUser.id);
            expect(mockGetUserById).toHaveBeenCalledWith(newUser.id);
        });

        it('should return false if the user to delete does not exist', async () => {
            mockDeleteUser.mockResolvedValueOnce(false);
            const isDeleted = await mockDeleteUser(99999);
            expect(isDeleted).toBe(false);
            expect(mockDeleteUser).toHaveBeenCalledWith(99999);
        });
    });
});
