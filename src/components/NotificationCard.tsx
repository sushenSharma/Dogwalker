import React from 'react';

interface Notification {
  id: string;
  type: 'walk_invite' | 'friend_request' | 'walk_joined' | 'walk_ended';
  title: string;
  message: string;
  time: string;
  from?: string;
  action?: () => void;
  actionText?: string;
}

interface NotificationCardProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ 
  notification, 
  onDismiss 
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'walk_invite':
        return '🚶‍♂️';
      case 'friend_request':
        return '👥';
      case 'walk_joined':
        return '🎉';
      case 'walk_ended':
        return '🏁';
      default:
        return '📱';
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'walk_invite':
        return 'bg-blue-50 border-blue-200';
      case 'friend_request':
        return 'bg-purple-50 border-purple-200';
      case 'walk_joined':
        return 'bg-green-50 border-green-200';
      case 'walk_ended':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getBgColor()} mb-3`}>
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{getIcon()}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-gray-900 text-sm">
              {notification.title}
            </h4>
            <button
              onClick={() => onDismiss(notification.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {notification.message}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{notification.time}</span>
            {notification.action && notification.actionText && (
              <button
                onClick={notification.action}
                className="text-xs bg-white border border-gray-300 px-3 py-1 rounded font-medium hover:bg-gray-50"
              >
                {notification.actionText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;