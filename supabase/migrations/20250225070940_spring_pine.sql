-- Create food_logs table
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

-- Enable Row Level Security
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create their own food logs" ON food_logs;
DROP POLICY IF EXISTS "Users can view their own food logs" ON food_logs;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON food_logs;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON food_logs;

-- Create new policies
CREATE POLICY "Enable read access for all users"
  ON food_logs
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON food_logs
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS food_logs_user_id_idx ON food_logs (user_id);
CREATE INDEX IF NOT EXISTS food_logs_logged_at_idx ON food_logs (logged_at);