import { createUserInKeycloak, inactivateUserInKeycloak, deleteUserInKeycloak, getAdminToken } from '../../src/services/keycloak';

global.fetch = jest.fn() as jest.Mock;

describe('Keycloak Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAdminToken', () => {
        it('fetches an access token from the Keycloak token endpoint', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ access_token: 'mock-admin-token' })
            });

            const token = await getAdminToken();
            expect(token).toBe('mock-admin-token');
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('throws an error if token fetch fails', async () => {
             (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                statusText: 'Unauthorized'
            });

            await expect(getAdminToken()).rejects.toThrow('Failed to authenticate with Keycloak.');
        });
    });

    describe('createUserInKeycloak', () => {
        it('creates a user and returns successful true state', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, status: 201 });

            // Using mock token dependency injection purely for testing boundaries if needed, or mocking the global fetch chain
            // We'll mock the fetch for the admin token inside the service logic
            jest.spyOn(require('../../src/services/keycloak'), 'getAdminToken').mockResolvedValue('token');
            
            const result = await createUserInKeycloak({ email: 'test@test.com', username: 'testuser', password: 'password123' });
            
            expect(result.success).toBe(true);
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/users'), expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('testuser')
            }));
        });

        it('returns success false when Keycloak conflicts (e.g., user exists)', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 409 });
            jest.spyOn(require('../../src/services/keycloak'), 'getAdminToken').mockResolvedValue('token');

            const result = await createUserInKeycloak({ email: 'test@test.com', username: 'dup', password: '123' });
            expect(result.success).toBe(false);
            expect(result.error).toBe('Failed to create user in Keycloak.');
        });
    });

    describe('inactivateUserInKeycloak', () => {
        it('updates user enabled: false state successfully', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, status: 204 });
            jest.spyOn(require('../../src/services/keycloak'), 'getAdminToken').mockResolvedValue('token');

            const result = await inactivateUserInKeycloak('kc-uuid-123');
            expect(result.success).toBe(true);
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/users/kc-uuid-123'), expect.objectContaining({
                method: 'PUT',
                body: JSON.stringify({ enabled: false })
            }));
        });
    });

    describe('deleteUserInKeycloak', () => {
        it('sends HTTP DELETE to user endpoint', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, status: 204 });
            jest.spyOn(require('../../src/services/keycloak'), 'getAdminToken').mockResolvedValue('token');

            const result = await deleteUserInKeycloak('kc-uuid-123');
            expect(result.success).toBe(true);
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/users/kc-uuid-123'), expect.objectContaining({
                method: 'DELETE'
            }));
        });
    });
});
