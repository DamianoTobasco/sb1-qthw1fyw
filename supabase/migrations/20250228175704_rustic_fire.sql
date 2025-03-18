/*
  # Create Habits Table

  1. New Tables
    - `habits` - Tracks user habits and streaks
      - `id` (uuid, primary key)
      - `user_id` (uuid)
      - `name` (text)
      - `description` (text)
      - `start_date` (timestamptz)
      - `icon` (text)
      - `color` (text)
      - `target_days` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `habits` table
    - Add policies for authenticated users
*/

-- Create habits table for tracking user habits
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  start_date timestamptz NOT NULL DEFAULT now(),
  icon text,
  color text,
  target_days integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users"
  ON habits
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON habits
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
  ON habits
  FOR UPDATE
  USING (true);

CREATE POLICY "Enable delete access for all users"
  ON habits
  FOR DELETE
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS habits_user_id_idx ON habits (user_id);
CREATE INDEX IF NOT EXISTS habits_start_date_idx ON habits (start_date);

-- Add sample data
INSERT INTO habits (user_id, name, description, start_date, icon, color)
VALUES 
  ('123e4567-e89b-12d3-a456-426614174000', 'No Vaping', 'Quit vaping for good', (CURRENT_DATE - INTERVAL '77 days')::timestamptz, 'ban', '#ff6b6b'),
  ('123e4567-e89b-12d3-a456-426614174000', 'Daily Meditation', 'Meditate for at least 10 minutes', (CURRENT_DATE - INTERVAL '30 days')::timestamptz, 'lotus', '#A163F6'),
  ('123e4567-e89b-12d3-a456-426614174000', 'No Sugar', 'Avoid added sugars', (CURRENT_DATE - INTERVAL '14 days')::timestamptz, 'nutrition', '#38E8E0');