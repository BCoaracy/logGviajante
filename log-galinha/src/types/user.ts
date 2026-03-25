export interface User {
    id?: number; 
    keycloak_id: string; // The UUID mapping to Keycloak Identity Provider
    name: string;
    email: string;
    nickname: string;
    status: 'active' | 'inactive'; 
}
