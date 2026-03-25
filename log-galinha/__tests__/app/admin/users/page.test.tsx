import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserAdminPage from '../../../../src/app/admin/users/page';

global.fetch = jest.fn() as jest.Mock;
// Mock randomUUID for deterministic tests
Object.defineProperty(global, 'crypto', {
    value: { randomUUID: () => 'mock-uuid-1234' }
});

describe('User Admin Dashboard', () => {
    beforeEach(() => {
        (global.fetch as jest.Mock).mockClear();
    });

    it('searches for users and renders them', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [{
                id: 1, keycloak_id: 'kc-1', name: 'Admin', email: 'admin@t.com', nickname: 'admin1', status: 'active'
            }]
        });

        render(<UserAdminPage />);
        fireEvent.change(screen.getByPlaceholderText(/search local IAM database/i), { target: { value: 'admin' } });
        fireEvent.click(screen.getByRole('button', { name: /search users/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/users?search=admin');
            expect(screen.getByText('admin@t.com')).toBeInTheDocument();
            expect(screen.getByText('active')).toBeInTheDocument();
        });
    });

    it('successfully registers a new user with generated UUID payload', async () => {
        // Initial search fetch (on mount or empty)
        (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => [] });
        
        render(<UserAdminPage />);
        
        // Mock successful POST
        (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });

        fireEvent.change(screen.getByPlaceholderText('Full Name'), { target: { value: 'New Guy' } });
        fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'newguy' } });
        fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'x@x.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password (For Keycloak)'), { target: { value: '1234' } });

        fireEvent.click(screen.getByRole('button', { name: /create identity/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/users', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    keycloak_id: 'mock-uuid-1234',
                    name: 'New Guy',
                    username: 'newguy',
                    email: 'x@x.com',
                    password: '1234'
                })
            }));
            expect(screen.getByText(/successfully registered identity/i)).toBeInTheDocument();
        });
    });

    it('disables an existing user when requested', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [{
                id: 1, keycloak_id: 'kc-1', name: 'Admin', email: 'admin@t.com', nickname: 'admin1', status: 'active'
            }]
        });

        render(<UserAdminPage />);
        fireEvent.click(screen.getByRole('button', { name: /search users/i }));

        await waitFor(() => screen.getByText('admin@t.com'));

        (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });

        fireEvent.click(screen.getByRole('button', { name: /disable/i }));

        await waitFor(() => {
             expect(global.fetch).toHaveBeenCalledWith('/api/users/kc-1', expect.objectContaining({
                 method: 'PATCH'
             }));
             expect(screen.getByText(/successfully disabled/i)).toBeInTheDocument();
        });
    });

    it('deletes an existing user when requested', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [{
                id: 1, keycloak_id: 'kc-1', name: 'Admin', email: 'admin@t.com', nickname: 'admin1', status: 'active'
            }]
        });

        render(<UserAdminPage />);
        fireEvent.click(screen.getByRole('button', { name: /search users/i }));

        await waitFor(() => screen.getByText('admin@t.com'));

        (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

        // Simulate native confirm dialog accepting 
        window.confirm = jest.fn(() => true);

        fireEvent.click(screen.getByRole('button', { name: /delete/i }));

        await waitFor(() => {
             expect(global.fetch).toHaveBeenCalledWith('/api/users/kc-1', expect.objectContaining({
                 method: 'DELETE'
             }));
             expect(screen.getByText(/successfully erased/i)).toBeInTheDocument();
        });
    });
});
