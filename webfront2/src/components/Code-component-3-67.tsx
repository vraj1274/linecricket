import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateMatchModalProps {
  onClose: () => void;
}

export function CreateMatchModal({ onClose }: CreateMatchModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    location: '',
    date: '',
    time: '',
    playersNeeded: '',
    entryFee: 'free',
    description: '',
    isPublic: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.type || !formData.location || !formData.date || !formData.time || !formData.playersNeeded) {
      alert('Please fill in all required fields');
      return;
    }
    alert('Match created successfully! Players can now join your match. 🏏');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl">Create New Match</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Match Title</label>
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required 
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
              placeholder="e.g., Sunday Morning Cricket"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Match Type</label>
              <select 
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required 
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select match type</option>
                <option value="t20">T20 (20 overs)</option>
                <option value="odi">ODI (50 overs)</option>
                <option value="test">Test Match</option>
                <option value="practice">Practice Match</option>
                <option value="tournament">Tournament</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Location</label>
              <select 
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required 
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select venue</option>
                <option value="wankhede">Wankhede Stadium, Mumbai</option>
                <option value="shivaji">Shivaji Park, Mumbai</option>
                <option value="oval">Oval Maidan, Mumbai</option>
                <option value="eden">Eden Gardens, Kolkata</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Date</label>
              <input 
                type="date" 
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required 
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Time</label>
              <input 
                type="time" 
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required 
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Players Needed</label>
              <select 
                name="playersNeeded"
                value={formData.playersNeeded}
                onChange={handleInputChange}
                required 
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select</option>
                <option value="11">11 players (Full team)</option>
                <option value="22">22 players (Two teams)</option>
                <option value="16">16 players (8 vs 8)</option>
                <option value="12">12 players (6 vs 6)</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Entry Fee</label>
              <select 
                name="entryFee"
                value={formData.entryFee}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="free">Free</option>
                <option value="100">₹100</option>
                <option value="200">₹200</option>
                <option value="500">₹500</option>
                <option value="1000">₹1000</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none" 
              rows={4} 
              placeholder="Add match details, rules, or special instructions..."
            />
          </div>

          <div className="flex items-center space-x-3">
            <input 
              type="checkbox" 
              name="isPublic"
              id="publicMatch"
              checked={formData.isPublic}
              onChange={handleInputChange}
              className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
            />
            <label htmlFor="publicMatch" className="text-gray-700">
              Make this match public (visible to all users)
            </label>
          </div>

          <div className="flex space-x-4 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 py-3 text-white rounded-xl transition-colors"
              style={{ background: 'linear-gradient(to right, #FF6B33, #2E4B5F)' }}
            >
              Create Match
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}