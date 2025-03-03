-- Create workout_logs table
CREATE TABLE IF NOT EXISTS workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL,
  exercise text NOT NULL,
  sets integer NOT NULL,
  reps integer NOT NULL,
  weight numeric NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for workout logs
CREATE POLICY "Enable read access for all users"
  ON workout_logs
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON workout_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
  ON workout_logs
  FOR UPDATE
  USING (true);

CREATE POLICY "Enable delete access for all users"
  ON workout_logs
  FOR DELETE
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS workout_logs_user_id_idx ON workout_logs (user_id);
CREATE INDEX IF NOT EXISTS workout_logs_date_idx ON workout_logs (date);
CREATE INDEX IF NOT EXISTS workout_logs_user_date_idx ON workout_logs (user_id, date);

-- Insert sample data for the test user
INSERT INTO workout_logs (user_id, date, exercise, sets, reps, weight, notes)
VALUES 
  ('123e4567-e89b-12d3-a456-426614174000', CURRENT_DATE, 'Bench Press', 4, 10, 185, 'Increased weight by 5lbs'),
  ('123e4567-e89b-12d3-a456-426614174000', CURRENT_DATE, 'Squats', 3, 12, 225, 'Focused on form')
ON CONFLICT DO NOTHING;