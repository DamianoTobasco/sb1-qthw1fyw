/*
  # Add Calm meditation sounds

  1. New Data
    - Adds new meditation sounds in the 'Calm' category
    - Updates existing sounds with correct URLs
    - Ensures all audio files are properly linked

  2. Changes
    - Inserts new meditation records
    - Links sounds to the Calm category
*/

-- Insert new Calm meditation sounds
INSERT INTO meditations (
  title,
  description,
  duration,
  image_url,
  audio_url,
  category,
  category_id
) 
SELECT 
  m.title,
  m.description,
  m.duration,
  m.image_url,
  m.audio_url,
  'Calm' as category,
  c.id as category_id
FROM (
  VALUES 
    (
      'Gentle Rain',
      'Soothing rain sounds for deep relaxation and focus',
      30,
      'https://images.unsplash.com/photo-1519692933481-e162a57d6721',
      'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/Sounds/Calm/gentle-rain.mp3',
      'Calm'
    ),
    (
      'Forest Ambience',
      'Immerse yourself in peaceful forest sounds',
      25,
      'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d',
      'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/Sounds/Calm/forest-ambience.mp3',
      'Calm'
    ),
    (
      'Flowing Stream',
      'Let the gentle sound of flowing water calm your mind',
      20,
      'https://images.unsplash.com/photo-1527489377706-5bf97e608852',
      'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/Sounds/Calm/flowing-stream.mp3',
      'Calm'
    ),
    (
      'Mountain Wind',
      'Experience the peaceful sound of mountain breezes',
      15,
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
      'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/Sounds/Calm/mountain-wind.mp3',
      'Calm'
    )
) AS m(title, description, duration, image_url, audio_url, category)
JOIN meditation_categories c ON c.name = m.category
WHERE NOT EXISTS (
  SELECT 1 FROM meditations 
  WHERE title = m.title
);