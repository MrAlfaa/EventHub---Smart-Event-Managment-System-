import { create } from 'zustand';
import notificationService, { Notification } from '@/services/notificationService';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  
  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const notifications = await notificationService.getNotifications();
      const unreadCount = notifications.filter(n => !n.is_read).length;
      set({ notifications, unreadCount, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch notifications' 
      });
    }
  },
  
  markAsRead: async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      const notifications = get().notifications.map(notification => 
        notification.id === id ? { ...notification, is_read: true } : notification
      );
      const unreadCount = notifications.filter(n => !n.is_read).length;
      set({ notifications, unreadCount });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to mark notification as read' 
      });
    }
  },
  
  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();
      const notifications = get().notifications.map(notification => ({
        ...notification, 
        is_read: true
      }));
      set({ notifications, unreadCount: 0 });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to mark all notifications as read' 
      });
    }
  }
}));