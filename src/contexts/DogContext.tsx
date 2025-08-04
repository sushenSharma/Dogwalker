import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Dog {
  id: string;
  name: string;
  breed: string;
  age: string;
  size: 'Small' | 'Medium' | 'Large';
  photo: string;
  personality: string[];
  vaccinated: boolean;
  spayedNeutered: boolean;
  description: string;
}

interface DogContextType {
  dogs: Dog[];
  addDog: (dog: Omit<Dog, 'id'>) => void;
  updateDog: (id: string, dog: Partial<Dog>) => void;
  deleteDog: (id: string) => void;
  getDogById: (id: string) => Dog | undefined;
}

const DogContext = createContext<DogContextType | undefined>(undefined);

export const useDogs = () => {
  const context = useContext(DogContext);
  if (context === undefined) {
    throw new Error('useDogs must be used within a DogProvider');
  }
  return context;
};

interface DogProviderProps {
  children: ReactNode;
}

export const DogProvider: React.FC<DogProviderProps> = ({ children }) => {
  const [dogs, setDogs] = useState<Dog[]>([]);

  const addDog = (dogData: Omit<Dog, 'id'>) => {
    const newDog: Dog = {
      ...dogData,
      id: Date.now().toString(),
    };
    setDogs((prev) => [...prev, newDog]);
  };

  const updateDog = (id: string, dogData: Partial<Dog>) => {
    setDogs((prev) =>
      prev.map((dog) => (dog.id === id ? { ...dog, ...dogData } : dog))
    );
  };

  const deleteDog = (id: string) => {
    setDogs((prev) => prev.filter((dog) => dog.id !== id));
  };

  const getDogById = (id: string) => {
    return dogs.find((dog) => dog.id === id);
  };

  const value = {
    dogs,
    addDog,
    updateDog,
    deleteDog,
    getDogById,
  };

  return <DogContext.Provider value={value}>{children}</DogContext.Provider>;
};