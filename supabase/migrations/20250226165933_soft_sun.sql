-- Ensure we can see all meditations in the query
ALTER TABLE meditations DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with a policy that allows all users to view meditations
ALTER TABLE meditations ENABLE ROW LEVEL SECURITY;

-- Create or replace the policy to ensure all users can view meditations
DROP POLICY IF EXISTS "meditations_visible_to_all" ON meditations;
CREATE POLICY "meditations_visible_to_all" 
  ON meditations 
  FOR SELECT 
  USING (true);

-- Check if we need to fix any broken URLs
UPDATE meditations
SET audio_url = REPLACE(audio_url, '/storage/v1/object/public/Sounds/', '/storage/v1/object/public/meditations/')
WHERE audio_url LIKE '%/storage/v1/object/public/Sounds/%';

-- Create a simpler table view for debugging
CREATE OR REPLACE VIEW meditation_debug AS
SELECT id, title, category, audio_url
FROM meditations
ORDER BY title;

-- Insert some guaranteed working test data - avoid ON CONFLICT clause
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM meditations WHERE title = 'Test Meditation') THEN
    INSERT INTO meditations (
      title,
      description,
      duration,
      image_url,
      audio_url,
      category
    )
    VALUES (
      'Test Meditation',
      'Test meditation to verify the functionality',
      10,
      'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5',
      'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/stress-relief.mp3',
      'Test'
    );
  END IF;
END $$;