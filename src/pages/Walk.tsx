import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalk } from '../contexts/WalkContext';

const Walk: React.FC = () => {
  const navigate = useNavigate();
  const { isWalking, walkStats, startWalk, endWalk } = useWalk();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleWalk = () => {
    if (isWalking) {
      endWalk();
    } else {
      startWalk();
    }
  };

  return (
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Walk Mode 🚶‍♂️
        </h1>
        <p className="text-gray-600">
          Let your friends know you're out for a walk
        </p>
      </header>

      <div className="space-y-6">
        {/* Walk Status Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <div className="mb-4">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl mb-4 ${
              isWalking ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {isWalking ? '🚶‍♂️' : '🏠'}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {isWalking ? 'Currently Walking' : 'Ready to Walk'}
            </h2>
            {isWalking && (
              <div className="text-3xl font-bold text-primary mb-2">
                {formatDuration(walkStats.duration)}
              </div>
            )}
            <p className="text-gray-600">
              {isWalking 
                ? 'Your friends can see you\'re walking and join you!'
                : 'Start a walk to let your friends know you\'re available'
              }
            </p>
          </div>
          
          <button
            onClick={toggleWalk}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
              isWalking
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-primary hover:bg-purple-700 text-white'
            }`}
          >
            {isWalking ? 'End Walk' : 'Start Walk'}
          </button>
        </div>

        {isWalking && (
          <>
            {/* Walking Stats */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Walk Stats
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{walkStats.distance}</div>
                  <div className="text-sm text-gray-600">Miles</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{walkStats.steps.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Steps</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{walkStats.calories}</div>
                  <div className="text-sm text-gray-600">Calories</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/checkin')}
                  className="flex items-center justify-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 p-3 rounded-lg transition-colors"
                >
                  <span className="text-lg">📍</span>
                  <span className="font-medium">Check In</span>
                </button>
                <button
                  onClick={() => navigate('/map')}
                  className="flex items-center justify-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-lg transition-colors"
                >
                  <span className="text-lg">🗺️</span>
                  <span className="font-medium">View Map</span>
                </button>
              </div>
            </div>

            {/* Nearby Friends */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Friends Nearby
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                      🐕
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Sarah & Buddy</p>
                      <p className="text-sm text-gray-600">0.2 miles away</p>
                    </div>
                  </div>
                  <button className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm">
                    Invite
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                      🐕
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Emma & Charlie</p>
                      <p className="text-sm text-gray-600">0.5 miles away</p>
                    </div>
                  </div>
                  <button className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm">
                    Invite
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Walk History */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Recent Walks
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Morning Walk</p>
                <p className="text-sm text-gray-600">1.5 miles • 25 min • With Sarah</p>
              </div>
              <div className="text-sm text-gray-500">Today</div>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Evening Stroll</p>
                <p className="text-sm text-gray-600">0.8 miles • 15 min • Solo</p>
              </div>
              <div className="text-sm text-gray-500">Yesterday</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Walk;