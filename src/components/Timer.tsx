import React, { useEffect } from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

const Timer: React.FC = () => {
  const { state, dispatch } = useQuiz();
  
  useEffect(() => {
    if (!state.isQuizStarted || state.isQuizCompleted) return;
    
    const timer = setInterval(() => {
      dispatch({ type: 'SET_TIME_REMAINING', payload: state.timeRemaining - 1 });
      
      if (state.timeRemaining <= 1) {
        // Auto-complete quiz when time runs out
        const result = {
          userName: state.userName,
          score: state.userAnswers.filter(answer => answer.isCorrect).length,
          totalQuestions: state.questions.length,
          timeElapsed: 1800 - state.timeRemaining,
          answers: state.userAnswers,
          structureScore: state.userAnswers.filter(answer => {
            const question = state.questions.find(q => q.id === answer.questionId);
            return question?.type === 'structure' && answer.isCorrect;
          }).length,
          writtenExpressionScore: state.userAnswers.filter(answer => {
            const question = state.questions.find(q => q.id === answer.questionId);
            return question?.type === 'written_expression' && answer.isCorrect;
          }).length,
          completedAt: new Date()
        };
        dispatch({ type: 'COMPLETE_QUIZ', payload: result });
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [state.timeRemaining, state.isQuizStarted, state.isQuizCompleted, state.userName, state.userAnswers, state.questions, dispatch]);
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const getTimeColor = (): string => {
    if (state.timeRemaining > 600) return 'text-green-600'; // > 10 minutes
    if (state.timeRemaining > 300) return 'text-yellow-600'; // > 5 minutes
    return 'text-red-600'; // < 5 minutes
  };
  
  const getTimerAnimation = (): string => {
    if (state.timeRemaining <= 60) return 'animate-pulse'; // Last minute
    if (state.timeRemaining <= 300) return 'animate-bounce'; // Last 5 minutes
    return '';
  };
  
  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2">
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Clock className={`h-6 w-6 text-blue-600 ${getTimerAnimation()}`} />
          <span className="font-semibold text-gray-700 text-lg">Time Remaining:</span>
          <Badge variant="secondary" className={`text-2xl font-bold ${getTimeColor()} px-4 py-2 ${getTimerAnimation()}`}>
            {formatTime(state.timeRemaining)}
          </Badge>
        </div>
      </div>
      
      {/* Warning messages based on time remaining */}
      {state.timeRemaining <= 300 && state.timeRemaining > 60 && (
        <div className="mt-3 text-center">
          <Badge variant="outline" className="text-yellow-700 border-yellow-400 bg-yellow-50">
            ⚠️ Only 5 minutes left! Speed up!
          </Badge>
        </div>
      )}
      
      {state.timeRemaining <= 60 && (
        <div className="mt-3 text-center">
          <Badge variant="destructive" className="animate-pulse">
            🚨 FINAL MINUTE! Submit now!
          </Badge>
        </div>
      )}
    </Card>
  );
};

export default Timer;