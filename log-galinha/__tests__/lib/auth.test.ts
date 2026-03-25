import { verifyAuthToken, authenticateRequest } from '../../src/lib/auth';
import { NextResponse, type NextRequest } from 'next/server';

// Mock Next.js server components needed for testing.
jest.mock('next/server', () => {
    const actual = jest.requireActual('next/server');
    return {
        ...actual,
        NextResponse: jest.fn((body, init) => {
            return {
                status: init?.status || 200,
                body: body,
            };
        }),
    };
});

describe('Auth Utilities', () => {
    describe('verifyAuthToken', () => {
        it('should return true for a valid token matching the expected prefix', () => {
            const validToken = 'dummy-jwt-token-for-user-123';
            expect(verifyAuthToken(validToken)).toBe(true);
        });

        it('should return false for an empty token string', () => {
            expect(verifyAuthToken('')).toBe(false);
        });

        it('should return false for a null token', () => {
            expect(verifyAuthToken(null)).toBe(false);
        });

        it('should return false for a token that does not match the expected prefix', () => {
            expect(verifyAuthToken('some-random-string')).toBe(false);
            expect(verifyAuthToken('Bearer some-random-string')).toBe(false);
        });
    });

    describe('authenticateRequest', () => {
        // Helper to create a mock NextRequest object
        const mockRequest = (headers: Record<string, string> = {}) => ({
            headers: {
                get: jest.fn((name: string) => headers[name]),
            },
        } as unknown as NextRequest); // Cast to NextRequest to satisfy type checking

        beforeEach(() => {
            // Clear mock calls for NextResponse before each test to ensure isolation
            (NextResponse as unknown as jest.Mock).mockClear();
        });

        it('should return null for a request with a valid Bearer token', () => {
            const request = mockRequest({ 'Authorization': 'Bearer dummy-jwt-token-for-user-1' });
            const result = authenticateRequest(request);
            expect(result).toBeNull();
        });

        it('should return a 401 Unauthorized response for a request with no Authorization header', () => {
            const request = mockRequest({});
            const result = authenticateRequest(request);
            expect(result).toBeDefined();
            expect(result!.status).toBe(401);
            expect((NextResponse as unknown as jest.Mock)).toHaveBeenCalledWith(
                'Unauthorized: Missing or invalid Authorization header',
                { status: 401 }
            );
        });

        it('should return a 401 Unauthorized response for a request with a malformed Authorization header (no Bearer prefix)', () => {
            const request = mockRequest({ 'Authorization': 'InvalidTokenFormat' });
            const result = authenticateRequest(request);
            expect(result).toBeDefined();
            expect(result!.status).toBe(401);
            expect((NextResponse as unknown as jest.Mock)).toHaveBeenCalledWith(
                'Unauthorized: Missing or invalid Authorization header',
                { status: 401 }
            );
        });

        it('should return a 401 Unauthorized response for a request with an invalid token (wrong format after Bearer)', () => {
            const request = mockRequest({ 'Authorization': 'Bearer some-invalid-token' });
            const result = authenticateRequest(request);
            expect(result).toBeDefined();
            expect(result!.status).toBe(401);
            expect((NextResponse as unknown as jest.Mock)).toHaveBeenCalledWith(
                'Unauthorized: Invalid token',
                { status: 401 }
            );
        });

        it('should return a 401 Unauthorized response if the token string after "Bearer " is empty', () => {
            const request = mockRequest({ 'Authorization': 'Bearer ' });
            const result = authenticateRequest(request);
            expect(result).toBeDefined();
            expect(result!.status).toBe(401);
            expect((NextResponse as unknown as jest.Mock)).toHaveBeenCalledWith(
                'Unauthorized: Invalid token',
                { status: 401 }
            );
        });
    });
});
