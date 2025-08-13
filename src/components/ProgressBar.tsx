import React from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

const ProgressBar: React.FC = () => {
  const { state } = useQuiz();
  
  const progress = ((state.currentQuestionIndex + 1) / state.questions.length) * 100;
  const answeredCount = state.userAnswers.length;
  const correctCount = state.userAnswers.filter(answer => answer.isCorrect).length;
  
  const structureAnswered = state.userAnswers.filter(answer => {
    const question = state.questions.find(q => q.id === answer.questionId);
    return question?.type === 'structure';
  }).length;
  
  const writtenExpressionAnswered = state.userAnswers.filter(answer => {
    const question = state.questions.find(q => q.id === answer.questionId);
    return question?.type === 'written_expression';
  }).length;

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Quiz Progress</span>
              <span>{state.currentQuestionIndex + 1} / {state.questions.length}</span>
            </div>
            <Progress value={progress} className="w-full h-2" />
          </div>
          
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600">{answeredCount}</div>
              <div className="text-xs text-gray-500">Answered</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">{correctCount}</div>
              <div className="text-xs text-gray-500">Correct</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-600">{structureAnswered}</div>
              <div className="text-xs text-gray-500">Structure</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-indigo-600">{writtenExpressionAnswered}</div>
              <div className="text-xs text-gray-500">Written Exp</div>
            </div>
          </div>
          
          {/* Question Status Grid */}
          <div className="grid grid-cols-10 gap-1">
            {state.questions.map((question, index) => {
              const isAnswered = state.userAnswers.some(answer => answer.questionId === question.id);
              const isCorrect = state.userAnswers.find(answer => answer.questionId === question.id)?.isCorrect;
              const isCurrent = index === state.currentQuestionIndex;
              
              let icon = <Circle className="w-3 h-3" />;
              let colorClass = "text-gray-300";
              
              if (isAnswered) {
                icon = <CheckCircle className="w-3 h-3" />;
                colorClass = isCorrect ? "text-green-500" : "text-red-500";
              }
              
              if (isCurrent) {
                icon = <AlertCircle className="w-3 h-3" />;
                colorClass = "text-blue-500";
              }
              
              return (
                <div
                  key={question.id}
                  className={`flex items-center justify-center p-1 rounded ${colorClass} ${
                    question.type === 'structure' ? 'bg-blue-50' : 'bg-purple-50'
                  }`}
                  title={`Question ${index + 1} - ${question.type}`}
                >
                  {icon}
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="flex justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-50 rounded"></div>
              <span>Structure</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-purple-50 rounded"></div>
              <span>Written Expression</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressBar;