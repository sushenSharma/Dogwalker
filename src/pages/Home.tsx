import React from 'react';
import { useNavigate } from 'react-router-dom';
import CheckInFeed from '../components/CheckInFeed';

const Home: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back! 🐕
        </h1>
        <p className="text-gray-600">
          Find your dog friends nearby for a fun walk together
        </p>
      </header>

      <div className="space-y-4">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button 
              disabled
              className="bg-gray-400 text-gray-200 rounded-lg p-4 text-center opacity-60 cursor-not-allowed">
              <div className="text-2xl mb-2">🚶‍♂️</div>
              <div className="font-medium">Start Walk</div>
            </button>
            <button 
              onClick={() => navigate('/map')}
              className="bg-secondary text-white rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🔍</div>
              <div className="font-medium">Find Friends</div>
            </button>
          </div>
          <div className="mt-3">
            <button 
              onClick={() => navigate('/checkin')}
              className="w-full bg-green-500 hover:bg-green-600 text-white rounded-lg p-3 text-center transition-colors">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg">📍</span>
                <span className="font-medium">Quick Check-In</span>
              </div>
            </button>
          </div>
        </div>

        {/* Friends' Check-ins Feed */}
        <CheckInFeed maxItems={5} />

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Recent Activity
          </h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                🐕
              </div>
              <div>
                <p className="font-medium text-gray-900">Max walked with Buddy</p>
                <p className="text-sm text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                👥
              </div>
              <div>
                <p className="font-medium text-gray-900">Sarah added you as friend</p>
                <p className="text-sm text-gray-500">5 hours ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Walking Status */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Friends Currently Walking
          </h2>
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🚶‍♀️</div>
            <p className="text-gray-500">No friends are walking nearby</p>
            <p className="text-sm text-gray-400 mt-1">
              Start a walk to let your friends know you're available!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;