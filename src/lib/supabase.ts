import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Supabase configuration
const supabaseUrl = 'https://pxwicfzjmptobvyhonhv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4d2ljZnpqbXB0b2J2eWhvbmh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NDM3OTUsImV4cCI6MjA3MDMxOTc5NX0.ZSHrAJEcz1qDm3M2rK9ry_1Yl8cJh8xakh6rQ6Ea4gE';

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