import { createBacklogItem } from '../../src/models/backlog';
import { pool } from '../../src/lib/db';
import { BacklogItem, BacklogStatus } from '../../src/types/backlog';

// Mock the database pool
jest.mock('../../src/lib/db', () => ({
    pool: {
        query: jest.fn(),
    },
}));

const mockPoolQuery = pool.query as jest.Mock;

describe('Backlog Model', () => {
    beforeEach(() => {
        mockPoolQuery.mockClear();
    });

    // Test case 1: Successfully create a new backlog item
    it('should successfully create a new backlog item', async () => {
        const userId = 1;
        const mediaId = 101;
        const status: BacklogStatus = 'WANT_TO_PLAY';
        const mockCreatedBacklogItem: BacklogItem = {
            id: 1,
            userId,
            mediaId,
            status,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        mockPoolQuery.mockResolvedValueOnce({
            rows: [mockCreatedBacklogItem],
        });

        const backlogItem = await createBacklogItem(userId, mediaId, status);

        expect(backlogItem).toEqual(mockCreatedBacklogItem);
        expect(mockPoolQuery).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO user_backlogs'),
            [userId, mediaId, status]
        );
    });

    // Test case 2: Prevent creating a duplicate backlog item
    it('should throw an error if a backlog item already exists for the user and media', async () => {
        const userId = 1;
        const mediaId = 101;
        const status: BacklogStatus = 'WANT_TO_PLAY';

        mockPoolQuery.mockResolvedValueOnce({
            rows: [],
        });

        await expect(createBacklogItem(userId, mediaId, status)).rejects.toThrow(
            'Backlog item already exists for this user and media.'
        );
        expect(mockPoolQuery).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO user_backlogs'),
            [userId, mediaId, status]
        );
    });

    // Test case 3: Handle invalid status (runtime check)
    it('should throw an error for an invalid backlog status', async () => {
        const userId = 1;
        const mediaId = 101;
        const invalidStatus = 'INVALID_STATUS' as BacklogStatus;

        await expect(createBacklogItem(userId, mediaId, invalidStatus)).rejects.toThrow(
            'Invalid backlog status: INVALID_STATUS'
        );
        expect(mockPoolQuery).not.toHaveBeenCalled();
    });
});
