import React, { useState } from 'react';
import { X, Save, Trophy } from 'lucide-react';

interface EditCricketStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stats: any) => void;
  currentStats?: any;
}

export function EditCricketStatsModal({ isOpen, onClose, onSave, currentStats }: EditCricketStatsModalProps) {
  const [formData, setFormData] = useState({
    // Batting stats
    total_runs: currentStats?.total_runs || 0,
    batting_average: currentStats?.batting_average || 0,
    highest_score: currentStats?.highest_score || 0,
    centuries: currentStats?.centuries || 0,
    half_centuries: currentStats?.half_centuries || 0,
    
    // Bowling stats
    total_wickets: currentStats?.total_wickets || 0,
    bowling_average: currentStats?.bowling_average || 0,
    best_bowling_figures: currentStats?.best_bowling_figures || '0/0',
    
    // Fielding stats
    catches: currentStats?.catches || 0,
    stumpings: currentStats?.stumpings || 0,
    run_outs: currentStats?.run_outs || 0,
    
    // General stats
    total_matches: currentStats?.total_matches || 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving cricket stats:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-20 transition-opacity" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3" style={{ backgroundColor: 'var(--cricket-green)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-white" />
                <h2 className="text-lg font-bold text-white">Edit Cricket Statistics</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
            {/* General Stats */}
            <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--pavilion-cream)' }}>
              <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--cricket-green)' }}>General Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Matches</label>
                  <input
                    type="number"
                    name="total_matches"
                    value={formData.total_matches}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Batting Stats */}
            <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--warning-light)' }}>
              <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--fire-orange)' }}>Batting Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Runs</label>
                  <input
                    type="number"
                    name="total_runs"
                    value={formData.total_runs}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Batting Average</label>
                  <input
                    type="number"
                    name="batting_average"
                    value={formData.batting_average}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Highest Score</label>
                  <input
                    type="number"
                    name="highest_score"
                    value={formData.highest_score}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Centuries</label>
                  <input
                    type="number"
                    name="centuries"
                    value={formData.centuries}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Half Centuries</label>
                  <input
                    type="number"
                    name="half_centuries"
                    value={formData.half_centuries}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Bowling Stats */}
            <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--info-light)' }}>
              <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--sky-blue)' }}>Bowling Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Wickets</label>
                  <input
                    type="number"
                    name="total_wickets"
                    value={formData.total_wickets}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bowling Average</label>
                  <input
                    type="number"
                    name="bowling_average"
                    value={formData.bowling_average}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Best Bowling Figures</label>
                  <input
                    type="text"
                    name="best_bowling_figures"
                    value={formData.best_bowling_figures}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="e.g., 5/20"
                  />
                </div>
              </div>
            </div>

            {/* Fielding Stats */}
            <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--success-light)' }}>
              <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--grass-green)' }}>Fielding Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catches</label>
                  <input
                    type="number"
                    name="catches"
                    value={formData.catches}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stumpings</label>
                  <input
                    type="number"
                    name="stumpings"
                    value={formData.stumpings}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Run Outs</label>
                  <input
                    type="number"
                    name="run_outs"
                    value={formData.run_outs}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 text-sm rounded-lg transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--cricket-green)' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--cricket-green-hover)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--cricket-green)'}
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>
                  {isSubmitting ? 'Saving...' : 'Save Statistics'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
