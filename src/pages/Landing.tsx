import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="pt-8 px-6 pb-6 flex-shrink-0">
        <div className="max-w-sm mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-xl flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
              <div className="w-4 h-4 bg-primary rounded-sm"></div>
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Dogs Nearby</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Create an account or log in to find dogs being walked near you
          </p>
        </div>
      </div>

      {/* Features - Flex grow to take available space */}
      <div className="px-6 flex-grow flex items-center">
        <div className="max-w-sm mx-auto w-full space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-sm">📍</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm">Find Dogs Nearby</h3>
              <p className="text-gray-500 text-xs">See dogs being walked in your area</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-sm">👥</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm">Connect with Owners</h3>
              <p className="text-gray-500 text-xs">Meet other dog owners for playdates</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-sm">📱</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm">Get Notifications</h3>
              <p className="text-gray-500 text-xs">Be notified when familiar dogs are nearby</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-sm">🚶‍♂️</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm">Track Your Walks</h3>
              <p className="text-gray-500 text-xs">Monitor your walking routes</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Buttons - Fixed at bottom */}
      <div className="px-6 pb-8 flex-shrink-0">
        <div className="max-w-sm mx-auto space-y-3">
          <button
            onClick={() => navigate('/auth?mode=signup')}
            className="w-full bg-primary text-white py-3.5 rounded-lg font-medium text-base hover:bg-primary-dark transition-colors"
          >
            Get Started
          </button>
          
          <button
            onClick={() => navigate('/auth?mode=login')}
            className="w-full bg-gray-100 text-gray-900 py-3.5 rounded-lg font-medium text-base hover:bg-gray-200 transition-colors"
          >
            I Already Have an Account
          </button>

          <p className="text-gray-400 text-xs text-center mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;