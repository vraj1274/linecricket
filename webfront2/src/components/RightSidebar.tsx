import { CheckCircle, Edit2, Grid3X3, Heart, List, MessageCircle, MoreHorizontal, Plus, Save, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useMobileApp } from '../contexts/MobileAppContext';

interface RightSidebarProps {}

export function RightSidebar({}: RightSidebarProps = {}) {
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [postViewMode, setPostViewMode] = useState<'grid' | 'list'>('grid');
  const { showMobileAppModal } = useMobileApp();
  
  // Edit states for different sections
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [tempData, setTempData] = useState<any>({});
  
  // Data states
  const [experience, setExperience] = useState([
    { 
      title: 'Mumbai Cricket Association', 
      role: 'Senior Player', 
      duration: '2020 - Present',
      description: 'Playing competitive cricket and mentoring junior players'
    },
    { 
      title: 'St. Xavier\'s College', 
      role: 'Cricket Team Captain', 
      duration: '2018 - 2020',
      description: 'Led team to inter-college championship victory'
    },
    { 
      title: 'Local Cricket Club', 
      role: 'All-Rounder', 
      duration: '2016 - 2018',
      description: 'Started competitive cricket journey'
    }
  ]);


  const [achievements, setAchievements] = useState([
    { 
      title: 'Man of the Match', 
      description: 'Outstanding performance in Mumbai Premier League', 
      year: '2023' 
    },
    { 
      title: 'Best All-Rounder', 
      description: 'College Cricket Championship', 
      year: '2020' 
    },
    { 
      title: 'Century Club', 
      description: 'Scored 100+ runs in 5 consecutive matches', 
      year: '2022' 
    },
    { 
      title: 'Wicket Taker', 
      description: 'Most wickets in local tournament', 
      year: '2021' 
    }
  ]);

  const [awards, setAwards] = useState([
    { 
      title: 'Cricket Excellence Award', 
      organization: 'Mumbai Cricket Association', 
      year: '2023' 
    },
    { 
      title: 'Sportsmanship Award', 
      organization: 'College Sports Committee', 
      year: '2020' 
    },
    { 
      title: 'Rising Star', 
      organization: 'Local Cricket Club', 
      year: '2019' 
    }
  ]);

  const [cricketStats, setCricketStats] = useState({
    batting: {
      totalRuns: 2847,
      matches: 89,
      centuries: 3,
      halfCenturies: 12,
      average: 42.5,
      highest: 156
    },
    bowling: {
      matches: 89,
      overs: 215.2,
      wickets: 47,
      hatTricks: 1,
      best: '5/23',
      average: 28.4
    },
    fielding: {
      matches: 89,
      catches: 34,
      stumpings: 8,
      runOuts: 12
    }
  });

  const [skillsRating, setSkillsRating] = useState({
    batting: 85,
    bowling: 72,
    fielding: 90
  });

  const userPosts: any[] = [];
  const displayedPosts = showAllPosts ? userPosts : userPosts.slice(0, 3);

  const upcomingMatches = [
    { title: 'Sunday Cricket', time: 'Tomorrow', location: 'Shivaji Park, 7:00 AM' },
    { title: 'Practice Match', time: 'Today', location: 'Oval Maidan, 6:00 PM' },
  ];

  // Helper functions for editing
  const startEditing = (section: string, data: any) => {
    setEditingSection(section);
    setTempData(data);
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setTempData({});
  };

  const saveEditing = () => {
    // Save logic will be implemented per section
    setEditingSection(null);
    setTempData({});
  };

  const addNewItem = (section: string, newItem: any) => {
    if (newItem.title || newItem.name) { // Only add if there's content
      switch (section) {
        case 'experience':
          setExperience([...experience, newItem]);
          break;
        case 'achievements':
          setAchievements([...achievements, newItem]);
          break;
        case 'awards':
          setAwards([...awards, newItem]);
          break;
      }
    }
  };

  const updateItem = (section: string, index: number, updatedItem: any) => {
    switch (section) {
      case 'experience':
        const newExp = [...experience];
        newExp[index] = updatedItem;
        setExperience(newExp);
        break;
      case 'achievements':
        const newAchievements = [...achievements];
        newAchievements[index] = updatedItem;
        setAchievements(newAchievements);
        break;
      case 'awards':
        const newAwards = [...awards];
        newAwards[index] = updatedItem;
        setAwards(newAwards);
        break;
    }
  };

  const deleteItem = (section: string, index: number) => {
    switch (section) {
      case 'experience':
        setExperience(experience.filter((_, i) => i !== index));
        break;
      case 'achievements':
        setAchievements(achievements.filter((_, i) => i !== index));
        break;
      case 'awards':
        setAwards(awards.filter((_, i) => i !== index));
        break;
    }
  };

  return (
    <div className="fixed top-0 right-0 h-screen w-[320px] bg-gray-50 border-l border-gray-200 z-40 overflow-y-auto">
      <div className="p-6">
        {/* Profile Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg"
                style={{ background: 'linear-gradient(to bottom right, #5D798E, #2E4B5F)' }}
              >
                You
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <CheckCircle className="w-2 h-2 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg">Arjun Sharma</h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Verified</span>
              </div>
              <p className="text-sm text-gray-600">@arjun_cricket_star</p>
            </div>
          </div>
          
          <div className="flex justify-around mb-4 bg-gray-50 rounded-xl p-4">
            <div className="text-center">
              <p className="text-lg">42</p>
              <p className="text-xs text-gray-500">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-lg">1,234</p>
              <p className="text-xs text-gray-500">Connections</p>
            </div>
            <div className="text-center">
              <p className="text-lg">567</p>
              <p className="text-xs text-gray-500">Connected</p>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm">Cricket Enthusiast & All-Rounder</p>
            <p className="text-xs text-gray-600">🏏 Mumbai Cricket Association | 📍 Mumbai, India</p>
          </div>
          
        </div>

        {/* Posts Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm">Posts</h4>
              <span className="text-xs text-gray-500">42</span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setPostViewMode('grid')}
                className={`p-1 rounded ${postViewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <Grid3X3 className="w-3 h-3 text-gray-600" />
              </button>
              <button
                onClick={() => setPostViewMode('list')}
                className={`p-1 rounded ${postViewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <List className="w-3 h-3 text-gray-600" />
              </button>
            </div>
          </div>
          
          {userPosts.length > 0 ? (
            postViewMode === 'grid' ? (
              <div className="grid grid-cols-3 gap-1">
                {(showAllPosts ? userPosts : userPosts.slice(0, 9)).map((post) => (
                  <div key={post.id} className="aspect-square bg-gray-100 rounded cursor-pointer hover:opacity-80 transition-opacity relative group">
                    <div className="w-full h-full flex items-center justify-center text-lg">
                      🏏
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex items-center space-x-2 text-white text-xs">
                        <Heart className="w-3 h-3" />
                        <span>{post.likes}</span>
                        <MessageCircle className="w-3 h-3 ml-1" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {displayedPosts.map((post) => (
                <div key={post.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                        style={{ background: 'linear-gradient(to bottom right, #5D798E, #2E4B5F)' }}
                      >
                        You
                      </div>
                      <span className="text-xs text-gray-500">{post.timeAgo}</span>
                    </div>
                    <button className="p-1 hover:bg-gray-200 rounded-full">
                      <MoreHorizontal className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-800 mb-3 leading-relaxed">{post.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={showMobileAppModal}
                        className={`flex items-center space-x-1 text-xs transition-colors ${
                          post.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${post.liked ? 'fill-current' : ''}`} />
                        <span>{post.likes}</span>
                      </button>
                      <button 
                        onClick={showMobileAppModal}
                        className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-500 transition-colors"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>{post.comments}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-3">📝</div>
              <h4 className="text-sm font-medium text-gray-600 mb-1">No Posts Yet</h4>
              <p className="text-xs text-gray-500">Share your cricket journey!</p>
            </div>
          )}
          
          {userPosts.length > (postViewMode === 'grid' ? 9 : 3) && (
            <button 
              onClick={() => setShowAllPosts(!showAllPosts)}
              className="w-full mt-3 py-2 text-xs text-blue-500 hover:text-blue-600 transition-colors border border-blue-200 rounded-lg hover:bg-blue-50"
            >
              {showAllPosts ? 'Show Less' : `View All 42 Posts`}
            </button>
          )}
        </div>


        {/* Cricket Statistics */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-800">Cricket Statistics</h4>
            <button
              onClick={() => startEditing('cricketStats', cricketStats)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Edit Stats"
            >
              <Edit2 className="w-3 h-3 text-gray-600" />
            </button>
          </div>
          
          {/* Batting Stats */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">BATTING</span>
            </div>
            {editingSection === 'cricketStats' ? (
              <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-orange-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Total Runs</span>
                      <input
                        type="number"
                        value={tempData.batting?.totalRuns || 0}
                        onChange={(e) => setTempData({
                          ...tempData,
                          batting: { ...tempData.batting, totalRuns: parseInt(e.target.value) || 0 }
                        })}
                        className="w-16 px-1 py-0.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                </div>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Matches</span>
                      <input
                        type="number"
                        value={tempData.batting?.matches || 0}
                        onChange={(e) => setTempData({
                          ...tempData,
                          batting: { ...tempData.batting, matches: parseInt(e.target.value) || 0 }
                        })}
                        className="w-16 px-1 py-0.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                </div>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">100s</span>
                      <input
                        type="number"
                        value={tempData.batting?.centuries || 0}
                        onChange={(e) => setTempData({
                          ...tempData,
                          batting: { ...tempData.batting, centuries: parseInt(e.target.value) || 0 }
                        })}
                        className="w-16 px-1 py-0.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                </div>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">50s</span>
                      <input
                        type="number"
                        value={tempData.batting?.halfCenturies || 0}
                        onChange={(e) => setTempData({
                          ...tempData,
                          batting: { ...tempData.batting, halfCenturies: parseInt(e.target.value) || 0 }
                        })}
                        className="w-16 px-1 py-0.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Average</span>
                      <input
                        type="number"
                        step="0.1"
                        value={tempData.batting?.average || 0}
                        onChange={(e) => setTempData({
                          ...tempData,
                          batting: { ...tempData.batting, average: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-16 px-1 py-0.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Highest</span>
                      <input
                        type="number"
                        value={tempData.batting?.highest || 0}
                        onChange={(e) => setTempData({
                          ...tempData,
                          batting: { ...tempData.batting, highest: parseInt(e.target.value) || 0 }
                        })}
                        className="w-16 px-1 py-0.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Total Runs</span>
                      <span className="text-xs font-semibold text-orange-700">{cricketStats.batting.totalRuns.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Matches</span>
                      <span className="text-xs font-semibold text-orange-700">{cricketStats.batting.matches}</span>
                    </div>
                  </div>
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">100s</span>
                      <span className="text-xs font-semibold text-orange-700">{cricketStats.batting.centuries}</span>
                    </div>
                  </div>
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">50s</span>
                      <span className="text-xs font-semibold text-orange-700">{cricketStats.batting.halfCenturies}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="p-2 bg-orange-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Average</span>
                      <span className="text-xs font-semibold text-orange-700">{cricketStats.batting.average}</span>
                </div>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Highest</span>
                      <span className="text-xs font-semibold text-orange-700">{cricketStats.batting.highest}</span>
                </div>
              </div>
            </div>
              </>
            )}
            {editingSection === 'cricketStats' && (
              <div className="flex items-center justify-center space-x-2 mt-3">
                <button
                  onClick={() => {
                    setCricketStats(tempData);
                    cancelEditing();
                  }}
                  className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                >
                  Save Stats
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Bowling Stats */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">BOWLING</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Matches</span>
                  <span className="text-xs font-semibold text-blue-700">{cricketStats.bowling.matches}</span>
                </div>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Overs</span>
                  <span className="text-xs font-semibold text-blue-700">{cricketStats.bowling.overs}</span>
                </div>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Wickets</span>
                  <span className="text-xs font-semibold text-blue-700">{cricketStats.bowling.wickets}</span>
                </div>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Hat-tricks</span>
                  <span className="text-xs font-semibold text-blue-700">{cricketStats.bowling.hatTricks}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Best</span>
                  <span className="text-xs font-semibold text-blue-700">{cricketStats.bowling.best}</span>
                </div>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Average</span>
                  <span className="text-xs font-semibold text-blue-700">{cricketStats.bowling.average}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fielding Stats */}
          <div>
            <div className="flex items-center mb-2">
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">FIELDING</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Matches</span>
                  <span className="text-xs font-semibold text-green-700">{cricketStats.fielding.matches}</span>
                </div>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Catches</span>
                  <span className="text-xs font-semibold text-green-700">{cricketStats.fielding.catches}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Stumpings</span>
                  <span className="text-xs font-semibold text-green-700">{cricketStats.fielding.stumpings}</span>
                </div>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Run Outs</span>
                  <span className="text-xs font-semibold text-green-700">{cricketStats.fielding.runOuts}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Format Performance */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Format Performance</h4>
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-800">Test Cricket</span>
                <span className="text-xs text-gray-500">5 matches</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>234 runs • 8 wickets</span>
                <span className="text-orange-600 font-medium">Avg: 46.8</span>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-800">ODI Cricket</span>
                <span className="text-xs text-gray-500">25 matches</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>1,456 runs • 18 wickets</span>
                <span className="text-orange-600 font-medium">Avg: 58.2</span>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-800">T20 Cricket</span>
                <span className="text-xs text-gray-500">59 matches</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>1,157 runs • 21 wickets</span>
                <span className="text-orange-600 font-medium">Avg: 19.6</span>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Rating */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-800">Skills Rating</h4>
            <button
              onClick={() => startEditing('skills', skillsRating)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Edit Skills"
            >
              <Edit2 className="w-3 h-3 text-gray-600" />
            </button>
          </div>
          <div className="space-y-3">
            {editingSection === 'skills' ? (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-700">Batting</span>
                    <span className="text-xs text-gray-600">{tempData.batting}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={tempData.batting}
                    onChange={(e) => setTempData({...tempData, batting: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-700">Bowling</span>
                    <span className="text-xs text-gray-600">{tempData.bowling}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={tempData.bowling}
                    onChange={(e) => setTempData({...tempData, bowling: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-700">Fielding</span>
                    <span className="text-xs text-gray-600">{tempData.fielding}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={tempData.fielding}
                    onChange={(e) => setTempData({...tempData, fielding: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      setSkillsRating(tempData);
                      cancelEditing();
                    }}
                    className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    title="Save"
                  >
                    <Save className="w-3 h-3" />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    title="Cancel"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-700">Batting</span>
                    <span className="text-xs text-gray-600">{skillsRating.batting}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full" style={{ width: `${skillsRating.batting}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-700">Bowling</span>
                    <span className="text-xs text-gray-600">{skillsRating.bowling}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full" style={{ width: `${skillsRating.bowling}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-700">Fielding</span>
                    <span className="text-xs text-gray-600">{skillsRating.fielding}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" style={{ width: `${skillsRating.fielding}%` }}></div>
              </div>
            </div>
              </>
            )}
          </div>
        </div>

        {/* Experience */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm mb-3">Experience</h4>
            <button
              onClick={() => startEditing('experience', { title: '', role: '', duration: '', description: '', index: -1 })}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Add Experience"
            >
              <Plus className="w-3 h-3 text-gray-600" />
            </button>
          </div>
          <div className="space-y-3">
            {/* Add new experience form */}
            {editingSection === 'experience' && tempData.index === -1 && (
              <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Title"
                    value={tempData.title}
                    onChange={(e) => setTempData({...tempData, title: e.target.value})}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Role"
                    value={tempData.role}
                    onChange={(e) => setTempData({...tempData, role: e.target.value})}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Duration"
                    value={tempData.duration}
                    onChange={(e) => setTempData({...tempData, duration: e.target.value})}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                  <textarea
                    placeholder="Description"
                    value={tempData.description}
                    onChange={(e) => setTempData({...tempData, description: e.target.value})}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                  />
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        addNewItem('experience', tempData);
                        cancelEditing();
                      }}
                      className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      title="Add"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      title="Cancel"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            {experience.map((exp, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg group">
                {editingSection === 'experience' && tempData.index === index ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Title"
                      value={tempData.title}
                      onChange={(e) => setTempData({...tempData, title: e.target.value})}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Role"
                      value={tempData.role}
                      onChange={(e) => setTempData({...tempData, role: e.target.value})}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Duration"
                      value={tempData.duration}
                      onChange={(e) => setTempData({...tempData, duration: e.target.value})}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                    <textarea
                      placeholder="Description"
                      value={tempData.description}
                      onChange={(e) => setTempData({...tempData, description: e.target.value})}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                    />
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          updateItem('experience', index, tempData);
                          cancelEditing();
                        }}
                        className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        title="Save"
                      >
                        <Save className="w-3 h-3" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-xs font-medium text-gray-800">{exp.title}</p>
                    <p className="text-xs text-gray-600">{exp.role}</p>
                  </div>
                      <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">{exp.duration}</span>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
                          <button
                            onClick={() => startEditing('experience', {...exp, index})}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3 text-gray-600" />
                          </button>
                          <button
                            onClick={() => deleteItem('experience', index)}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </button>
                </div>
              </div>
          </div>
                <p className="text-xs text-gray-600 mt-1">{exp.description}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>


        {/* Achievements */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm mb-3">Achievements</h4>
            <button
              onClick={() => startEditing('achievements', { title: '', description: '', year: '', index: -1 })}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Add Achievement"
            >
              <Plus className="w-3 h-3 text-gray-600" />
            </button>
          </div>
          <div className="space-y-2">
            {/* Add new achievement form */}
            {editingSection === 'achievements' && tempData.index === -1 && (
              <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Achievement Title"
                    value={tempData.title}
                    onChange={(e) => setTempData({...tempData, title: e.target.value})}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={tempData.description}
                    onChange={(e) => setTempData({...tempData, description: e.target.value})}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Year"
                    value={tempData.year}
                    onChange={(e) => setTempData({...tempData, year: e.target.value})}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        addNewItem('achievements', tempData);
                        cancelEditing();
                      }}
                      className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      title="Add"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      title="Cancel"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            {achievements.map((achievement, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg group">
                {editingSection === 'achievements' && tempData.index === index ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Achievement Title"
                      value={tempData.title}
                      onChange={(e) => setTempData({...tempData, title: e.target.value})}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={tempData.description}
                      onChange={(e) => setTempData({...tempData, description: e.target.value})}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Year"
                      value={tempData.year}
                      onChange={(e) => setTempData({...tempData, year: e.target.value})}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          updateItem('achievements', index, tempData);
                          cancelEditing();
                        }}
                        className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        title="Save"
                      >
                        <Save className="w-3 h-3" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-xs font-medium text-gray-800">{achievement.title}</p>
                    <p className="text-xs text-gray-600">{achievement.description}</p>
                  </div>
                      <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">{achievement.year}</span>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
                          <button
                            onClick={() => startEditing('achievements', {...achievement, index})}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3 text-gray-600" />
                          </button>
                          <button
                            onClick={() => deleteItem('achievements', index)}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </button>
                </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Awards */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm mb-3">Awards</h4>
            <button
              onClick={() => startEditing('awards', { title: '', organization: '', year: '', index: -1 })}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Add Award"
            >
              <Plus className="w-3 h-3 text-gray-600" />
            </button>
          </div>
          <div className="space-y-2">
            {/* Add new award form */}
            {editingSection === 'awards' && tempData.index === -1 && (
              <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Award Title"
                    value={tempData.title}
                    onChange={(e) => setTempData({...tempData, title: e.target.value})}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Organization"
                    value={tempData.organization}
                    onChange={(e) => setTempData({...tempData, organization: e.target.value})}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Year"
                    value={tempData.year}
                    onChange={(e) => setTempData({...tempData, year: e.target.value})}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        addNewItem('awards', tempData);
                        cancelEditing();
                      }}
                      className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      title="Add"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      title="Cancel"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            {awards.map((award, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg group">
                {editingSection === 'awards' && tempData.index === index ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Award Title"
                      value={tempData.title}
                      onChange={(e) => setTempData({...tempData, title: e.target.value})}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Organization"
                      value={tempData.organization}
                      onChange={(e) => setTempData({...tempData, organization: e.target.value})}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Year"
                      value={tempData.year}
                      onChange={(e) => setTempData({...tempData, year: e.target.value})}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          updateItem('awards', index, tempData);
                          cancelEditing();
                        }}
                        className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        title="Save"
                      >
                        <Save className="w-3 h-3" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-xs font-medium text-gray-800">{award.title}</p>
                    <p className="text-xs text-gray-600">{award.organization}</p>
                  </div>
                      <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">{award.year}</span>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
                          <button
                            onClick={() => startEditing('awards', {...award, index})}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3 text-gray-600" />
                          </button>
                          <button
                            onClick={() => deleteItem('awards', index)}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </button>
                </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Matches */}
        <div className="mb-6">
          <h4 className="text-sm mb-3">Your Upcoming Matches</h4>
          <div className="space-y-2">
            {upcomingMatches.map((match, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">{match.title}</span>
                  <span className="text-xs text-gray-500">{match.time}</span>
                </div>
                <p className="text-xs text-gray-600">{match.location}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">© 2024 thelinecricket</p>
        </div>
      </div>
    </div>
  );
}