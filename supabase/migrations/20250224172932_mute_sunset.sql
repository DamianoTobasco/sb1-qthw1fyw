/*
  # Update Meditation Audio URLs

  1. Updates
    - Update meditation audio_urls to point to the correct files in the Sounds bucket
    - Add new meditations with sounds from the bucket
*/

-- Update existing meditations with correct audio URLs
UPDATE meditations
SET audio_url = CASE title
  WHEN 'Morning Mindfulness' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/Sounds/morning-meditation.mp3'
  WHEN 'Deep Relaxation' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/Sounds/deep-relaxation.mp3'
  WHEN 'Stress Relief' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/Sounds/stress-relief.mp3'
  WHEN 'Better Sleep' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/Sounds/sleep-meditation.mp3'
  WHEN 'Focus & Concentration' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/Sounds/focus-meditation.mp3'
  ELSE audio_url
END;

-- Insert additional meditations using sounds from the bucket
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
  c.name as category,
  c.id as category_id
FROM (
  VALUES 
    (
      'Nature Sounds',
      'Immerse yourself in calming nature sounds for deep relaxation',
      20,
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
      'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/Sounds/nature-sounds.mp3',
      'Relaxation'
    ),
    (
      'Ocean Waves',
      'Let the rhythmic sound of ocean waves wash away your stress',
      25,
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
      'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/Sounds/ocean-waves.mp3',
      'Relaxation'
    ),
    (
      'Mindful Walking',
      'A guided meditation for mindful walking in nature',
      15,
      'https://images.unsplash.com/photo-1476611338391-6f395a0ebc7b',
      'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/Sounds/walking-meditation.mp3',
      'Morning'
    ),
    (
      'Evening Wind Down',
      'Gentle meditation to help you transition into a peaceful evening',
      20,
      'https://images.unsplash.com/photo-1472552944129-b035e9ea9744',
      'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/Sounds/evening-meditation.mp3',
      'Sleep'
    )
) AS m(title, description, duration, image_url, audio_url, category)
JOIN meditation_categories c ON c.name = m.category
WHERE NOT EXISTS (
  SELECT 1 FROM meditations 
  WHERE title = m.title
);