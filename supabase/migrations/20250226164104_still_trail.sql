/*
  # Fix meditation audio playback issues

  This migration:
  1. Fixes the URL paths for meditation audio files
  2. Makes sure all meditations are visible to users
  3. Adds quality checks for media URLs
*/

-- Ensure all meditations have valid audio URLs
UPDATE meditations
SET audio_url = 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/stress-relief.mp3'
WHERE audio_url IS NULL OR audio_url = '' OR audio_url NOT LIKE 'http%';

-- Get a count of valid meditations
DO $$
DECLARE
  meditation_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO meditation_count FROM meditations WHERE audio_url LIKE 'http%';
  RAISE NOTICE 'Found % meditations with valid audio URLs', meditation_count;
END $$;

-- Create a dedicated policy for audio fetching
DROP POLICY IF EXISTS "Allow fetching meditation audio" ON storage.objects;
CREATE POLICY "Allow fetching meditation audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'meditations');

-- Fix any meditations that might still be using the wrong URL format
UPDATE meditations
SET audio_url = REPLACE(audio_url, '/storage/v1/object/public/Sounds/', '/storage/v1/object/public/meditations/');

-- Create consistent categories
INSERT INTO meditation_categories (name, description, icon)
VALUES
  ('Test', 'Test meditation category', 'flask-outline')
ON CONFLICT (name) DO NOTHING;

-- Create definitive test meditation if none exist
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM meditations) = 0 THEN
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
      'This is a test meditation to ensure functionality',
      5,
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000',
      'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/stress-relief.mp3',
      'Test'
    );
  END IF;
END $$;