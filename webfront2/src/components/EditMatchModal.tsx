import { Trophy, X, ArrowLeft, ArrowRight, Check, Users, MapPin, Calendar, DollarSign, Globe, Clock, Star, Award, Phone, Mail, Building, Wifi, Car, Utensils, Save, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

type Step = 'match-details' | 'venue-time' | 'teams-criteria' | 'review-update';

interface EditMatchModalProps {
  isVisible: boolean;
  onClose: () => void;
  match: {
    id: string;
    title: string;
    description?: string;
    match_type: string;
    location: string;
    venue?: string;
    match_date: string;
    match_time: string;
    players_needed: number;
    entry_fee: number;
    skill_level: string;
    team1_name?: string;
    team2_name?: string;
    teams?: Array<{
      team_name: string;
      player_role: string;
      player_position: number;
    }>;
    umpires?: Array<{
      umpire_name: string;
      umpire_contact: string;
      experience_level: string;
      umpire_fees: number;
    }>;
  };
  onMatchUpdated?: () => void;
}

export function EditMatchModal({ isVisible, onClose, match, onMatchUpdated }: EditMatchModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('match-details');
  const [formData, setFormData] = useState({
    // Step 1: Match Details
    title: '',
    description: '',
    match_type: 'friendly',
    match_format: 't20',
    
    // Step 2: Venue & Time
    location: '',
    venue: '',
    match_date: '',
    match_time: '',
    
    // Step 3: Teams & Criteria
    team1_name: '',
    team2_name: '',
    teams: [{ name: '', role: 'captain' }], // Dynamic teams array for tournaments
    skill_level: 'all_levels',
    min_age: 7,
    max_age: 50,
    join_team: 'team1',
    your_role: 'captain',
    
    // Step 4: Umpire Details
    umpire_name: '',
    umpire_contact: '',
    umpire_experience: 'intermediate',
    umpire_fee: 0,
    need_umpire: false,
    umpires: [{ name: '', contact: '', experience: 'intermediate', fee: 0 }], // Dynamic umpires array
    
    // Financial Details
    is_paid_match: false,
    entry_fee: 0,
    prize_money: 0,
    
    // Additional fields
    players_needed: 22,
    is_public: true,
    equipment_provided: false,
    rules: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize form data when match changes
  useEffect(() => {
    if (match) {
      setFormData({
        // Step 1: Match Details
        title: match.title || '',
        description: match.description || '',
        match_type: match.match_type || 'friendly',
        match_format: 't20',
        
        // Step 2: Venue & Time
        location: match.location || '',
        venue: match.venue || '',
        match_date: match.match_date || '',
        match_time: match.match_time || '',
        
        // Step 3: Teams & Criteria
        team1_name: match.team1_name || '',
        team2_name: match.team2_name || '',
        teams: match.teams || [{ name: '', role: 'captain' }],
        skill_level: match.skill_level || 'all_levels',
        min_age: 7,
        max_age: 50,
        join_team: 'team1',
        your_role: 'captain',
        
        // Step 4: Umpire Details
        umpire_name: match.umpires?.[0]?.umpire_name || '',
        umpire_contact: match.umpires?.[0]?.umpire_contact || '',
        umpire_experience: match.umpires?.[0]?.experience_level || 'intermediate',
        umpire_fee: match.umpires?.[0]?.umpire_fees || 0,
        need_umpire: !!(match.umpires && match.umpires.length > 0),
        umpires: match.umpires || [{ name: '', contact: '', experience: 'intermediate', fee: 0 }],
        
        // Financial Details
        is_paid_match: (match.entry_fee || 0) > 0,
        entry_fee: match.entry_fee || 0,
        prize_money: 0,
        
        // Additional fields
        players_needed: match.players_needed || 22,
        is_public: true,
        equipment_provided: false,
        rules: ''
      });
    }
  }, [match]);

  const steps = [
    { id: 'match-details', title: 'Match Details', number: 1 },
    { id: 'venue-time', title: 'Venue & Time', number: 2 },
    { id: 'teams-criteria', title: 'Teams & Criteria', number: 3 },
    { id: 'review-update', title: 'Review & Update', number: 4 }
  ];

  const getCurrentStepNumber = () => {
    return steps.findIndex(step => step.id === currentStep) + 1;
  };

  const handleNext = () => {
    const currentStepNumber = getCurrentStepNumber();
    if (currentStepNumber < steps.length) {
      const nextStep = steps[currentStepNumber];
      setCurrentStep(nextStep.id as Step);
    }
  };

  const handlePrevious = () => {
    const currentStepNumber = getCurrentStepNumber();
    if (currentStepNumber > 1) {
      const prevStep = steps[currentStepNumber - 2];
      setCurrentStep(prevStep.id as Step);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async () => {
    // Clear previous error messages
    setErrorMessage('');
    
    // Validate required fields
    if (!formData.title.trim()) {
      setErrorMessage('Please enter a match title.');
      return;
    }
    
    if (!formData.location.trim()) {
      setErrorMessage('Please enter a location.');
      return;
    }
    
    if (!formData.match_date) {
      setErrorMessage('Please select a match date.');
      return;
    }
    
    if (!formData.match_time) {
      setErrorMessage('Please select a match time.');
      return;
    }
    
    // Validate teams based on match type
    if (formData.match_type === 'tournament') {
      const emptyTeams = formData.teams.filter(team => !team.name.trim());
      if (emptyTeams.length > 0) {
        setErrorMessage('Please enter names for all teams.');
        return;
      }
      if (formData.teams.length < 2) {
        setErrorMessage('Tournament requires at least 2 teams.');
        return;
      }
    } else {
      if (!formData.team1_name.trim() || !formData.team2_name.trim()) {
        setErrorMessage('Please enter both team names.');
        return;
      }
    }

    try {
      setIsUpdating(true);
      console.log('📝 Updating match:', match.id, 'with data:', formData);
      
      // Format data for backend API
      const updateData = {
        title: formData.title,
        description: formData.description || '',
        match_type: formData.match_type,
        location: formData.location,
        venue: formData.venue || '',
        match_date: formData.match_date,
        match_time: formData.match_time,
        players_needed: formData.players_needed,
        entry_fee: formData.is_paid_match ? formData.entry_fee : 0,
        skill_level: formData.skill_level,
        
        // Team data
        team1_name: formData.match_type === 'tournament' ? formData.teams[0]?.name || '' : formData.team1_name,
        team2_name: formData.match_type === 'tournament' ? formData.teams[1]?.name || '' : formData.team2_name,
        
        // Additional teams for tournaments
        teams: formData.match_type === 'tournament' ? formData.teams : undefined,
        
        // Umpire data
        umpires: formData.need_umpire ? formData.umpires : undefined
      };

      const response = await apiService.updateMatch(match.id, updateData);
      
      console.log('✅ Match updated successfully:', response);
      alert('Match updated successfully!');
      
      onMatchUpdated?.();
      onClose();
      
    } catch (error: any) {
      console.error('❌ Error updating match:', error);
      setErrorMessage(error.message || 'Failed to update match. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${match.title}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      setIsUpdating(true);
      setErrorMessage('');
      
      console.log('🗑️ Deleting match:', match.id);
      
      await apiService.deleteMatch(match.id);
      
      console.log('✅ Match deleted successfully');
      alert('Match deleted successfully!');
      
      onMatchUpdated?.();
      onClose();
      
    } catch (error: any) {
      console.error('❌ Error deleting match:', error);
      setErrorMessage(error.message || 'Failed to delete match. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'match-details':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Match Details</h3>
              <p className="text-gray-600">Update the basic information about your match</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Match Name *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Mumbai Warriors vs Delhi Champions"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your match..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Match Type
                  </label>
                  <select
                    name="match_type"
                    value={formData.match_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="friendly">Friendly</option>
                    <option value="tournament">Tournament</option>
                    <option value="league">League</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Match Format
                  </label>
                  <select
                    name="match_format"
                    value={formData.match_format}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="t20">T20</option>
                    <option value="odi">ODI</option>
                    <option value="test">Test</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'venue-time':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Venue & Time</h3>
              <p className="text-gray-600">Update where and when the match will take place</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Shivaji Park, Mumbai"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue (Optional)
                </label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Shivaji Park Cricket Ground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="match_date"
                    value={formData.match_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    name="match_time"
                    value={formData.match_time}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'teams-criteria':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Teams & Criteria</h3>
              <p className="text-gray-600">Update team information and player requirements</p>
            </div>
            
            <div className="space-y-4">
              {formData.match_type === 'tournament' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-gray-900">Tournament Teams</h4>
                  </div>
                  
                  {formData.teams.map((team, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Team {index + 1} Name *
                        </label>
                        <input
                          type="text"
                          value={team.name}
                          onChange={(e) => {
                            const newTeams = [...formData.teams];
                            newTeams[index] = { ...team, name: e.target.value };
                            setFormData(prev => ({ ...prev, teams: newTeams }));
                          }}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder={`e.g., Team ${index + 1}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team 1 Name *
                    </label>
                    <input
                      type="text"
                      name="team1_name"
                      value={formData.team1_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Mumbai Warriors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team 2 Name *
                    </label>
                    <input
                      type="text"
                      name="team2_name"
                      value={formData.team2_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Delhi Champions"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill Level Requirement
                </label>
                <select
                  name="skill_level"
                  value={formData.skill_level}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all_levels">All Levels - Open to everyone</option>
                  <option value="beginner">Beginner - New to cricket</option>
                  <option value="intermediate">Intermediate - Some experience</option>
                  <option value="advanced">Advanced - Experienced players</option>
                  <option value="professional">Professional - Elite level</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Players Needed
                  </label>
                  <input
                    type="number"
                    name="players_needed"
                    value={formData.players_needed}
                    onChange={handleInputChange}
                    min="1"
                    max="50"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entry Fee (₹)
                  </label>
                  <input
                    type="number"
                    name="entry_fee"
                    value={formData.entry_fee}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'review-update':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Review & Update</h3>
              <p className="text-gray-600">Review all details before updating the match</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Match Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Match:</span>
                  <span className="ml-2 font-medium">{formData.title || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Type:</span>
                  <span className="ml-2 font-medium">{formData.match_type?.toUpperCase() || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Venue:</span>
                  <span className="ml-2 font-medium">{formData.venue || formData.location || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Date:</span>
                  <span className="ml-2 font-medium">{formData.match_date || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Time:</span>
                  <span className="ml-2 font-medium">{formData.match_time || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Teams:</span>
                  <span className="ml-2 font-medium">
                    {formData.match_type === 'tournament' 
                      ? formData.teams.map(team => team.name || 'Team').join(', ')
                      : `${formData.team1_name || 'Team 1'} vs ${formData.team2_name || 'Team 2'}`
                    }
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Players:</span>
                  <span className="ml-2 font-medium">{formData.players_needed}</span>
                </div>
                <div>
                  <span className="text-gray-600">Entry Fee:</span>
                  <span className="ml-2 font-medium">₹{formData.entry_fee}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Edit Match</h3>
              <p className="text-gray-600 text-sm">Update match details step by step</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  currentStep === step.id 
                    ? 'bg-blue-600 text-white ring-2 ring-blue-200' 
                    : index < getCurrentStepNumber() - 1 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {index < getCurrentStepNumber() - 1 ? <Check className="w-4 h-4" /> : step.number}
                </div>
                <span className={`ml-2 text-sm font-medium transition-colors ${
                  currentStep === step.id ? 'text-blue-600 font-semibold' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 transition-colors ${
                    index < getCurrentStepNumber() - 1 ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

         {/* Step Content */}
         <div className="p-6 flex-1 overflow-y-auto">
           {/* Error Message */}
           {errorMessage && (
             <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-6">
               {errorMessage}
             </div>
           )}

           {/* Step Content */}
           {renderStepContent()}
           
         </div>

         {/* Navigation Buttons */}
         <div className="flex items-center justify-between p-6 border-t border-gray-200">
           <div className="flex items-center space-x-4">
             {currentStep !== 'match-details' && (
               <button
                 type="button"
                 onClick={handlePrevious}
                 className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
               >
                 <ArrowLeft className="w-4 h-4" />
                 <span>Previous</span>
               </button>
             )}
           </div>

           <div className="flex items-center space-x-4">
             <button
               type="button"
               onClick={onClose}
               className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
             >
               Cancel
             </button>

             {currentStep === 'review-update' ? (
               <button
                 type="button"
                 onClick={handleSubmit}
                 disabled={isUpdating}
                 className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"               >
                 <Check className="w-4 h-4" />
                 <span>{isUpdating ? 'Updating...' : 'Edit Done'}</span>
               </button>
             ) : (
               <button
                 type="button"
                 onClick={handleNext}
                 className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"               >
                 <span>Next</span>
                 <ArrowRight className="w-4 h-4" />
               </button>
             )}
           </div>
         </div>
      </div>
    </div>
  );
}
