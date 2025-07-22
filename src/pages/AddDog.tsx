import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDogs } from '../contexts/DogContext';

const AddDog: React.FC = () => {
  const navigate = useNavigate();
  const { addDog } = useDogs();
  
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    size: 'Medium' as 'Small' | 'Medium' | 'Large',
    photo: '🐕',
    personality: [] as string[],
    vaccinated: false,
    spayedNeutered: false,
    description: '',
  });

  const personalityOptions = [
    'Friendly',
    'Energetic',
    'Playful',
    'Calm',
    'Protective',
    'Social',
    'Independent',
    'Gentle',
    'Curious',
    'Loyal',
  ];

  const handlePersonalityToggle = (trait: string) => {
    setFormData((prev) => ({
      ...prev,
      personality: prev.personality.includes(trait)
        ? prev.personality.filter((p) => p !== trait)
        : [...prev.personality, trait],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDog(formData);
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <header className="mb-6">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate('/profile')}
              className="mr-3 p-2 text-gray-600 hover:text-gray-900"
            >
              ←
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Add Your Dog</h1>
          </div>
          <p className="text-gray-600">
            Tell us about your furry friend to help find the perfect playmates
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dog's Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your dog's name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Breed *
                </label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Golden Retriever, Mixed Breed"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age *
                </label>
                <input
                  type="text"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 2 years, 6 months"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size *
                </label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value as 'Small' | 'Medium' | 'Large' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="Small">Small (under 25 lbs)</option>
                  <option value="Medium">Medium (25-60 lbs)</option>
                  <option value="Large">Large (over 60 lbs)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Personality */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Personality Traits
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {personalityOptions.map((trait) => (
                <button
                  key={trait}
                  type="button"
                  onClick={() => handlePersonalityToggle(trait)}
                  className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.personality.includes(trait)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>

          {/* Health & Safety */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Health & Safety
            </h2>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.vaccinated}
                  onChange={(e) => setFormData({ ...formData, vaccinated: e.target.checked })}
                  className="mr-3 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-gray-700">Up to date on vaccinations</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.spayedNeutered}
                  onChange={(e) => setFormData({ ...formData, spayedNeutered: e.target.checked })}
                  className="mr-3 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-gray-700">Spayed/Neutered</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              About Your Dog
            </h2>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Tell us more about your dog's personality, favorite activities, or anything else dog owners should know..."
            />
          </div>

          {/* Submit Button */}
          <div className="pb-6">
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Add My Dog
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDog;