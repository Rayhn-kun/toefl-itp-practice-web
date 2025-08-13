import React, { useState, useEffect } from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Play, Trophy, Gamepad2, Star, Target, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { getQuizResults } from '@/lib/supabase';

const UserNameInput: React.FC = () => {
  const { state, dispatch } = useQuiz();
  const [inputName, setInputName] = useState('');
  
  const handleStartQuiz = () => {
    if (inputName.trim()) {
      dispatch({ type: 'SET_USER_NAME', payload: inputName.trim() });
      dispatch({ type: 'START_QUIZ' });
      toast.success(`🚀 Welcome ${inputName.trim()}! Let's dominate this challenge! 🎯`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStartQuiz();
    }
  };

  // State for leaderboard data
  const [leaderboard, setLeaderboard] = useState([]);
  
  // Fetch real leaderboard data from database
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await getQuizResults();
        if (error) {
          console.error('Error fetching leaderboard:', error);
          setLeaderboard([]);
        } else if (data && data.length > 0) {
          // Filter out non-student data and admin/excluded students
          const studentData = data.filter(result => {
            // Convert to uppercase for case-insensitive comparison
            const upperName = result.userName.toUpperCase();
            
            // Exclude test data and admin/excluded students
            const excludeKeywords = ['TEST', 'DEMO', 'SAMPLE'];
            const excludeAdmins = ['KHAIQAL ALFATHAN AJIJI', 'MUHAMMAD DHAFIN FIRDAUS RAHMAT SUBEKTI', 
                                  'MUHAMMAD HAPIDH DAVYDENKO RUSMANA', 'RADEN MUHAMMAD RAFI SAFWAN', 
                                  'RAYHAN MUAMMAR KHADAFI', 'ALDO'];
            
            // Check if name contains any exclude keywords
            const containsExcludeKeyword = excludeKeywords.some(keyword => upperName.includes(keyword));
            // Check if name is in the admin list
            const isAdmin = excludeAdmins.some(admin => upperName === admin);
            
            // Return true only for valid student names that aren't admins
            return !containsExcludeKeyword && !isAdmin;
          });
          
          // Sort by score (highest first) and time (fastest first)
          const sortedData = studentData
            .sort((a, b) => b.score - a.score || a.timeElapsed - b.timeElapsed)
            .slice(0, 6) // Only show top 6
            .map((result, index) => ({
              name: result.userName,
              score: result.score,
              time: formatTime(result.timeElapsed),
              rank: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏆'
            }));
          setLeaderboard(sortedData);
        } else {
          setLeaderboard([]);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLeaderboard([]);
      }
    };
    
    fetchLeaderboard();
    
    // Set up interval to refresh leaderboard every 30 seconds
    const intervalId = setInterval(() => {
      fetchLeaderboard();
    }, 30000); // 30 seconds
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Format time from seconds to MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8">
        
        {/* Welcome Card */}
        <Card className="shadow-2xl border-2 border-purple-300 bg-white/95 backdrop-blur">
          <CardHeader className="text-center pb-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
            <div className="mx-auto w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold text-white">
              🚀 TOEFL ITP Challenge
            </CardTitle>
            <p className="text-purple-100 mt-2 text-lg">The Ultimate English Skills Battle!</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Test Info */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-4 border border-blue-300">
                <div className="text-3xl font-bold text-blue-700">30</div>
                <div className="text-sm text-blue-600 font-medium">Questions</div>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-4 border border-green-300">
                <div className="text-3xl font-bold text-green-700">30</div>
                <div className="text-sm text-green-600 font-medium">Minutes</div>
              </div>
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-4 border border-purple-300">
                <div className="text-3xl font-bold text-purple-700">5</div>
                <div className="text-sm text-purple-600 font-medium">Hints</div>
              </div>
            </div>

            {/* Question Types */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-blue-800">Structure Questions</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">15 Questions</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="font-medium text-purple-800">Written Expression</span>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">15 Questions</Badge>
              </div>
            </div>

            {/* Player Name Input */}
            <div className="space-y-4">
            </div>
              <label className="flex items-center gap-2 text-lg font-bold text-gray-800">
                <User className="w-5 h-5 text-purple-600" />
                Enter Your Player Name
              </label>
              <Input
                type="text"
                placeholder="Your name (e.g., John Doe)"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-xl py-4 border-2 border-purple-300 focus:border-purple-500 rounded-xl"
              />
              <div className="space-y-4">
              <Button
                onClick={handleStartQuiz}
                disabled={!inputName.trim()}
                className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white py-4 text-xl rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Play className="w-6 h-6 mr-3" />
                🎮 Start Challenge Now!
              </Button>
              
              <Button
                onClick={() => dispatch({ type: 'SET_SHOW_ADMIN', payload: true })}
                className="w-full mt-2 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white py-3 text-lg rounded-xl shadow-md transform hover:scale-105 transition-all duration-200"
              >
                👑 Login as Admin
              </Button>
            </div>

            {/* Game Features */}
            <div className="bg-gradient-to-r from-yellow-100 via-orange-100 to-red-100 rounded-xl p-6 border border-orange-300">
              <div className="flex items-center gap-3 mb-4">
                <Gamepad2 className="w-6 h-6 text-orange-600" />
                <h3 className="font-bold text-xl text-orange-800">🎮 Game Features</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3 text-gray-800 bg-white/60 rounded-lg p-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>
                  <span className="font-semibold">💡 5 Smart Hints</span>
                </div>
                <div className="flex items-center gap-3 text-gray-800 bg-white/60 rounded-lg p-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold">⏱️ Live Timer</span>
                </div>
                <div className="flex items-center gap-3 text-gray-800 bg-white/60 rounded-lg p-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-spin"></div>
                  <span className="font-semibold">🎯 Submit Protection</span>
                </div>
                <div className="flex items-center gap-3 text-gray-800 bg-white/60 rounded-lg p-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                  <span className="font-semibold">🏆 Individual Ranking</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Player Leaderboard */}
        <Card className="shadow-2xl border-2 border-gold-300 bg-white/95 backdrop-blur">
          <CardHeader className="text-center pb-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-lg">
            <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-white">
              🏆 Hall of Fame
            </CardTitle>
            <p className="text-orange-100 text-lg">Top Individual Performers</p>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {leaderboard.length === 0 ? (
                <div className="text-center p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <p className="text-gray-600 mb-2">No quiz results yet</p>
                  <p className="text-sm text-gray-500">Be the first to complete the quiz and appear on the leaderboard!</p>
                </div>
              ) : (
                leaderboard.map((player, index) => (
                <div 
                  key={player.name}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all hover:shadow-lg ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-400 shadow-lg' :
                    index === 1 ? 'bg-gradient-to-r from-gray-100 to-slate-100 border-gray-400 shadow-md' :
                    index === 2 ? 'bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-400 shadow-md' :
                    'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {player.rank}
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white border-2 border-yellow-600' :
                      index === 1 ? 'bg-gray-500 text-white border-2 border-gray-600' :
                      index === 2 ? 'bg-amber-500 text-white border-2 border-amber-600' :
                      'bg-blue-500 text-white border-2 border-blue-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-lg">{player.name}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <Target className="w-3 h-3" />
                        Time: {player.time}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">{player.score}/30</div>
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      {Math.round((player.score / 30) * 100)}%
                    </div>
                  </div>
                </div>
              )))
              }
            </div>
            
            {/* Challenge Info */}
            <div className="mt-6 pt-4 border-t-2 border-gray-200">
              <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Challenge Rules:
              </h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Answer all 30 questions to submit (Required!)
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Use hints wisely (only 5 available)
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Beat the 30-minute timer
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Climb the individual leaderboard!
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserNameInput;