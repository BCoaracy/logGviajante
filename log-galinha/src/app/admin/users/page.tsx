"use client";

import React, { useState } from 'react';
import './admin.css';

interface AdminUserRow {
    id: number;
    keycloak_id: string;
    name: string;
    email: string;
    nickname: string;
    status: string;
}

export default function UserAdminPage() {
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<AdminUserRow[]>([]);
    const [msg, setMsg] = useState('');
    
    // Reg form
    const [regName, setRegName] = useState('');
    const [regUsername, setRegUsername] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg('');
        try {
            const res = await fetch(`/api/users?search=${encodeURIComponent(search)}`);
            if (!res.ok) throw new Error('Search failed');
            setUsers(await res.json());
        } catch (err: any) {
            setMsg(err.message);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg('');
        // Generate UUID on client to send to API for dual-binding
        const keycloakId = crypto.randomUUID();

        try {
             const res = await fetch('/api/users', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                     keycloak_id: keycloakId,
                     name: regName,
                     username: regUsername,
                     email: regEmail,
                     password: regPassword
                 })
             });
             
             if (!res.ok) {
                 const errData = await res.json();
                 throw new Error(errData.error || 'Failed to create Keycloak identity.');
             }

             setMsg('Successfully registered identity across systems!');
             setRegName(''); setRegUsername(''); setRegEmail(''); setRegPassword('');
        } catch (err: any) {
             setMsg(`Registration Error: ${err.message}`);
        }
    };

    const handleDisable = async (keycloakId: string) => {
        setMsg('');
        try {
             const res = await fetch(`/api/users/${keycloakId}`, { method: 'PATCH' });
             if (!res.ok) throw new Error('Failed to disable.');
             setMsg('Successfully disabled user.');
             setUsers(prev => prev.map(u => u.keycloak_id === keycloakId ? { ...u, status: 'inactive' } : u));
        } catch (err: any) {
             setMsg(err.message);
        }
    };

    const handleDelete = async (keycloakId: string) => {
        if (!window.confirm('WARNING: Irrevertibly delete User identity across PostgreSQL and Keycloak IAM?')) return;
        setMsg('');
        try {
             const res = await fetch(`/api/users/${keycloakId}`, { method: 'DELETE' });
             if (!res.ok) throw new Error('Failed to delete user mapping.');
             setMsg('Successfully erased mapped user payload.');
             setUsers(prev => prev.filter(u => u.keycloak_id !== keycloakId));
        } catch (err: any) {
             setMsg(err.message);
        }
    };

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1>IAM Operations Dashboard</h1>
            </header>

            {msg && <div className="admin-message">{msg}</div>}

            <div className="admin-panel-grid">
                {/* Search Panel */}
                <div className="admin-panel">
                    <h3>Explore Local Identites</h3>
                    <form onSubmit={handleSearch} className="admin-form-group">
                        <input 
                            type="text" 
                            placeholder="Search local IAM database"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="admin-input"
                        />
                        <button type="submit" className="admin-btn blue">Search Users</button>
                    </form>

                    <div className="admin-user-list">
                        {users.map(u => (
                            <div key={u.id} className="admin-user-card">
                                <div className="user-details">
                                    <strong>{u.name}</strong> (@{u.nickname})<br />
                                    <small>{u.email} | Status: <span className={u.status}>{u.status}</span></small><br />
                                    <small>kc: {u.keycloak_id}</small> 
                                </div>
                                <div className="user-actions">
                                    <button onClick={() => handleDisable(u.keycloak_id)} className="admin-btn orange">Disable</button>
                                    <button onClick={() => handleDelete(u.keycloak_id)} className="admin-btn red">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Provisioning Panel */}
                <div className="admin-panel">
                    <h3>Provision New Identity</h3>
                    <form onSubmit={handleRegister} className="admin-provision-form">
                        <input required type="text" placeholder="Full Name" value={regName} onChange={e=>setRegName(e.target.value)} className="admin-input" />
                        <input required type="text" placeholder="Username" value={regUsername} onChange={e=>setRegUsername(e.target.value)} className="admin-input" />
                        <input required type="email" placeholder="Email Address" value={regEmail} onChange={e=>setRegEmail(e.target.value)} className="admin-input" />
                        <input required type="password" placeholder="Password (For Keycloak)" value={regPassword} onChange={e=>setRegPassword(e.target.value)} className="admin-input" />
                        <button type="submit" className="admin-btn green">Create Identity</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
