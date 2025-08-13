import React, { useEffect } from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import QuestionCard from '@/components/QuestionCard';
import Timer from '@/components/Timer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User, Trophy, Target, Clock, Lightbulb, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const Quiz: React.FC = () => {
  const { state, dispatch } = useQuiz();

  useEffect(() => {
    // Load questions when quiz starts
    if (state.questions.length === 0) {
      loadQuestions();
    }
  }, [state.questions.length]);

  useEffect(() => {
    // Auto-submit when time runs out
    if (state.timeRemaining <= 0 && state.isQuizStarted && !state.isQuizCompleted) {
      const allAnswered = state.answers.every(answer => answer !== -1);
      
      if (allAnswered) {
        dispatch({ type: 'SUBMIT_QUIZ' });
        toast.error('⏰ Time\'s up! Quiz auto-submitted.', {
          description: 'Your quiz has been submitted automatically.'
        });
      } else {
        // Force completion even with unanswered questions when time runs out
        dispatch({ type: 'SUBMIT_QUIZ' });
        toast.error('⏰ Time\'s up! Quiz submitted with incomplete answers.', {
          description: 'Some questions were left unanswered.'
        });
      }
    }
  }, [state.timeRemaining, state.isQuizStarted, state.isQuizCompleted, state.answers, dispatch]);

  const loadQuestions = async () => {
    try {
      const response = await fetch('/data/questions.json');
      const data = await response.json();
      dispatch({ type: 'SET_QUESTIONS', payload: data.questions });
      toast.success('🎯 Quiz loaded successfully!', {
        description: '30 questions ready for the challenge!'
      });
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('❌ Failed to load questions', {
        description: 'Please refresh and try again'
      });
    }
  };

  if (state.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Quiz...</h3>
            <p className="text-gray-600">Preparing your TOEFL challenge!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate statistics
  const answeredCount = state.answers.filter(a => a !== -1).length;
  const progressPercentage = Math.round((answeredCount / 30) * 100);
  const structureAnswered = state.answers.slice(0, 15).filter(a => a !== -1).length;
  const writtenExpressionAnswered = state.answers.slice(15, 30).filter(a => a !== -1).length;
  const allAnswered = state.answers.every(answer => answer !== -1);

  // Game statistics
  const gameStats = {
    totalQuestions: state.questions.length,
    currentQuestion: state.currentQuestionIndex + 1,
    progressPercent: progressPercentage,
    hintsUsed: 5 - state.hintsRemaining,
    timeElapsed: 1800 - state.timeRemaining,
    isOnTrack: state.timeRemaining > (state.questions.length - state.currentQuestionIndex - 1) * 60,
    canSubmit: allAnswered
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        
        {/* Header with Player Info */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{state.userName}</h2>
                  <p className="text-sm text-gray-600">🎯 TOEFL ITP Challenge</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{gameStats.currentQuestion}</div>
                  <div className="text-xs text-gray-600">of {gameStats.totalQuestions}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{answeredCount}</div>
                  <div className="text-xs text-gray-600">answered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{state.hintsRemaining}</div>
                  <div className="text-xs text-gray-600">hints left</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timer */}
        <Timer />

        {/* Enhanced Progress Dashboard */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Overall Progress */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  Overall Progress
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion Rate</span>
                    <span className="font-semibold">{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                  <div className="text-xs text-gray-600">
                    {answeredCount} of 30 questions completed
                  </div>
                </div>
              </div>

              {/* Structure Progress */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  Structure (1-15)
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-semibold">{Math.round((structureAnswered / 15) * 100)}%</span>
                  </div>
                  <Progress value={(structureAnswered / 15) * 100} className="h-3" />
                  <div className="text-xs text-gray-600">
                    {structureAnswered}/15 answered
                  </div>
                </div>
              </div>

              {/* Written Expression Progress */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  Written Expression (16-30)
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-semibold">{Math.round((writtenExpressionAnswered / 15) * 100)}%</span>
                  </div>
                  <Progress value={(writtenExpressionAnswered / 15) * 100} className="h-3" />
                  <div className="text-xs text-gray-600">
                    {writtenExpressionAnswered}/15 answered
                  </div>
                </div>
              </div>
            </div>

            {/* Game Status Indicators */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Badge 
                variant={gameStats.isOnTrack ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                <Clock className="w-3 h-3" />
                {gameStats.isOnTrack ? '✅ Good pace' : '⚠️ Behind schedule'}
              </Badge>
              
              <Badge 
                variant={state.hintsRemaining > 2 ? "default" : "secondary"}
                className="flex items-center gap-1"
              >
                <Lightbulb className="w-3 h-3" />
                {state.hintsRemaining > 2 ? `💡 ${state.hintsRemaining} hints available` : `⚡ ${state.hintsRemaining} hints left`}
              </Badge>
              
              <Badge 
                variant={gameStats.canSubmit ? "default" : "outline"}
                className="flex items-center gap-1"
              >
                <Shield className="w-3 h-3" />
                {gameStats.canSubmit ? '🔓 Ready to submit' : '🔒 Submit protection active'}
              </Badge>
              
              <Badge 
                variant={progressPercentage >= 75 ? "default" : "secondary"}
                className="flex items-center gap-1"
              >
                <Trophy className="w-3 h-3" />
                {progressPercentage >= 75 ? '🏆 Excellence track' : '📈 Keep going!'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Critical Alerts */}
        {(state.timeRemaining <= 300 || (!allAnswered && state.currentQuestionIndex >= 25)) && (
          <Card className="shadow-lg border-2 border-orange-300 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-orange-800 mb-1">⚠️ Critical Alert!</h4>
                  <div className="space-y-1 text-sm text-orange-700">
                    {state.timeRemaining <= 300 && (
                      <p>🕐 Less than 5 minutes remaining! Speed up your responses.</p>
                    )}
                    {!allAnswered && state.currentQuestionIndex >= 25 && (
                      <p>🔒 You have {30 - answeredCount} unanswered questions. Complete them to unlock submission.</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Question Card */}
        <QuestionCard />

        {/* Quick Navigation */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Navigate to question:
              </div>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: Math.min(10, state.questions.length) }, (_, i) => {
                  const questionIndex = Math.floor(i * state.questions.length / 10);
                  const isAnswered = state.answers[questionIndex] !== -1;
                  const isCurrent = questionIndex === state.currentQuestionIndex;
                  
                  return (
                    <Button
                      key={i}
                      variant={isCurrent ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        for (let j = 0; j < questionIndex - state.currentQuestionIndex; j++) {
                          dispatch({ type: 'NEXT_QUESTION' });
                        }
                        for (let j = 0; j < state.currentQuestionIndex - questionIndex; j++) {
                          dispatch({ type: 'PREVIOUS_QUESTION' });
                        }
                      }}
                      className={`w-8 h-8 p-0 ${isAnswered ? 'bg-green-100 border-green-300' : ''} ${isCurrent ? 'ring-2 ring-blue-400' : ''}`}
                    >
                      {questionIndex + 1}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;