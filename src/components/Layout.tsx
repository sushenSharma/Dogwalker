import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import { useNotifications } from '../contexts/NotificationContext';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Top Header with Notifications */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">DogWalker</h1>
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 text-gray-600 hover:text-gray-900"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
      
      <main className="max-w-md mx-auto">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Layout;