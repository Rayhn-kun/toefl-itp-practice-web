import React from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import UserNameInput from '@/components/UserNameInput';
import Quiz from '@/components/Quiz';
import QuizResults from '@/components/QuizResults';
import Admin from '@/components/Admin';

export default function Index() {
  const { state } = useQuiz();

  // Show admin panel if showAdmin is true
  if (state.showAdmin) {
    return <Admin />;
  }

  // Show results if quiz is completed
  if (state.isQuizCompleted) {
    return <QuizResults />;
  }

  // Show quiz if user has started
  if (state.isQuizStarted && state.userName) {
    return <Quiz />;
  }

  // Show name input by default (no login required)
  return <UserNameInput />;
}