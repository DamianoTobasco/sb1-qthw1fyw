-- Try to set up storage bucket correctly
DO $$
BEGIN
  BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('meditations', 'meditations', true);
  EXCEPTION
    WHEN others THEN
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

-- First drop the policy if it exists
DROP POLICY IF EXISTS "Allow accessing meditation audio" ON storage.objects;

-- Then create robust audio access policy
CREATE POLICY "Allow accessing meditation audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'meditations');

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

-- Create or ensure we have a test category
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM meditation_categories WHERE name = 'Test') THEN
    INSERT INTO meditation_categories (name, description, icon)
    VALUES ('Test', 'Test meditation category', 'flask-outline');
  END IF;
END $$;

-- Add useful debugging view
DROP VIEW IF EXISTS valid_meditations;
CREATE VIEW valid_meditations AS
SELECT id, title, category, audio_url
FROM meditations
WHERE audio_url IS NOT NULL 
  AND audio_url != '' 
  AND audio_url LIKE 'http%'
ORDER BY title;

-- Ensure public access to all meditations
ALTER TABLE meditations DISABLE ROW LEVEL SECURITY;
ALTER TABLE meditations ENABLE ROW LEVEL SECURITY;

-- First drop the policy if it exists
DROP POLICY IF EXISTS "Public select access for meditations" ON meditations;

-- Then create public access policy
CREATE POLICY "Public select access for meditations"
ON meditations FOR SELECT
USING (true);