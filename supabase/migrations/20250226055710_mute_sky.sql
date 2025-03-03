/*
  # Update meditation sounds with new storage files

  1. Changes
    - Update audio_url for existing meditations to point to new storage files
    - Add new meditations with new audio files
*/

-- Update existing meditations with new audio files
UPDATE meditations
SET audio_url = CASE title
  WHEN 'Morning Mindfulness' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/morning-mindfulness.mp3'
  WHEN 'Deep Relaxation' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/deep-relaxation.mp3'
  WHEN 'Stress Relief' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/stress-relief.mp3'
  WHEN 'Better Sleep' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/better-sleep.mp3'
  WHEN 'Focus & Concentration' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/focus-concentration.mp3'
  WHEN 'Nature Sounds' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/nature-sounds.mp3'
  WHEN 'Ocean Waves' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/ocean-waves.mp3'
  WHEN 'Mindful Walking' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/mindful-walking.mp3'
  WHEN 'Evening Wind Down' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/evening-wind-down.mp3'
  WHEN 'Gentle Rain' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/gentle-rain.mp3'
  WHEN 'Forest Ambience' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/forest-ambience.mp3'
  WHEN 'Flowing Stream' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/flowing-stream.mp3'
  WHEN 'Mountain Wind' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/mountain-wind.mp3'
  ELSE audio_url
END;

-- Add new meditations
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
      'Crystal Bowls',
      'Experience deep healing vibrations with crystal singing bowls',
      20,
      'https://images.unsplash.com/photo-1591291621164-2c6367723315',
      'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/crystal-bowls.mp3',
      'Relaxation'
    ),
    (
      'Tibetan Bells',
      'Traditional meditation bells for mindfulness practice',
      15,
      'https://images.unsplash.com/photo-1582736317407-371893d7378e',
      'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/tibetan-bells.mp3',
      'Focus'
    ),
    (
      'Zen Garden',
      'Peaceful sounds of a traditional Japanese garden',
      25,
      'https://images.unsplash.com/photo-1464061884326-64f6ebd57f83',
      'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/zen-garden.mp3',
      'Morning'
    )
) AS m(title, description, duration, image_url, audio_url, category)
JOIN meditation_categories c ON c.name = m.category
WHERE NOT EXISTS (
  SELECT 1 FROM meditations 
  WHERE title = m.title
);