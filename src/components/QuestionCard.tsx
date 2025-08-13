import React, { useState, useEffect } from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Lightbulb, Target, Zap, AlertTriangle, Shield, Lock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const QuestionCard: React.FC = () => {
  const { state, dispatch } = useQuiz();
  const [showHint, setShowHint] = useState(false);
  const [submitConfirmation, setSubmitConfirmation] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string>('');

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const selectedAnswer = state.answers[state.currentQuestionIndex];

  // Reset selection state when question changes
  useEffect(() => {
    setShowHint(false);
    setSubmitConfirmation(false);
    // Clear the local selection state to ensure radio buttons reset
    const currentAnswer = state.answers[state.currentQuestionIndex];
    setSelectedValue(currentAnswer !== -1 ? currentAnswer.toString() : '');
    
    // Force reset all radio buttons when navigating
    const radioInputs = document.querySelectorAll('input[type="radio"]');
    radioInputs.forEach((input: any) => {
      input.checked = false;
      if (currentAnswer !== -1 && input.value === currentAnswer.toString()) {
        input.checked = true;
      }
    });
  }, [state.currentQuestionIndex, state.answers]);
  
  // Force reset radio selection when navigating between questions
  useEffect(() => {
    // This will ensure the radio selection is properly reset
    const radioInputs = document.querySelectorAll('input[type="radio"]');
    radioInputs.forEach((input: any) => {
      if (!input.checked && input.value !== selectedValue) {
        input.checked = false;
      }
    });
  }, [state.currentQuestionIndex, selectedValue]);
  
  // This effect ensures the radio selection is properly synced with the answer state
  useEffect(() => {
    const currentAnswer = state.answers[state.currentQuestionIndex];
    if (currentAnswer !== -1 && selectedValue !== currentAnswer.toString()) {
      setSelectedValue(currentAnswer.toString());
    } else if (currentAnswer === -1 && selectedValue !== '') {
      setSelectedValue('');
    }
  }, [state.currentQuestionIndex, state.answers, selectedValue]);

  if (!currentQuestion) return null;

  const handleOptionSelect = (value: string) => {
    const optionIndex = parseInt(value);
    setSelectedValue(value);
    
    dispatch({ 
      type: 'SET_ANSWER', 
      payload: { 
        questionIndex: state.currentQuestionIndex, 
        answerIndex: optionIndex 
      } 
    });
    
    // Force update the radio button selection
    setTimeout(() => {
      const radioInputs = document.querySelectorAll('input[type="radio"]');
      radioInputs.forEach((input: any) => {
        if (input.value === value) {
          input.checked = true;
        } else {
          input.checked = false;
        }
      });
    }, 10);
    
    toast.success('✅ Answer saved!', {
      description: `Question ${state.currentQuestionIndex + 1} answered!`
    });
  };

  const handleNextQuestion = () => {
    if (state.currentQuestionIndex < state.questions.length - 1) {
      // First dispatch the action to move to the next question
      dispatch({ type: 'NEXT_QUESTION' });
      
      // Reset selected value when moving to next question
      setSelectedValue('');
      
      // After moving to the next question, check if it has an answer already
      const nextQuestionIndex = state.currentQuestionIndex + 1;
      const nextQuestionAnswer = state.answers[nextQuestionIndex];
      
      // Only set the selected value if the next question has an answer
      if (nextQuestionAnswer !== -1) {
        setSelectedValue(nextQuestionAnswer.toString());
      } else {
        // Ensure the selected value is reset
        setSelectedValue('');
      }
      
      // Force clear all radio buttons
      setTimeout(() => {
        const radioInputs = document.querySelectorAll('input[type="radio"]');
        radioInputs.forEach((input: any) => {
          // Reset all radio buttons first
          input.checked = false;
          
          // Then set the correct one if there's an answer
          if (nextQuestionAnswer !== -1 && input.value === nextQuestionAnswer.toString()) {
            input.checked = true;
          }
        });
      }, 50); // Small delay to ensure DOM is updated
    }
  };

  const handlePreviousQuestion = () => {
    if (state.currentQuestionIndex > 0) {
      dispatch({ type: 'PREVIOUS_QUESTION' });
      
      // After moving to the previous question, check if it has an answer already
      const prevQuestionIndex = state.currentQuestionIndex - 1;
      const prevQuestionAnswer = state.answers[prevQuestionIndex];
      
      // Set the selected value based on the previous question's answer
      if (prevQuestionAnswer !== -1) {
        setSelectedValue(prevQuestionAnswer.toString());
      } else {
        setSelectedValue('');
      }
      
      // Force update radio buttons
      setTimeout(() => {
        const radioInputs = document.querySelectorAll('input[type="radio"]');
        radioInputs.forEach((input: any) => {
          // Reset all radio buttons first
          input.checked = false;
          
          // Then set the correct one if there's an answer
          if (prevQuestionAnswer !== -1 && input.value === prevQuestionAnswer.toString()) {
            input.checked = true;
          }
        });
      }, 50); // Small delay to ensure DOM is updated
    }
  };

  const handleUseHint = () => {
    if (state.hintsRemaining > 0) {
      dispatch({ type: 'USE_HINT' });
      setShowHint(true);
      toast.success('💡 Hint revealed!', {
        description: `${state.hintsRemaining - 1} hints remaining`
      });
    } else {
      toast.error('❌ No hints remaining!', {
        description: 'You have used all your hints'
      });
    }
  };

  const handleSubmitQuiz = () => {
    const allAnswered = state.answers.every(answer => answer !== -1);
    const unansweredCount = state.answers.filter(a => a === -1).length;
    
    if (!allAnswered) {
      toast.error('❌ Cannot submit incomplete quiz!', {
        description: `You have ${unansweredCount} unanswered questions. Please complete all questions first.`
      });
      return;
    }

    if (!submitConfirmation) {
      setSubmitConfirmation(true);
      toast.warning('⚠️ Confirm submission', {
        description: 'Click Submit again to confirm your final submission'
      });
      return;
    }

    // Final submission
    dispatch({ type: 'SUBMIT_QUIZ' });
    toast.success('🎉 Quiz submitted successfully!', {
      description: 'Your answers have been recorded. View your results!'
    });
  };

  const getQuestionTypeIcon = () => {
    return currentQuestion.type === 'structure' ? 
      <Target className="w-4 h-4" /> : 
      <Zap className="w-4 h-4" />;
  };

  const getQuestionTypeColor = () => {
    return currentQuestion.type === 'structure' ? 
      'bg-blue-100 text-blue-700 border-blue-200' : 
      'bg-purple-100 text-purple-700 border-purple-200';
  };

  const allAnswered = state.answers.every(answer => answer !== -1);
  const answeredCount = state.answers.filter(a => a !== -1).length;
  const progressPercentage = Math.round((answeredCount / 30) * 100);
  const unansweredCount = 30 - answeredCount;

  // Game features calculations
  const gameStats = {
    questionsLeft: state.questions.length - state.currentQuestionIndex - 1,
    completionRate: progressPercentage,
    timeBonus: state.timeRemaining > 900 ? '🔥 Speed Bonus Active!' : state.timeRemaining > 300 ? '⚡ Good Pace' : '⏰ Time Running Low',
    streakBonus: selectedAnswer !== -1 ? '✅ Question Answered' : '❌ Unanswered'
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl border-2 border-gray-800 bg-gradient-to-br from-gray-900 to-gray-800">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
            🎯 Question {state.currentQuestionIndex + 1} of {state.questions.length}
          </span>
          <span className={`text-sm font-medium px-3 py-1 rounded-full border ${getQuestionTypeColor()}`}>
            {getQuestionTypeIcon()}
            {currentQuestion.type === 'structure' ? 'Structure' : 'Written Expression'}
          </span>
        </div>
        <CardTitle className="text-xl font-bold leading-relaxed">
          {currentQuestion.question}
        </CardTitle>
        
        {/* Enhanced Progress Indicator */}
        <div className="mt-4 bg-white/20 rounded-full p-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span>Progress: {progressPercentage}%</span>
            <span>{answeredCount}/30 answered • {gameStats.questionsLeft} left</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Game Status Bar */}
        <div className="mt-3 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              💡 {state.hintsRemaining} hints
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {gameStats.timeBonus}
            </Badge>
          </div>
          <div className="text-right">
            <div className={selectedAnswer !== -1 ? 'text-green-300' : 'text-orange-300'}>
              {gameStats.streakBonus}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        <RadioGroup
          value={selectedValue}
          onValueChange={handleOptionSelect}
          className="space-y-3"
        >
          {currentQuestion.options.map((option, index) => (
            <div 
              key={index} 
              className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200 hover:bg-gray-700 ${
                selectedAnswer === index ? 'bg-blue-900 border-blue-600 shadow-md' : 'border-gray-700'
              }`}
            >
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label 
                htmlFor={`option-${index}`} 
                className="text-base leading-relaxed cursor-pointer flex-1 py-2 font-medium"
              >
                {option || `Option ${index + 1}`}
              </Label>
              {selectedAnswer === index && (
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              )}
            </div>
          ))}
        </RadioGroup>

        {showHint && (
          <Card className="mt-4 bg-yellow-900/30 border-2 border-yellow-700 animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-yellow-400 mt-0.5 animate-bounce" />
                <div>
                  <h4 className="font-bold text-yellow-400 mb-2 text-lg">💡 Smart Hint Activated:</h4>
                  <p className="text-yellow-300 leading-relaxed">{currentQuestion.explanation}</p>
                  <div className="mt-2 text-xs text-yellow-400">
                    💰 Hint cost: 1 • Remaining: {state.hintsRemaining} hints
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Submit Protection */}
        {state.currentQuestionIndex === state.questions.length - 1 && (
          <Card className={`border-2 ${allAnswered ? 'bg-green-900/30 border-green-700' : 'bg-red-900/30 border-red-700'}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {allAnswered ? (
                  <Shield className="w-6 h-6 text-green-400 mt-0.5" />
                ) : (
                  <Lock className="w-6 h-6 text-red-400 mt-0.5" />
                )}
                <div>
                  <h4 className={`font-bold mb-2 ${allAnswered ? 'text-green-400' : 'text-red-400'}`}>
                    {allAnswered ? '🎉 Ready to Submit!' : '🚫 Submit Protection Active'}
                  </h4>
                  {allAnswered ? (
                    <div>
                      <p className="text-green-300 mb-2">
                        ✅ All 30 questions answered! You can now submit your quiz.
                      </p>
                      {submitConfirmation && (
                        <div className="mt-2 p-2 bg-orange-900/30 rounded border-orange-700 border">
                          <p className="text-orange-300 text-sm font-semibold">
                            ⚠️ Final confirmation required! Click Submit again to finalize.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-red-300 mb-2">
                        ❌ You have {unansweredCount} unanswered questions.
                      </p>
                      <p className="text-red-400 text-sm">
                        🔒 Anti-cheat protection: All questions must be completed before submission.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Navigation */}
        <div className="flex items-center justify-between pt-6 border-t-2 border-gray-200">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={state.currentQuestionIndex === 0}
            className="flex items-center gap-2 px-6 py-2 hover:bg-gray-100"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex gap-3">
            {/* Enhanced Hint Button */}
            {state.hintsRemaining > 0 ? (
              <Button
                variant="secondary"
                onClick={handleUseHint}
                className="flex items-center gap-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300 px-4 py-2"
              >
                <Lightbulb className="w-4 h-4" />
                💡 Use Hint ({state.hintsRemaining})
              </Button>
            ) : (
              <Button
                variant="secondary"
                disabled
                className="flex items-center gap-2 bg-gray-100 text-gray-400 border border-gray-200 px-4 py-2"
              >
                <Lightbulb className="w-4 h-4" />
                No hints left
              </Button>
            )}

            {/* Submit or Next Button */}
            {state.currentQuestionIndex === state.questions.length - 1 ? (
              <Button
                onClick={handleSubmitQuiz}
                disabled={!allAnswered}
                className={`flex items-center gap-2 px-8 py-3 text-white font-bold text-lg ${
                  allAnswered 
                    ? submitConfirmation
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 animate-pulse'
                      : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {submitConfirmation ? (
                  <>
                    <Shield className="w-5 h-5" />
                    🔐 Confirm & Submit!
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5" />
                    🏁 Submit Quiz
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                disabled={state.currentQuestionIndex >= state.questions.length - 1}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 px-6 py-2 text-white"
              >
                Next Question
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Progress Summary */}
        <div className="text-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
          <div className="flex justify-center items-center gap-4">
            <span>📊 Progress: {answeredCount}/30 complete</span>
            <span>•</span>
            <span>💡 Hints used: {5 - state.hintsRemaining}/5</span>
            <span>•</span>
            <span>⏱️ Time left: {Math.floor(state.timeRemaining / 60)}:{(state.timeRemaining % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;