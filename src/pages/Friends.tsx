import React, { useState } from 'react';

interface Friend {
  id: string;
  name: string;
  dogName: string;
  isWalking: boolean;
  lastSeen: string;
  distance?: string;
}

const Friends: React.FC = () => {
  const [friends] = useState<Friend[]>([
    {
      id: '1',
      name: 'Sarah',
      dogName: 'Buddy',
      isWalking: true,
      lastSeen: '5 min ago',
      distance: '0.2 miles',
    },
    {
      id: '2',
      name: 'Mike',
      dogName: 'Luna',
      isWalking: false,
      lastSeen: '2 hours ago',
    },
    {
      id: '3',
      name: 'Emma',
      dogName: 'Charlie',
      isWalking: true,
      lastSeen: '1 min ago',
      distance: '0.5 miles',
    },
  ]);

  return (
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Dog Friends 👥
        </h1>
        <p className="text-gray-600">
          Connect with other dog owners in your area
        </p>
      </header>

      <div className="space-y-4">
        {/* Add Friend Button */}
        <button className="w-full bg-primary text-white rounded-lg p-4 font-medium">
          + Add New Friend
        </button>

        {/* Currently Walking Friends */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Currently Walking
          </h2>
          <div className="space-y-3">
            {friends
              .filter((friend) => friend.isWalking)
              .map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                      🐕
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {friend.name} & {friend.dogName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {friend.distance} away • {friend.lastSeen}
                      </p>
                    </div>
                  </div>
                  <button className="bg-secondary text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Join Walk
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* All Friends */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            All Friends
          </h2>
          <div className="space-y-3">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    🐕
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {friend.name} & {friend.dogName}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          friend.isWalking ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      ></span>
                      <p className="text-sm text-gray-600">
                        {friend.isWalking ? 'Walking now' : friend.lastSeen}
                      </p>
                    </div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Friends;