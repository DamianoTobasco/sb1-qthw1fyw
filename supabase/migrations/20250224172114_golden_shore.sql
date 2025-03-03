/*
  # Create Meditation Tables

  1. New Tables
    - `meditations`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `duration` (integer, minutes)
      - `image_url` (text)
      - `audio_url` (text)
      - `category` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `meditation_favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `meditation_id` (uuid, references meditations)
      - `created_at` (timestamptz)

    - `meditation_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `meditation_id` (uuid, references meditations)
      - `completed_at` (timestamptz)
      - `duration_seconds` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - View all meditations
      - Manage their own favorites
      - Track their meditation history
*/

-- Create meditations table
CREATE TABLE IF NOT EXISTS meditations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  duration integer NOT NULL,
  image_url text NOT NULL,
  audio_url text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create meditation_favorites table
CREATE TABLE IF NOT EXISTS meditation_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  meditation_id uuid REFERENCES meditations NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, meditation_id)
);

-- Create meditation_history table
CREATE TABLE IF NOT EXISTS meditation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  meditation_id uuid REFERENCES meditations NOT NULL,
  completed_at timestamptz NOT NULL,
  duration_seconds integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE meditations ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_history ENABLE ROW LEVEL SECURITY;

-- Policies for meditations table
CREATE POLICY "Meditations are viewable by all authenticated users"
  ON meditations
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for meditation_favorites table
CREATE POLICY "Users can view their own favorites"
  ON meditation_favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
  ON meditation_favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
  ON meditation_favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for meditation_history table
CREATE POLICY "Users can view their own meditation history"
  ON meditation_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their meditation history"
  ON meditation_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS meditations_category_idx ON meditations (category);
CREATE INDEX IF NOT EXISTS meditation_favorites_user_id_idx ON meditation_favorites (user_id);
CREATE INDEX IF NOT EXISTS meditation_history_user_id_idx ON meditation_history (user_id);
CREATE INDEX IF NOT EXISTS meditation_history_completed_at_idx ON meditation_history (completed_at);

-- Insert sample meditation data
INSERT INTO meditations (title, description, duration, image_url, audio_url, category) VALUES
  (
    'Morning Mindfulness',
    'Start your day with clarity and purpose through this guided morning meditation.',
    10,
    'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?q=80&w=1000',
    'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/morning-mindfulness.mp3',
    'Morning'
  ),
  (
    'Deep Relaxation',
    'Release tension and find deep relaxation with this soothing meditation.',
    15,
    'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?q=80&w=1000',
    'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/deep-relaxation.mp3',
    'Relaxation'
  ),
  (
    'Stress Relief',
    'Let go of stress and anxiety with this calming meditation practice.',
    20,
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000',
    'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/stress-relief.mp3',
    'Stress Relief'
  ),
  (
    'Better Sleep',
    'Drift into peaceful sleep with this gentle bedtime meditation.',
    30,
    'https://images.unsplash.com/photo-1511295742362-92c96b1cf484?q=80&w=1000',
    'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/better-sleep.mp3',
    'Sleep'
  ),
  (
    'Focus & Concentration',
    'Enhance your focus and mental clarity with this meditation technique.',
    15,
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000',
    'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/focus-concentration.mp3',
    'Focus'
  );