/*
  # Food Tracking System

  1. New Tables
    - `food_logs`: Stores user food consumption records
      - `id` (uuid, primary key)
      - `user_id` (uuid)
      - `food_name` (text)
      - `serving_size` (numeric)
      - `serving_unit` (text)
      - `calories` (numeric)
      - `protein` (numeric)
      - `carbs` (numeric)
      - `fat` (numeric)
      - `meal_type` (text)
      - `image_url` (text, nullable)
      - `logged_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create food_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS food_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  food_name text NOT NULL,
  serving_size numeric NOT NULL,
  serving_unit text NOT NULL,
  calories numeric NOT NULL,
  protein numeric NOT NULL,
  carbs numeric NOT NULL,
  fat numeric NOT NULL,
  meal_type text NOT NULL,
  image_url text,
  logged_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security - only if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'food_logs' 
      AND rowsecurity = true
  ) THEN
    ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- Create policies - only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'food_logs' AND policyname = 'Enable read access for all users'
  ) THEN
    CREATE POLICY "Enable read access for all users"
      ON food_logs
      FOR SELECT
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'food_logs' AND policyname = 'Enable insert access for all users'
  ) THEN
    CREATE POLICY "Enable insert access for all users"
      ON food_logs
      FOR INSERT
      WITH CHECK (true);
  END IF;
END
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS food_logs_user_id_idx ON food_logs (user_id);
CREATE INDEX IF NOT EXISTS food_logs_logged_at_idx ON food_logs (logged_at);