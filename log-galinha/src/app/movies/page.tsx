"use client";

import React, { useState } from 'react';
import MediaSearchCard, { ExternalMediaResult } from '../components/MediaSearchCard';
import '../media.css';

export default function MoviesPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ExternalMediaResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        
        if (!query.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/movies?search=${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error('Search failed.');
            const data = await res.json();
            setResults(data);
            if (data.length === 0) setMessage('No movies found.');
        } catch (err: any) {
            setMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (movie: ExternalMediaResult) => {
        setMessage('');
        try {
            const res = await fetch('/api/movies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(movie)
            });

            if (!res.ok) throw new Error('Failed to save movie.');
            setMessage(`Successfully saved "${movie.title}" to database!`);
        } catch (err: any) {
            setMessage(err.message);
        }
    };

    return (
        <div className="media-page-container">
            <div className="media-header">
                <h1>Search Movies (TMDB)</h1>
            </div>

            <form onSubmit={handleSearch} className="media-search-form">
                <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for movies..." 
                    className="media-search-input"
                />
                <button type="submit" disabled={loading} className="media-search-btn">
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {message && <div className="media-state-msg">{message}</div>}

            <div className="media-results-grid">
                {results.map((result) => (
                    <MediaSearchCard 
                        key={result.external_id} 
                        result={result} 
                        onSave={handleSave} 
                    />
                ))}
            </div>
        </div>
    );
}
