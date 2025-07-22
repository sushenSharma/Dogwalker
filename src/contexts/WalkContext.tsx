import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WalkStats {
  duration: number; // in seconds
  distance: number; // in miles
  steps: number;
  calories: number;
}

interface WalkContextType {
  isWalking: boolean;
  walkStats: WalkStats;
  startWalk: () => void;
  endWalk: () => void;
  updateStats: (stats: Partial<WalkStats>) => void;
}

const WalkContext = createContext<WalkContextType | undefined>(undefined);

export const useWalk = () => {
  const context = useContext(WalkContext);
  if (context === undefined) {
    throw new Error('useWalk must be used within a WalkProvider');
  }
  return context;
};

interface WalkProviderProps {
  children: ReactNode;
}

export const WalkProvider: React.FC<WalkProviderProps> = ({ children }) => {
  const [isWalking, setIsWalking] = useState(false);
  const [walkStats, setWalkStats] = useState<WalkStats>({
    duration: 0,
    distance: 0,
    steps: 0,
    calories: 0,
  });
  const [startTime, setStartTime] = useState<number | null>(null);

  // Timer effect for duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isWalking && startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const duration = Math.floor((now - startTime) / 1000);
        setWalkStats(prev => ({ ...prev, duration }));
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isWalking, startTime]);

  // Mock step counter and distance calculator
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isWalking) {
      interval = setInterval(() => {
        setWalkStats(prev => {
          const newSteps = prev.steps + Math.floor(Math.random() * 5) + 1;
          const newDistance = newSteps * 0.0005; // rough conversion
          const newCalories = Math.floor(newSteps * 0.04); // rough conversion
          
          return {
            ...prev,
            steps: newSteps,
            distance: parseFloat(newDistance.toFixed(2)),
            calories: newCalories,
          };
        });
      }, 2000); // Update every 2 seconds for demo
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isWalking]);

  const startWalk = () => {
    setIsWalking(true);
    setStartTime(Date.now());
    setWalkStats({
      duration: 0,
      distance: 0,
      steps: 0,
      calories: 0,
    });
  };

  const endWalk = () => {
    setIsWalking(false);
    setStartTime(null);
    // Here you would typically save the walk data to a backend
    console.log('Walk ended with stats:', walkStats);
  };

  const updateStats = (newStats: Partial<WalkStats>) => {
    setWalkStats(prev => ({ ...prev, ...newStats }));
  };

  const value = {
    isWalking,
    walkStats,
    startWalk,
    endWalk,
    updateStats,
  };

  return <WalkContext.Provider value={value}>{children}</WalkContext.Provider>;
};