/*
  # Water tracking tables

  1. New Tables
    - `water_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, not null)
      - `amount` (numeric, not null) - Amount of water in ounces
      - `goal` (numeric, not null) - Daily water goal in ounces
      - `logged_at` (timestamptz, not null)
      - `created_at` (timestamptz, default now())
  2. Security
    - Enable RLS on `water_logs` table
    - Add policies for public access to water logs data
*/

-- Create water_logs table
CREATE TABLE IF NOT EXISTS water_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  goal numeric NOT NULL DEFAULT 64,
  logged_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for water logs
CREATE POLICY "Enable read access for all users"
  ON water_logs
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON water_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
  ON water_logs
  FOR UPDATE
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS water_logs_user_id_idx ON water_logs (user_id);
CREATE INDEX IF NOT EXISTS water_logs_logged_at_idx ON water_logs (logged_at);

-- Insert sample data for the test user
INSERT INTO water_logs (user_id, amount, goal, logged_at)
VALUES 
  ('123e4567-e89b-12d3-a456-426614174000', 32, 64, now())
ON CONFLICT DO NOTHING;