import { create } from 'zustand';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  setNotifications: (notifs: Notification[]) => void;
  addNotification: (notif: Notification) => void;
  markAsRead: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  setNotifications: (notifs) => set({ notifications: notifs }),
  addNotification: (notif) => set((state) => ({ notifications: [notif, ...state.notifications] })),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, is_read: true } : n)
  }))
}));
