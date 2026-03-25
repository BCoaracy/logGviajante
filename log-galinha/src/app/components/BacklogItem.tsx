import React from 'react';
import { MediaStatus, MediaType } from '../../models/backlog';

export interface UnifiedBacklogItem {
    id: number;
    media_id: number;
    media_type: MediaType;
    status: MediaStatus;
    title: string;
    cover: string;
}

interface BacklogItemProps {
    item: UnifiedBacklogItem;
    onStatusChange: (id: number, newStatus: MediaStatus) => void;
    onDelete: (id: number) => void;
}

export default function BacklogItem({ item, onStatusChange, onDelete }: BacklogItemProps) {
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onStatusChange(item.id, e.target.value as MediaStatus);
    };

    const typeLabel = item.media_type.charAt(0).toUpperCase() + item.media_type.slice(1);

    return (
        <div className="backlog-item-card">
            <img src={item.cover} alt={`Cover for ${item.title}`} className="backlog-item-cover" />
            
            <div className="backlog-item-info">
                <h3>{item.title}</h3>
                <span className="backlog-item-type">{typeLabel}</span>
            </div>

            <div className="backlog-item-actions">
                <select 
                    value={item.status} 
                    onChange={handleStatusChange}
                    className="backlog-status-select"
                >
                    <option value="Na Fila">Na Fila</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Finalizado">Finalizado</option>
                </select>

                <button 
                    onClick={() => onDelete(item.id)}
                    className="backlog-delete-btn"
                    aria-label="Remove item"
                >
                    Remover
                </button>
            </div>
        </div>
    );
}
