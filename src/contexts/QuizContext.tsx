import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Question, UserAnswer, QuizResult } from '@/types/quiz';

interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: UserAnswer[];
  answers: number[];
  timeRemaining: number;
  isQuizStarted: boolean;
  isQuizCompleted: boolean;
  userName: string;
  hintsRemaining: number;
  results: QuizResult[];
  isSubmitted: boolean;
  showAdmin: boolean;
}

type QuizAction =
  | { type: 'SET_QUESTIONS'; payload: Question[] }
  | { type: 'SET_USER_NAME'; payload: string }
  | { type: 'START_QUIZ' }
  | { type: 'ANSWER_QUESTION'; payload: UserAnswer }
  | { type: 'SET_ANSWER'; payload: { questionIndex: number; answerIndex: number } }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREVIOUS_QUESTION' }
  | { type: 'SET_TIME_REMAINING'; payload: number }
  | { type: 'COMPLETE_QUIZ'; payload: QuizResult }
  | { type: 'USE_HINT' }
  | { type: 'SUBMIT_QUIZ' }
  | { type: 'RESET_QUIZ' }
  | { type: 'SET_SHOW_ADMIN'; payload: boolean };

const initialState: QuizState = {
  questions: [],
  currentQuestionIndex: 0,
  userAnswers: [],
  answers: new Array(30).fill(-1), // -1 means no answer selected
  timeRemaining: 1800, // 30 minutes in seconds
  isQuizStarted: false,
  isQuizCompleted: false,
  userName: '',
  hintsRemaining: 5,
  results: [],
  isSubmitted: false,
  showAdmin: false
};

const quizReducer = (state: QuizState, action: QuizAction): QuizState => {
  switch (action.type) {
    case 'SET_QUESTIONS':
      return { ...state, questions: action.payload };
    case 'SET_USER_NAME':
      return { ...state, userName: action.payload };
    case 'START_QUIZ':
      return { ...state, isQuizStarted: true };
    case 'ANSWER_QUESTION': {
      const existingAnswerIndex = state.userAnswers.findIndex(
        answer => answer.questionId === action.payload.questionId
      );
      const updatedAnswers = existingAnswerIndex >= 0
        ? state.userAnswers.map((answer, index) =>
            index === existingAnswerIndex ? action.payload : answer
          )
        : [...state.userAnswers, action.payload];
      return { ...state, userAnswers: updatedAnswers };
    }
    case 'SET_ANSWER': {
      const newAnswers = [...state.answers];
      newAnswers[action.payload.questionIndex] = action.payload.answerIndex;
      return { ...state, answers: newAnswers };
    }
    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, state.questions.length - 1)
      };
    case 'PREVIOUS_QUESTION':
      return {
        ...state,
        currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0)
      };
    case 'SET_TIME_REMAINING':
      return { ...state, timeRemaining: action.payload };
    case 'USE_HINT':
      return {
        ...state,
        hintsRemaining: Math.max(0, state.hintsRemaining - 1)
      };
    case 'SUBMIT_QUIZ':
      return {
        ...state,
        isSubmitted: true,
        isQuizCompleted: true
      };
    case 'COMPLETE_QUIZ':
      return {
        ...state,
        isQuizCompleted: true,
        results: [...state.results, action.payload]
      };
    case 'RESET_QUIZ':
      return { 
        ...initialState, 
        questions: state.questions, // Keep questions loaded
        results: state.results 
      };
    case 'SET_SHOW_ADMIN':
      return {
        ...state,
        showAdmin: action.payload
      };
    default:
      return state;
  }
};

const QuizContext = createContext<{
  state: QuizState;
  dispatch: React.Dispatch<QuizAction>;
} | null>(null);

export const QuizProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  
  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};