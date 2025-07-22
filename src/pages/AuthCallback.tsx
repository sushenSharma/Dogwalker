import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth?error=callback_error');
          return;
        }

        if (data.session) {
          // User successfully authenticated
          navigate('/');
        } else {
          // No session found, redirect to auth
          navigate('/auth');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        navigate('/auth?error=unexpected_error');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-purple-700 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="text-6xl mb-4">🐕</div>
        <h1 className="text-2xl font-bold mb-4">DogWalker</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p>Completing your sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;