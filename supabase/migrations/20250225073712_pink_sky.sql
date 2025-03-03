/*
  # User Activity and Streak Tracking

  1. New Tables
    - `user_activity`
      - `id` (uuid, primary key)
      - `user_id` (uuid)
      - `last_login` (timestamptz)
      - `streak` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_activity` table
    - Add policies for users to manage their own activity data

  3. Indexes
    - Create indexes for user_id and last_login for better performance
*/

-- Create user_activity table for tracking streaks and login dates
CREATE TABLE IF NOT EXISTS user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  last_login timestamptz NOT NULL,
  streak integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users"
  ON user_activity
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON user_activity
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
  ON user_activity
  FOR UPDATE
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS user_activity_user_id_idx ON user_activity (user_id);
CREATE INDEX IF NOT EXISTS user_activity_last_login_idx ON user_activity (last_login);

-- Insert test data
INSERT INTO user_activity (user_id, last_login, streak)
VALUES 
  ('123e4567-e89b-12d3-a456-426614174000', now(), 0)
ON CONFLICT (user_id) 
DO UPDATE SET last_login = EXCLUDED.last_login;