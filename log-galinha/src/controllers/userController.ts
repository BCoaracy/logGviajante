import * as KeycloakService from '../services/keycloak';
import * as UserModel from '../models/user';

export interface ServiceResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    statusCode?: number;
}

interface RegisterUserPayload {
    keycloak_id: string; // Supplied by external Identity Creation step or upstream sync
    username: string;
    name: string;
    email: string;
    password?: string;
}

export async function registerAdminUser(payload: RegisterUserPayload): Promise<ServiceResponse<any>> {
    try {
        // Step 1: Tell Keycloak to manage identity
        const kcResponse = await KeycloakService.createUserInKeycloak({
            email: payload.email,
            username: payload.username,
            password: payload.password
        });

        if (!kcResponse.success) {
            return { success: false, error: kcResponse.error, statusCode: 502 };
        }

        try {
             // Step 2: Tie Keycloak ID to Local Postgres row!
             const dbUser = await UserModel.createUser({
                 keycloak_id: payload.keycloak_id,
                 name: payload.name,
                 email: payload.email,
                 nickname: payload.username,
                 status: 'active'
             });

             return { success: true, data: dbUser };
        } catch (dbError: any) {
             // If local persistence fails after Keycloak succeeded, log for manual mediation or automated rollback.
             console.error('[UserController.registerAdminUser] Database Sync Error:', dbError);
             return { success: false, error: 'Failed to synchronize local database after Keycloak creation.', statusCode: 500 };
        }

    } catch (err: any) {
        return { success: false, error: 'Internal User Registration failure.', statusCode: 500 };
    }
}

export async function disableAdminUser(keycloakId: string): Promise<ServiceResponse<any>> {
     try {
         const kcResponse = await KeycloakService.inactivateUserInKeycloak(keycloakId);
         if (!kcResponse.success) return kcResponse;

         const dbUpdated = await UserModel.inactivateUser(keycloakId);
         if (!dbUpdated) return { success: false, error: 'User updated in IAM but missing in local DB.', statusCode: 404 };

         return { success: true, data: dbUpdated };
     } catch (err: any) {
         return { success: false, error: 'Internal disable user failure.', statusCode: 500 };
     }
}

export async function removeAdminUser(keycloakId: string): Promise<ServiceResponse<null>> {
    try {
         const kcResponse = await KeycloakService.deleteUserInKeycloak(keycloakId);
         if (!kcResponse.success) return kcResponse;

         const deleted = await UserModel.deleteUser(keycloakId);
         if (!deleted) return { success: false, error: 'Deleted from IAM but user missing in DB.', statusCode: 404 };

         return { success: true };
    } catch (err: any) {
         return { success: false, error: 'Internal delete user failure.', statusCode: 500 };
    }
}
