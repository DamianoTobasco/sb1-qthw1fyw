/*
  # Create user goals table and policies

  1. New Tables
    - `user_goals`: Stores personalized fitness goals for users
      - `id` (uuid, primary key)
      - `user_id` (uuid, unique)
      - `goal_path` (text)
      - `training_intensity` (text)
      - `daily_calories` (integer)
      - `protein_target` (integer)
      - `carbs_target` (integer)
      - `fats_target` (integer)
      - `recommended_workouts` (integer)
      - Timestamps for created_at and updated_at

  2. Security
    - Enable RLS
    - Add policies for viewing and updating goals
*/

-- Create user_goals table
CREATE TABLE IF NOT EXISTS user_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  goal_path text NOT NULL,
  training_intensity text NOT NULL,
  daily_calories integer NOT NULL,
  protein_target integer NOT NULL,
  carbs_target integer NOT NULL,
  fats_target integer NOT NULL,
  recommended_workouts integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

-- Create policies with unique names
CREATE POLICY "view_own_goals"
  ON user_goals
  FOR SELECT
  USING (true);

CREATE POLICY "insert_own_goals"
  ON user_goals
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "update_own_goals"
  ON user_goals
  FOR UPDATE
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS user_goals_user_id_idx ON user_goals (user_id);