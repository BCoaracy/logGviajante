import { Media } from './media';

export type BacklogStatus = 'WANT_TO_PLAY' | 'PLAYING' | 'PLAYED';

export interface BacklogItem {
    id: number;
    userId: number;
    mediaId: number; // This will refer to the 'id' of a generic media item (e.g., from a 'media' or 'games' table)
    status: BacklogStatus;
    createdAt: Date;
    updatedAt: Date;
}
