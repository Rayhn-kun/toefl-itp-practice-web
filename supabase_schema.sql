-- Membuat tabel quiz_results
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id SERIAL PRIMARY KEY,
  userName TEXT NOT NULL,
  score INTEGER NOT NULL,
  totalQuestions INTEGER DEFAULT 30,
  timeElapsed INTEGER NOT NULL,
  structureScore INTEGER NOT NULL,
  writtenExpressionScore INTEGER NOT NULL,
  completedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answers JSONB NOT NULL,
  isAdmin BOOLEAN DEFAULT FALSE
);

-- Membuat tabel students
CREATE TABLE IF NOT EXISTS public.students (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  hasCompleted BOOLEAN DEFAULT FALSE,
  isAdmin BOOLEAN DEFAULT FALSE,
  isExcluded BOOLEAN DEFAULT FALSE
);

-- Catatan: Jalankan SQL ini di panel SQL di dashboard Supabase
-- untuk membuat tabel yang diperlukan oleh aplikasi.