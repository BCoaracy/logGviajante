export interface KeycloakUserPayload {
    email: string;
    username: string;
    password?: string;
    firstName?: string;
    lastName?: string;
}

const KC_URL = process.env.KEYCLOAK_URL || 'http://localhost:8080';
const KC_REALM = process.env.KEYCLOAK_REALM || 'master';
const KC_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || 'admin-cli';
const KC_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET || '';

export async function getAdminToken(): Promise<string> {
    const params = new URLSearchParams();
    params.append('client_id', KC_CLIENT_ID);
    params.append('grant_type', 'client_credentials');
    if (KC_CLIENT_SECRET) {
        params.append('client_secret', KC_CLIENT_SECRET);
    }

    const response = await fetch(`${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    });

    if (!response.ok) {
        throw new Error('Failed to authenticate with Keycloak.');
    }

    const data = await response.json();
    return data.access_token;
}

export async function createUserInKeycloak(user: KeycloakUserPayload) {
    try {
        const token = await exports.getAdminToken(); // Uses exports to allow mocking getAdminToken itself in Jest
        
        const payload: any = {
            username: user.username,
            email: user.email,
            enabled: true,
            emailVerified: false,
        };

        if (user.password) {
            payload.credentials = [{
                type: 'password',
                value: user.password,
                temporary: false
            }];
        }

        const response = await fetch(`${KC_URL}/admin/realms/${KC_REALM}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error('[Keycloak CreateUser] Error:', response.status, response.statusText);
            return { success: false, error: 'Failed to create user in Keycloak.' };
        }

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function inactivateUserInKeycloak(keycloakId: string) {
    try {
        const token = await exports.getAdminToken(); 

        const response = await fetch(`${KC_URL}/admin/realms/${KC_REALM}/users/${keycloakId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ enabled: false })
        });

        if (!response.ok) {
            console.error('[Keycloak InactivateUser] Error:', response.status);
            return { success: false, error: 'Failed to inactivate user in Keycloak.' };
        }

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function deleteUserInKeycloak(keycloakId: string) {
    try {
        const token = await exports.getAdminToken(); 

        const response = await fetch(`${KC_URL}/admin/realms/${KC_REALM}/users/${keycloakId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error('[Keycloak DeleteUser] Error:', response.status);
            return { success: false, error: 'Failed to delete user in Keycloak.' };
        }

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
