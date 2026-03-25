import { registerAdminUser, disableAdminUser, removeAdminUser } from '../../src/controllers/userController';
import * as KeycloakService from '../../src/services/keycloak';
import * as UserModel from '../../src/models/user';

jest.mock('../../src/services/keycloak');
jest.mock('../../src/models/user');

describe('User Controller Boundary (DB + IAM Sync)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('registerAdminUser', () => {
        const payload = {
            keycloak_id: '123-uuid',
            name: 'John Doe',
            username: 'johndoe',
            email: 'john@doe.com'
        };

        it('should create user in Keycloak first, then locally in DB if successful', async () => {
             (KeycloakService.createUserInKeycloak as jest.Mock).mockResolvedValueOnce({ success: true });
             (UserModel.createUser as jest.Mock).mockResolvedValueOnce({ id: 10, ...payload, status: 'active' });

             const result = await registerAdminUser(payload);
             
             expect(KeycloakService.createUserInKeycloak).toHaveBeenCalledWith({ email: payload.email, username: payload.username });
             expect(UserModel.createUser).toHaveBeenCalledWith({
                 keycloak_id: payload.keycloak_id,
                 name: payload.name,
                 email: payload.email,
                 nickname: payload.username,
                 status: 'active'
             });
             expect(result.success).toBe(true);
        });

        it('should not create in local DB if Keycloak creation fails', async () => {
             (KeycloakService.createUserInKeycloak as jest.Mock).mockResolvedValueOnce({ success: false, error: 'Network error' });
             
             const result = await registerAdminUser(payload);

             expect(UserModel.createUser).not.toHaveBeenCalled();
             expect(result.success).toBe(false);
             expect(result.error).toBe('Network error');
        });

        it('should rollback keycloak or flag error if DB creation fails (Simulated Rollback coverage)', async () => {
             (KeycloakService.createUserInKeycloak as jest.Mock).mockResolvedValueOnce({ success: true });
             (UserModel.createUser as jest.Mock).mockRejectedValueOnce(new Error('DB Constraint Null'));

             const result = await registerAdminUser(payload);

             expect(result.success).toBe(false);
             expect(result.error).toContain('Failed to synchronize local database');
        });
    });

    describe('disableAdminUser', () => {
         it('updates status to inactive in KC then local DB', async () => {
              (KeycloakService.inactivateUserInKeycloak as jest.Mock).mockResolvedValueOnce({ success: true });
              (UserModel.inactivateUser as jest.Mock).mockResolvedValueOnce({ keycloak_id: 'uuid', status: 'inactive' });

              const response = await disableAdminUser('uuid');
              expect(KeycloakService.inactivateUserInKeycloak).toHaveBeenCalledWith('uuid');
              expect(UserModel.inactivateUser).toHaveBeenCalledWith('uuid');
              expect(response.success).toBe(true);
         });
    });

    describe('removeAdminUser', () => {
         it('deletes user from keycloak then deletes from DB entirely', async () => {
              (KeycloakService.deleteUserInKeycloak as jest.Mock).mockResolvedValueOnce({ success: true });
              (UserModel.deleteUser as jest.Mock).mockResolvedValueOnce(true);

              const response = await removeAdminUser('uuid');
              expect(KeycloakService.deleteUserInKeycloak).toHaveBeenCalledWith('uuid');
              expect(UserModel.deleteUser).toHaveBeenCalledWith('uuid');
              expect(response.success).toBe(true);
         });
    });
});
