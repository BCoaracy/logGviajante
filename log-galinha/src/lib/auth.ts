import { NextResponse, type NextRequest } from 'next/server';

/**
 * Verifies a given authentication token.
 * In a real application, this would involve decoding and validating a JWT
 * against a secret key, checking expiration, etc.
 * For now, it's a simple placeholder that checks for a specific prefix.
 * @param token The token string to verify.
 * @returns true if the token is considered valid, false otherwise.
 */
export function verifyAuthToken(token: string | null): boolean {
    // Placeholder: a real implementation would validate a JWT.
    // For now, any non-empty string starting with 'dummy-jwt-token-for-user-' is considered "valid".
    return typeof token === 'string' && token.length > 0 && token.startsWith('dummy-jwt-token-for-user-');
}

/**
 * Authenticates an incoming request by checking the Authorization header.
 * If the token is valid, it returns null.
 * If the token is missing or invalid, it returns a NextResponse with a 401 status.
 * This function is intended to be used as a guard in API routes or middleware.
 * @param request The NextRequest object.
 * @returns null if authentication is successful, or a NextResponse object for unauthorized access.
 */
export function authenticateRequest(request: NextRequest): NextResponse | null {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new NextResponse('Unauthorized: Missing or invalid Authorization header', { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    if (!verifyAuthToken(token)) {
        return new NextResponse('Unauthorized: Invalid token', { status: 401 });
    }

    // Token is valid, proceed with the request
    return null;
}
