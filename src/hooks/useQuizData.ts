import { useState, useEffect } from 'react';
import { QuizData } from '@/types/quiz';

export const useQuizData = () => {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/questions.json');
        
        if (!response.ok) {
          throw new Error('Failed to load quiz data');
        }
        
        const data: QuizData = await response.json();
        setQuizData(data);
      } catch (err) {
        console.error('Error loading quiz data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load quiz data');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, []);

  return { quizData, loading, error };
};