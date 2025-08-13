export interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  type: 'structure' | 'written_expression';
}

export interface QuizData {
  title: string;
  description: string;
  time_limit: number;
  questions: Question[];
}

export interface UserAnswer {
  questionId: number;
  selectedOption: number;
  isCorrect: boolean;
  timeSpent: number;
}

export interface QuizResult {
  userName: string;
  score: number;
  totalQuestions: number;
  timeElapsed: number;
  answers: UserAnswer[];
  structureScore: number;
  writtenExpressionScore: number;
  completedAt: Date;
}

export interface Booster {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: number;
  effect: 'skip' | 'hint' | 'time_freeze' | 'double_points';
}

export interface GroupMember {
  id: number;
  name: string;
  score?: number;
  rank?: number;
  completedAt?: Date;
}