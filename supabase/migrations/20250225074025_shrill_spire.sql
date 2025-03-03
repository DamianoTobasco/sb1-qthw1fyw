/*
  # Update User Activity and Goals Schema

  1. Changes
    - Drop existing policies before recreating them
    - Ensure unique policy names
    - Add test data for user activity

  2. Security
    - Maintain RLS on all tables
    - Update policies with unique names
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON user_activity;
DROP POLICY IF EXISTS "Enable insert access for all users" ON user_activity;
DROP POLICY IF EXISTS "Enable update access for all users" ON user_activity;
DROP POLICY IF EXISTS "Users can view their own activity" ON user_activity;
DROP POLICY IF EXISTS "Users can update their own activity" ON user_activity;

-- Create policies with unique names
CREATE POLICY "user_activity_select" ON user_activity
  FOR SELECT USING (true);

CREATE POLICY "user_activity_insert" ON user_activity
  FOR INSERT WITH CHECK (true);

CREATE POLICY "user_activity_update" ON user_activity
  FOR UPDATE USING (true);

-- Drop existing policies if they exist for user_goals
DROP POLICY IF EXISTS "Enable read access for all users" ON user_goals;
DROP POLICY IF EXISTS "Enable insert access for all users" ON user_goals;
DROP POLICY IF EXISTS "Enable update access for all users" ON user_goals;
DROP POLICY IF EXISTS "view_own_goals" ON user_goals;
DROP POLICY IF EXISTS "insert_own_goals" ON user_goals;
DROP POLICY IF EXISTS "update_own_goals" ON user_goals;

-- Create policies with unique names for user_goals
CREATE POLICY "user_goals_select" ON user_goals
  FOR SELECT USING (true);

CREATE POLICY "user_goals_insert" ON user_goals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "user_goals_update" ON user_goals
  FOR UPDATE USING (true);

-- Insert test data
INSERT INTO user_activity (user_id, last_login, streak)
VALUES 
  ('123e4567-e89b-12d3-a456-426614174000', now(), 0)
ON CONFLICT (user_id) 
DO UPDATE SET last_login = EXCLUDED.last_login;