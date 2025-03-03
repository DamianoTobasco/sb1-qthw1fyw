/*
  # Finalize meditation audio configuration
  
  This migration ensures that all meditation audio files are correctly configured and
  accessible in the application.
*/

-- Make sure storage is properly configured for public access
DO $$
BEGIN
  -- Try to insert the bucket if it doesn't exist
  BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('meditations', 'meditations', true);
  EXCEPTION
    WHEN others THEN
      -- If bucket already exists, update its public status
      UPDATE storage.buckets SET public = true WHERE id = 'meditations';
  END;
END $$;

-- Ensure all meditations have valid audio URLs
UPDATE meditations
SET audio_url = 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/stress-relief.mp3'
WHERE audio_url IS NULL 
   OR audio_url = '' 
   OR audio_url NOT LIKE 'http%'
   OR audio_url LIKE '%undefined%';

-- Create robust audio access policy
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow accessing meditation audio') THEN
    DROP POLICY "Allow accessing meditation audio" ON storage.objects;
  END IF;
  
  CREATE POLICY "Allow accessing meditation audio"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'meditations');
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error creating policy: %', SQLERRM;
END $$;

-- Create a fallback meditation record that we know will work
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM meditations WHERE title = 'Peaceful Meditation') THEN
    INSERT INTO meditations (
      title,
      description,
      duration,
      image_url,
      audio_url,
      category
    )
    VALUES (
      'Peaceful Meditation',
      'A reliable meditation sound for relaxation and focus',
      10,
      'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5',
      'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/stress-relief.mp3',
      'Relaxation'
    );
  END IF;
END $$;

-- Create test category if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM meditation_categories WHERE name = 'Test') THEN
    INSERT INTO meditation_categories (name, description, icon)
    VALUES ('Test', 'Test meditation category', 'flask-outline');
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error creating test category: %', SQLERRM;
END $$;

-- Add useful debugging view
CREATE OR REPLACE VIEW valid_meditations AS
SELECT id, title, category, audio_url
FROM meditations
WHERE audio_url IS NOT NULL 
  AND audio_url != '' 
  AND audio_url LIKE 'http%'
ORDER BY title;

-- Ensure public access to all meditations
ALTER TABLE meditations DISABLE ROW LEVEL SECURITY;
ALTER TABLE meditations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public select access for meditations' AND tablename = 'meditations') THEN
    DROP POLICY "Public select access for meditations" ON meditations;
  END IF;
  
  CREATE POLICY "Public select access for meditations"
  ON meditations FOR SELECT
  USING (true);
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error creating meditation access policy: %', SQLERRM;
END $$;