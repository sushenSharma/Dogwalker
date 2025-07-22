import React from 'react';
import { NavLink } from 'react-router-dom';

const BottomNavigation: React.FC = () => {
  const navItems = [
    { to: '/', icon: '🏠', label: 'Home' },
    { to: '/friends', icon: '👥', label: 'Friends' },
    { to: '/walk', icon: '🚶', label: 'Walk' },
    { to: '/profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary bg-purple-50'
                    : 'text-gray-600 hover:text-primary'
                }`
              }
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;