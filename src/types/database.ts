export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      quiz_results: {
        Row: {
          id: number
          userName: string
          score: number
          totalQuestions: number
          timeElapsed: number
          structureScore: number
          writtenExpressionScore: number
          completedAt: string
          answers: Json
          isAdmin: boolean
        }
        Insert: {
          id?: number
          userName: string
          score: number
          totalQuestions: number
          timeElapsed: number
          structureScore: number
          writtenExpressionScore: number
          completedAt?: string
          answers: Json
          isAdmin?: boolean
        }
        Update: {
          id?: number
          userName?: string
          score?: number
          totalQuestions?: number
          timeElapsed?: number
          structureScore?: number
          writtenExpressionScore?: number
          completedAt?: string
          answers?: Json
          isAdmin?: boolean
        }
      }
      students: {
        Row: {
          id: number
          name: string
          hasCompleted: boolean
          isAdmin: boolean
          isExcluded: boolean
        }
        Insert: {
          id?: number
          name: string
          hasCompleted?: boolean
          isAdmin?: boolean
          isExcluded?: boolean
        }
        Update: {
          id?: number
          name?: string
          hasCompleted?: boolean
          isAdmin?: boolean
          isExcluded?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}