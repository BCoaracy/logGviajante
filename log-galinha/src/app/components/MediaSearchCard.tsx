import React from 'react';

export interface ExternalMediaResult {
    external_id: string;
    title: string;
    cover: string;
}

interface MediaSearchCardProps {
    result: ExternalMediaResult;
    onSave: (result: ExternalMediaResult) => void;
}

export default function MediaSearchCard({ result, onSave }: MediaSearchCardProps) {
    return (
        <div className="media-search-card">
            <img 
                src={result.cover || '/placeholder-cover.png'} 
                alt={`Cover for ${result.title}`} 
                className="media-card-img" 
            />
            <div className="media-card-content">
                <h4>{result.title}</h4>
                <button 
                    onClick={() => onSave(result)} 
                    className="media-save-btn"
                    aria-label="Save to library"
                >
                    Save to Database
                </button>
            </div>
        </div>
    );
}
