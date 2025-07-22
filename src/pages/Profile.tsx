import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDogs } from '../contexts/DogContext';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { dogs } = useDogs();

  return (
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Profile 👤
        </h1>
        <p className="text-gray-600">
          Manage your account and dog information
        </p>
      </header>

      <div className="space-y-6">
        {/* User Profile */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {(user?.user_metadata?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Dog Walker'}
              </h2>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-gray-500">San Francisco, CA</p>
            </div>
          </div>
          <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium">
            Edit Profile
          </button>
        </div>

        {/* Dog Profiles */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Dogs</h3>
            <button 
              onClick={() => navigate('/add-dog')}
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium">
              + Add Dog
            </button>
          </div>
          
          <div className="space-y-3">
            {dogs.map((dog) => (
              <div key={dog.id} className="flex items-center space-x-4 p-3 border border-gray-100 rounded-lg">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                  {dog.photo}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{dog.name}</h4>
                  <p className="text-sm text-gray-600">
                    {dog.breed} • {dog.age} • {dog.size}
                  </p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700">Notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700">Location Sharing</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700">Auto-join nearby walks</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">App</h3>
          <div className="space-y-3">
            <button className="w-full text-left py-2 text-gray-700">
              Privacy Policy
            </button>
            <button className="w-full text-left py-2 text-gray-700">
              Terms of Service
            </button>
            <button className="w-full text-left py-2 text-gray-700">
              Help & Support
            </button>
            <button 
              onClick={logout}
              className="w-full text-left py-2 text-red-600">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;