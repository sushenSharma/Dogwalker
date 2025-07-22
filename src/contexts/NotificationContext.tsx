import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Notification {
  id: string;
  type: 'walk_invite' | 'friend_request' | 'walk_joined' | 'walk_ended';
  title: string;
  message: string;
  time: string;
  from?: string;
  read: boolean;
  action?: () => void;
  actionText?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'time' | 'read'>) => void;
  markAsRead: (id: string) => void;
  dismissNotification: (id: string) => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'walk_invite',
      title: 'Walk Invitation',
      message: 'Sarah wants to join your walk with Buddy!',
      time: '2 min ago',
      from: 'Sarah',
      read: false,
      action: () => console.log('Accept walk invite'),
      actionText: 'Accept',
    },
    {
      id: '2',
      type: 'friend_request',
      title: 'Friend Request',
      message: 'Mike wants to be your dog walking friend',
      time: '1 hour ago',
      from: 'Mike',
      read: false,
      action: () => console.log('Accept friend request'),
      actionText: 'Accept',
    },
  ]);

  const addNotification = (notificationData: Omit<Notification, 'id' | 'time' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      time: 'Now',
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    notifications,
    addNotification,
    markAsRead,
    dismissNotification,
    unreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};