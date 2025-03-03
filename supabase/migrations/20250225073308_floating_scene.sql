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
CREATE POLICY "Users can view their own activity"
  ON user_activity
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own activity"
  ON user_activity
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own activity"
  ON user_activity
  FOR UPDATE
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS user_activity_user_id_idx ON user_activity (user_id);
CREATE INDEX IF NOT EXISTS user_activity_last_login_idx ON user_activity (last_login);