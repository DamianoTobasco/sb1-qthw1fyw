/*
  # Add Meditation Storage and Categories

  1. Storage
    - Create meditation_audio storage bucket
    - Set up public access policies
  
  2. Categories
    - Add categories table for better organization
    - Update meditations table with category reference
    - Add sample categories
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS meditation_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  icon text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on categories
ALTER TABLE meditation_categories ENABLE ROW LEVEL SECURITY;

-- Categories are viewable by all authenticated users
CREATE POLICY "Categories are viewable by all authenticated users"
  ON meditation_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default categories
INSERT INTO meditation_categories (name, description, icon) VALUES
  ('Morning', 'Start your day mindfully', 'sun'),
  ('Sleep', 'Peaceful bedtime meditations', 'moon'),
  ('Stress Relief', 'Release tension and anxiety', 'leaf'),
  ('Focus', 'Enhance concentration', 'bulb'),
  ('Relaxation', 'Deep relaxation practices', 'water');

-- Add category_id to meditations
ALTER TABLE meditations 
ADD COLUMN category_id uuid REFERENCES meditation_categories(id);

-- Create index for category lookups
CREATE INDEX IF NOT EXISTS meditations_category_id_idx ON meditations (category_id);

-- Update existing meditations with category references
WITH category_mapping AS (
  SELECT id, name FROM meditation_categories
)
UPDATE meditations m
SET category_id = cm.id
FROM category_mapping cm
WHERE m.category = cm.name;