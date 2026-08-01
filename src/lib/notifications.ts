import { supabase } from './supabase';

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
  const { error } = await supabase.from('notifications').insert({
    user_id: input.userId,
    type: input.type,
    title: input.title,
    message: input.message || null,
    read: false,
  });
  if (error) console.error('Failed to create notification:', error.message);
}

export async function fetchNotifications(userId: string): Promise<NotificationRow[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) {
    console.error('Failed to fetch notifications:', error.message);
    return [];
  }
  return (data || []) as NotificationRow[];
}

export async function markNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) console.error('Failed to mark notifications read:', error.message);
}
