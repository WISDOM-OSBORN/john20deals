import { adminOps, userOps } from './api';

export interface NotificationRow {
  id: string;
  created_at: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  read: boolean;
}

export async function createNotification(input: {
  userId: string;
  type: string;
  title: string;
  message?: string;
}): Promise<void> {
  if (!input.userId) return;
  try {
    await adminOps({
      action: 'createNotification',
      notification: input,
    });
  } catch (error: any) {
    console.error('Failed to create notification:', error.message);
  }
}

export async function fetchNotifications(userId: string): Promise<NotificationRow[]> {
  try {
    const data = await userOps({ action: 'fetchNotifications', userId });
    return (data?.notifications || []) as NotificationRow[];
  } catch (error: any) {
    console.error('Failed to fetch notifications:', error.message);
    return [];
  }
}

export async function markNotificationsRead(userId: string): Promise<void> {
  try {
    const data = await userOps({ action: 'fetchNotifications', userId });
    const unread = (data?.notifications || []).filter((n: NotificationRow) => !n.read);
    const ids = unread.map((n) => n.id);
    if (ids.length === 0) return;
    await userOps({ action: 'markNotificationsRead', ids });
  } catch (error: any) {
    console.error('Failed to mark notifications read:', error.message);
  }
}
