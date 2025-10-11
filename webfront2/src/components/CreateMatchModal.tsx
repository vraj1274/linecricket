import { Trophy, X, ArrowLeft, ArrowRight, Check, Users, MapPin, Calendar, DollarSign, Globe, Clock, Star, Award, Phone, Mail, Building, Wifi, Car, Utensils } from 'lucide-react';
import React, { useState } from 'react';
import { apiService } from '../services/api';
import { logger } from '../utils/logger';

interface CreateMatchModalProps {
  isVisible: boolean;
  onClose: () => void;
  onMatchCreated?: () => void;
}

type Step = 'match-details' | 'venue-time' | 'teams-criteria' | 'review-create';

export function CreateMatchModal({ isVisible, onClose, onMatchCreated }: CreateMatchModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('match-details');
  const [formData, setFormData] = useState({
    // Step 1: Match Details
    title: '',
    description: '',
    match_type: 't20',
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
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Team management functions
  const addTeam = () => {
    setFormData(prev => ({
      ...prev,
      teams: [...prev.teams, { name: '', role: 'captain' }]
    }));
  };

  const removeTeam = (index: number) => {
    if (formData.teams.length > 1) {
      setFormData(prev => ({
        ...prev,
        teams: prev.teams.filter((_, i) => i !== index)
      }));
    }
  };

  const updateTeam = (index: number, field: 'name' | 'role', value: string) => {
    setFormData(prev => ({
      ...prev,
      teams: prev.teams.map((team, i) => 
        i === index ? { ...team, [field]: value } : team
      )
    }));
  };

  // Umpire management functions
  const addUmpire = () => {
    setFormData(prev => ({
      ...prev,
      umpires: [...prev.umpires, { name: '', contact: '', experience: 'intermediate', fee: 0 }]
    }));
  };

  const removeUmpire = (index: number) => {
    if (formData.umpires.length > 1) {
      setFormData(prev => ({
        ...prev,
        umpires: prev.umpires.filter((_, i) => i !== index)
      }));
    }
  };

  const updateUmpire = (index: number, field: 'name' | 'contact' | 'experience' | 'fee', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      umpires: prev.umpires.map((umpire, i) => 
        i === index ? { ...umpire, [field]: value } : umpire
      )
    }));
  };

  const matchTypes = [
    // { value: 't20', label: 'T20' },
    // { value: 'odi', label: 'ODI' },
    // { value: 'test', label: 'Test' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'tournament', label: 'Tournament' }
  ];

  const matchFormats = [
    { value: 't20', label: 'T20' },
    { value: 'odi', label: 'ODI' },
    { value: 'test', label: 'Test' },
    // { value: 'practice', label: 'Practice' }
  ];

  const skillLevels = [
    { value: 'all_levels', label: 'All Levels - Open to everyone' },
    { value: 'beginner', label: 'Beginner - New to cricket' },
    { value: 'intermediate', label: 'Intermediate - Some experience' },
    { value: 'advanced', label: 'Advanced - Experienced players' },
    { value: 'professional', label: 'Professional - Elite level' }
  ];

  const playerRoles = [
    { value: 'captain', label: 'Captain' },
    { value: 'vice_captain', label: 'Vice Captain' },
    { value: 'batsman', label: 'Batsman' },
    { value: 'bowler', label: 'Bowler' },
    { value: 'all_rounder', label: 'All Rounder' },
    { value: 'wicket_keeper', label: 'Wicket Keeper' }
  ];

  const umpireExperienceLevels = [
    { value: 'beginner', label: 'Beginner - New to umpiring' },
    { value: 'intermediate', label: 'Intermediate - Some experience' },
    { value: 'advanced', label: 'Advanced - Experienced umpire' },
    { value: 'professional', label: 'Professional - Certified umpire' }
  ];

  const steps = [
    { id: 'match-details', title: 'Match Details', number: 1 },
    { id: 'venue-time', title: 'Venue & Time', number: 2 },
    { id: 'teams-criteria', title: 'Teams & Criteria', number: 3 },
    { id: 'review-create', title: 'Review & Create', number: 4 }
  ];

  const getCurrentStepNumber = () => {
    return steps.findIndex(step => step.id === currentStep) + 1;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage('');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentStep !== 'review-create') {
      e.preventDefault();
      handleNextWithValidation();
    }
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

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 'match-details':
        if (!formData.title.trim()) {
          setErrorMessage('Please enter a match title.');
          return false;
        }
        break;
      case 'venue-time':
        if (!formData.location.trim()) {
          setErrorMessage('Please enter a location.');
          return false;
        }
        if (!formData.match_date) {
          setErrorMessage('Please select a match date.');
          return false;
        }
        if (!formData.match_time) {
          setErrorMessage('Please select a match time.');
          return false;
        }
        break;
      case 'teams-criteria':
        if (formData.match_type === 'tournament') {
          // For tournaments, validate all teams
          const emptyTeams = formData.teams.filter(team => !team.name.trim());
          if (emptyTeams.length > 0) {
            setErrorMessage('Please enter names for all teams.');
            return false;
          }
          if (formData.teams.length < 2) {
            setErrorMessage('Tournament requires at least 2 teams.');
            return false;
          }
        } else {
          // For regular matches, validate team1 and team2
          if (!formData.team1_name.trim()) {
            setErrorMessage('Please enter Team 1 name.');
            return false;
          }
          if (!formData.team2_name.trim()) {
            setErrorMessage('Please enter Team 2 name.');
            return false;
          }
        }
        break;
       case 'review-create':
         // Validate umpire details if needed
         if (formData.need_umpire) {
           const emptyUmpires = formData.umpires.filter(umpire => !umpire.name.trim() || !umpire.contact.trim());
           if (emptyUmpires.length > 0) {
             setErrorMessage('Please enter name and contact for all umpires.');
             return false;
           }
           if (formData.umpires.length === 0) {
             setErrorMessage('Please add at least one umpire.');
             return false;
           }
         }
         break;
    }
    return true;
  };

  const handleNextWithValidation = () => {
    if (validateCurrentStep()) {
      setErrorMessage(''); // Clear any previous errors
      // Add a small delay for smooth transition
      setTimeout(() => {
        handleNext();
      }, 100);
    }
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
      setIsCreating(true);
      logger.userAction('Creating new match', { title: formData.title, match_type: formData.match_type });
      
      // Format data for backend API - include all collected data
      const matchData = {
        title: formData.title,
        description: formData.description || '',
        match_type: formData.match_type,
        location: formData.location,
        venue: formData.venue || '',
        match_date: formData.match_date,
        match_time: formData.match_time,
        players_needed: formData.players_needed,
        entry_fee: formData.is_paid_match ? formData.entry_fee : 0,
        is_public: formData.is_public,
        skill_level: formData.skill_level,
        equipment_provided: formData.equipment_provided,
        rules: formData.rules || '',
        
        // Team data
        team1_name: formData.match_type === 'tournament' ? formData.teams[0]?.name || '' : formData.team1_name,
        team2_name: formData.match_type === 'tournament' ? formData.teams[1]?.name || '' : formData.team2_name,
        team1_role: formData.match_type === 'tournament' ? formData.teams[0]?.role || 'captain' : (formData.join_team === 'team1' ? formData.your_role : 'captain'),
        team2_role: formData.match_type === 'tournament' ? formData.teams[1]?.role || 'captain' : (formData.join_team === 'team2' ? formData.your_role : 'captain'),
        // Additional teams for tournaments
        teams: formData.match_type === 'tournament' ? formData.teams : undefined,
        
         // Umpire data
         need_umpire: formData.need_umpire,
         umpire_name: formData.need_umpire ? (formData.umpires[0]?.name || '') : '',
         umpire_contact: formData.need_umpire ? (formData.umpires[0]?.contact || '') : '',
         umpire_experience: formData.need_umpire ? (formData.umpires[0]?.experience || 'intermediate') : '',
         umpire_fee: formData.need_umpire ? (formData.umpires[0]?.fee || 0) : 0,
         // Additional umpires for multiple umpires
         umpires: formData.need_umpire ? formData.umpires : undefined,
        
        // Additional match data
        min_age: formData.min_age,
        max_age: formData.max_age,
        prize_money: formData.is_paid_match ? formData.prize_money : 0
      };

      console.log('Sending formatted match data to API:', matchData);
      
      const response = await apiService.createMatch(matchData);
      
      logger.info('Match created successfully', { matchId: response.id, title: formData.title });
      
      // Show success message
      setShowSuccess(true);
      
      // Close modal after a short delay
      setTimeout(() => {
        onMatchCreated?.();
        onClose();
        setShowSuccess(false);
        // Reset form
        setFormData({
          title: '',
          description: '',
          match_type: 't20',
          match_format: 't20',
          location: '',
          venue: '',
          match_date: '',
          match_time: '',
          team1_name: '',
          team2_name: '',
          teams: [{ name: '', role: 'captain' }],
          skill_level: 'all_levels',
          min_age: 7,
          max_age: 50,
          join_team: 'team1',
          your_role: 'captain',
          umpire_name: '',
          umpire_contact: '',
          umpire_experience: 'intermediate',
          umpire_fee: 0,
          need_umpire: false,
          umpires: [{ name: '', contact: '', experience: 'intermediate', fee: 0 }],
          is_paid_match: false,
          entry_fee: 0,
          prize_money: 0,
          players_needed: 22,
          is_public: true,
          equipment_provided: false,
          rules: ''
        });
        setCurrentStep('match-details');
      }, 1500);
      
    } catch (error: any) {
      logger.error('Failed to create match', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to create match. Please try again.';
      
      if (error.message?.includes('CORS')) {
        errorMessage = 'Backend server is not responding. Please try again later.';
      } else if (error.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message?.includes('Authentication')) {
        errorMessage = 'Please login again to create a match.';
      } else if (error.message?.includes('validation')) {
        errorMessage = 'Please check your match details and try again.';
      }
      
      setErrorMessage(errorMessage);
    } finally {
      setIsCreating(false);
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
              <p className="text-gray-600">Let's start with the basic information about your match</p>
              <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                💡 Tip: Enter a descriptive match name that will attract players
              </div>
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
                    {matchTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
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
                    {matchFormats.map(format => (
                      <option key={format.value} value={format.value}>
                        {format.label}
                      </option>
                    ))}
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
               <p className="text-gray-600">Where and when will the match take place?</p>
              <div className="mt-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                📍 Tip: Be specific with location to help players find the venue easily
              </div>
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
              <p className="text-gray-600">Set up the teams and player requirements</p>
              <div className="mt-2 text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-lg">
                👥 Tip: Choose skill levels that match your target players
              </div>
            </div>
            
            <div className="space-y-4">
              {formData.match_type === 'tournament' ? (
                // Tournament: Multiple teams with add/remove functionality
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-gray-900">Tournament Teams</h4>
                    <button
                      type="button"
                      onClick={addTeam}
                      className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <span className="text-lg mr-2">+</span>
                      Add Team
                    </button>
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
                          onChange={(e) => updateTeam(index, 'name', e.target.value)}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder={`e.g., Team ${index + 1}`}
                        />
                      </div>
                      
                      
                      
                      {formData.teams.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTeam(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    💡 <strong>Tournament Tip:</strong> Add all participating teams. You can add more teams using the "+" button above.
                  </div>
                </div>
              ) : (
                // Regular match: Two teams
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
                  {skillLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Age
                  </label>
                  <input
                    type="number"
                    name="min_age"
                    value={formData.min_age}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Age
                  </label>
                  <input
                    type="number"
                    name="max_age"
                    value={formData.max_age}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Your Participation</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Join Team
                    </label>
                    <select
                      name="join_team"
                      value={formData.join_team}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="team1">Team 1: {formData.team1_name || 'Team 1'}</option>
                      <option value="team2">Team 2: {formData.team2_name || 'Team 2'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Role
                    </label>
                    <select
                      name="your_role"
                      value={formData.your_role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {playerRoles.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'review-create':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Review & Create</h3>
              <p className="text-gray-600">Review all details and set up payment, umpire, and prize information</p>
              <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                💰 Tip: Review all details carefully before creating your match
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="is_paid_match"
                  checked={formData.is_paid_match}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  This is a paid match
                </label>
              </div>

              {formData.is_paid_match && (
                <div className="grid grid-cols-2 gap-4">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prize Money (₹)
                    </label>
                    <input
                      type="number"
                      name="prize_money"
                      value={formData.prize_money}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Umpire Details Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="need_umpire"
                    checked={formData.need_umpire}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    We need an umpire for this match
                  </label>
                </div>

                 {formData.need_umpire && (
                   <div className="space-y-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                     <div className="flex items-center justify-between">
                       <h4 className="font-semibold text-gray-900 flex items-center">
                         <Award className="w-4 h-4 mr-2 text-yellow-600" />
                         Umpire Information
                       </h4>
                       <button
                         type="button"
                         onClick={addUmpire}
                         className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                       >
                         <span className="text-lg mr-1 ">+</span>
                         Add Umpire
                       </button>
                     </div>
                     
                     {formData.umpires.map((umpire, index) => (
                       <div key={index} className="bg-white p-4 rounded-lg border border-yellow-200">
                         <div className="flex items-center justify-between mb-3">
                           <h5 className="font-medium text-gray-900">Umpire {index + 1}</h5>
                           {formData.umpires.length > 1 && (
                             <button
                               type="button"
                               onClick={() => removeUmpire(index)}
                               className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                             >
                               <X className="w-4 h-4" />
                             </button>
                           )}
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                               Umpire Name *
                             </label>
                             <input
                               type="text"
                               value={umpire.name}
                               onChange={(e) => updateUmpire(index, 'name', e.target.value)}
                               required
                               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                               placeholder="e.g., John Smith"
                             />
                           </div>

                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                               Contact Information *
                             </label>
                             <input
                               type="text"
                               value={umpire.contact}
                               onChange={(e) => updateUmpire(index, 'contact', e.target.value)}
                               required
                               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                               placeholder="e.g., +91 98765 43210"
                             />
                           </div>
                         </div>

                         <div className="grid grid-cols-2 gap-4 mt-4">
                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                               Experience Level
                             </label>
                             <select
                               value={umpire.experience}
                               onChange={(e) => updateUmpire(index, 'experience', e.target.value)}
                               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                             >
                               {umpireExperienceLevels.map(level => (
                                 <option key={level.value} value={level.value}>
                                   {level.label}
                                 </option>
                               ))}
                             </select>
                           </div>

                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">
                               Umpire Fee (₹)
                             </label>
                             <input
                               type="number"
                               value={umpire.fee}
                               onChange={(e) => updateUmpire(index, 'fee', parseFloat(e.target.value) || 0)}
                               min="0"
                               step="0.01"
                               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                               placeholder="0"
                             />
                           </div>
                         </div>
                       </div>
                     ))}
                     
                     <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                       💡 <strong>Umpire Tip:</strong> Add multiple umpires for better match coverage. You can add more umpires using the "+" button above.
                     </div>
                   </div>
                 )}

                {!formData.need_umpire && (
                  <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                    <Award className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No umpire required for this match</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Match Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Match:</span>
                    <span className="ml-2 font-medium">{formData.title || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Format:</span>
                    <span className="ml-2 font-medium">{formData.match_format?.toUpperCase() || 'N/A'}</span>
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
                    <span className="text-gray-600">Age Range:</span>
                    <span className="ml-2 font-medium">{formData.min_age} - {formData.max_age} years</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Entry:</span>
                    <span className="ml-2 font-medium">₹{formData.entry_fee}</span>
                  </div>
                  {formData.need_umpire && (
                    <>
                      <div>
                        <span className="text-gray-600">Umpire:</span>
                        <span className="ml-2 font-medium">{formData.umpire_name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Umpire Fee:</span>
                        <span className="ml-2 font-medium">₹{formData.umpire_fee}</span>
                      </div>
                    </>
                  )}
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Create New Match</h3>
              <p className="text-gray-600 text-sm">Set up a cricket match and invite players to join</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Close modal"
              aria-label="Close modal"
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

        {/* Success Message */}
        {showSuccess && (
          <div className="mx-6 mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center space-x-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span>Match created successfully! Redirecting...</span>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-2">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </div>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step Content */}
        <div className="p-6 transition-all duration-300" onKeyPress={handleKeyPress}>
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={getCurrentStepNumber() === 1 ? onClose : handlePrevious}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{getCurrentStepNumber() === 1 ? 'Cancel' : 'Previous'}</span>
          </button>
          
          <div className="flex items-center space-x-4">
            {/* Step indicator text */}
            <span className="text-sm text-gray-500">
              Step {getCurrentStepNumber()} of {steps.length}
            </span>
            
            {currentStep === 'review-create' ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isCreating}
                className="px-8 py-3 text-black rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
              >
                {isCreating && (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                )}
                <Check className="w-4 h-4" />
                <span>{isCreating ? 'Creating Match...' : 'Create Match'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextWithValidation}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"              >
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