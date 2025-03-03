/*
  # Food Tracking System

  1. New Tables
    - `food_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `food_name` (text)
      - `serving_size` (numeric)
      - `serving_unit` (text)
      - `calories` (numeric)
      - `protein` (numeric)
      - `carbs` (numeric)
      - `fat` (numeric)
      - `meal_type` (text)
      - `image_url` (text)
      - `logged_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create food_logs table
CREATE TABLE IF NOT EXISTS food_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
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

-- Enable Row Level Security
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own food logs"
  ON food_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own food logs"
  ON food_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS food_logs_user_id_idx ON food_logs (user_id);
CREATE INDEX IF NOT EXISTS food_logs_logged_at_idx ON food_logs (logged_at);