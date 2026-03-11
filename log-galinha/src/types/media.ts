export type MediaType = 'GAME' | 'MOVIE' | 'BOOK';

export interface Media {
    id: number;
    externalId: string | null; // ID from an external API (e.g., IGDB, TMDb, Goodreads)
    title: string;
    cover: string | null; // URL to cover image
    type: MediaType;
}
