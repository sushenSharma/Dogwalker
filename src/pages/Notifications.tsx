import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationCard from '../components/NotificationCard';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, dismissNotification, markAsRead } = useNotifications();

  // Mark all notifications as read when viewing this page
  useEffect(() => {
    notifications.forEach(notification => {
      if (!notification.read) {
        markAsRead(notification.id);
      }
    });
  }, [notifications, markAsRead]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center max-w-md mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mr-3 p-2 text-gray-600 hover:text-gray-900"
          >
            ←
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Notifications
          </h1>
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-4 max-w-md mx-auto">
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onDismiss={dismissNotification}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔔</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              All caught up!
            </h2>
            <p className="text-gray-600">
              You don't have any notifications right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;