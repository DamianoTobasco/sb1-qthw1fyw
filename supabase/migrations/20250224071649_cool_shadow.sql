/*
  # Create Food Database Schema

  1. New Tables
    - `food_items`
      - `id` (uuid, primary key)
      - `name` (text)
      - `brand` (text, nullable)
      - `serving_size` (numeric)
      - `serving_unit` (text)
      - `calories` (numeric)
      - `protein` (numeric)
      - `carbs` (numeric)
      - `fat` (numeric)
      - `created_at` (timestamp)

    - `user_food_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `food_item_id` (uuid, references food_items)
      - `servings` (numeric)
      - `meal_type` (text)
      - `logged_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - Read all food items
      - Create and read their own food logs
*/

-- Create food_items table
CREATE TABLE IF NOT EXISTS food_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text,
  serving_size numeric NOT NULL,
  serving_unit text NOT NULL,
  calories numeric NOT NULL,
  protein numeric NOT NULL,
  carbs numeric NOT NULL,
  fat numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_food_logs table
CREATE TABLE IF NOT EXISTS user_food_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  food_item_id uuid REFERENCES food_items NOT NULL,
  servings numeric NOT NULL,
  meal_type text NOT NULL,
  logged_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_food_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Food items are viewable by all authenticated users"
  ON food_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own food logs"
  ON user_food_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own food logs"
  ON user_food_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS food_items_name_idx ON food_items (name);
CREATE INDEX IF NOT EXISTS user_food_logs_user_id_idx ON user_food_logs (user_id);
CREATE INDEX IF NOT EXISTS user_food_logs_logged_at_idx ON user_food_logs (logged_at);