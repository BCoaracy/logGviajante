"use client";

import React, { useEffect, useState } from 'react';
import BacklogItemComponent, { UnifiedBacklogItem } from '../components/BacklogItem';
import { MediaStatus } from '../../models/backlog';
import './backlog.css';

export default function BacklogPage() {
    const [items, setItems] = useState<UnifiedBacklogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const MOCK_USER_ID = 10;

    useEffect(() => {
        fetchBacklog();
    }, []);

    const fetchBacklog = async () => {
        try {
            const res = await fetch(`/api/backlog?userId=${MOCK_USER_ID}`);
            if (!res.ok) throw new Error('Failed to load backlog');
            const data = await res.json();
            setItems(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: number, newStatus: MediaStatus) => {
        try {
            const res = await fetch(`/api/backlog/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) throw new Error('Failed to update status');
            
            setItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
        } catch (err) {
            console.error(err);
            alert('Could not update status.');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/backlog/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete item');

            setItems(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            console.error(err);
            alert('Could not delete item.');
        }
    };

    if (loading) return <div className="loading-state">Loading your universe...</div>;
    if (error) return <div className="empty-state">Error: {error}</div>;

    return (
        <div className="backlog-container">
            <header className="backlog-header">
                <h1>My Backlog</h1>
            </header>

            {items.length === 0 ? (
                <div className="empty-state">Your backlog is empty. Time to discover some games, movies, series or books!</div>
            ) : (
                <div className="backlog-list">
                    {items.map(item => (
                        <BacklogItemComponent 
                            key={item.id} 
                            item={item} 
                            onStatusChange={handleStatusChange} 
                            onDelete={handleDelete} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
