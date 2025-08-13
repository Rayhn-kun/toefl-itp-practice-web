import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Supabase configuration
const supabaseUrl = 'https://toefl-quiz-app.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvZWZsLXF1aXotYXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg3NjU0MzIsImV4cCI6MjAxNDM0MTQzMn0.example-key';

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for database operations
export const saveQuizResult = async (result: any) => {
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .insert([result]);
      
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error saving quiz result:', error);
    return { data: null, error };
  }
};

export const getQuizResults = async () => {
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .order('score', { ascending: false });
      
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    return { data: null, error };
  }
};

export const getStudentResults = async (studentName: string) => {
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('userName', studentName);
      
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching student results:', error);
    return { data: null, error };
  }
};