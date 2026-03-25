import { BacklogModel, BacklogItem, MediaStatus, MediaType } from '../models/backlog';

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface AddBacklogItemInput {
  user_id: number;
  media_id: number;
  media_type: MediaType;
  status: MediaStatus;
}

export async function addBacklogItem(input: AddBacklogItemInput): Promise<ServiceResponse<BacklogItem>> {
  if (!input.user_id || !input.media_id || !input.media_type || !input.status) {
    return { 
      success: false, 
      error: 'Missing required configuration: user_id, media_id, media_type, and status are required.', 
      statusCode: 400 
    };
  }

  try {
    const item = await BacklogModel.addItem(input);
    return { success: true, data: item };
  } catch (error: any) {
    console.error('[BacklogController.addBacklogItem] Error:', error.message);
    if (error.message.includes('Invalid')) {
      return { success: false, error: error.message, statusCode: 400 };
    }
    return { success: false, error: 'Failed to add item to backlog. Please try again later.', statusCode: 500 };
  }
}

export async function getUserBacklog(userId: number): Promise<ServiceResponse<BacklogItem[]>> {
  if (!userId || userId <= 0) {
    return { success: false, error: 'Invalid user ID.', statusCode: 400 };
  }

  try {
    const items = await BacklogModel.getByUserId(userId);
    return { success: true, data: items };
  } catch (error: any) {
    console.error('[BacklogController.getUserBacklog] Error:', error.message);
    return { success: false, error: 'Failed to retrieve user backlog.', statusCode: 500 };
  }
}

export async function updateBacklogItemStatus(id: number, status: MediaStatus): Promise<ServiceResponse<BacklogItem>> {
  if (!id || !status) {
    return { success: false, error: 'Missing id or status.', statusCode: 400 };
  }

  try {
    const updatedItem = await BacklogModel.updateStatus(id, status);
    if (!updatedItem) {
      return { success: false, error: 'Backlog item not found.', statusCode: 404 };
    }
    return { success: true, data: updatedItem };
  } catch (error: any) {
    console.error('[BacklogController.updateBacklogItemStatus] Error:', error.message);
    if (error.message.includes('Invalid')) {
      return { success: false, error: error.message, statusCode: 400 };
    }
    return { success: false, error: 'Failed to update backlog item.', statusCode: 500 };
  }
}

export async function removeBacklogItem(id: number): Promise<ServiceResponse<null>> {
  if (!id) {
    return { success: false, error: 'Invalid item ID.', statusCode: 400 };
  }

  try {
    const success = await BacklogModel.removeItem(id);
    if (!success) {
      return { success: false, error: 'Backlog item not found.', statusCode: 404 };
    }
    return { success: true };
  } catch (error: any) {
    console.error('[BacklogController.removeBacklogItem] Error:', error.message);
    return { success: false, error: 'Failed to remove item from backlog.', statusCode: 500 };
  }
}
