/*
  # Update meditation sounds with new storage files

  1. Changes
    - Update audio_url for existing meditations to point to correct storage files in the meditations bucket
    - Make sure all meditation tracks are properly connected to their audio files
*/

-- Update existing meditations with the correct audio files
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
  WHEN 'Crystal Bowls' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/crystal-bowls.mp3'
  WHEN 'Tibetan Bells' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/tibetan-bells.mp3'
  WHEN 'Zen Garden' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/zen-garden.mp3'
  ELSE audio_url
END;

-- Add any additional meditations if needed
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
      'Rainforest Sounds',
      'Immerse yourself in the natural sounds of the rainforest',
      25,
      'https://images.unsplash.com/photo-1515808903684-8c6afb0b4fe7',
      'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/rainforest.mp3',
      'Relaxation'
    ),
    (
      'Beach Waves',
      'Let the rhythmic sounds of ocean waves wash away stress',
      30,
      'https://images.unsplash.com/photo-1471922694854-ff1b63b20054',
      'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/beach-waves.mp3',
      'Sleep'
    ),
    (
      'Morning Birds',
      'Start your day with the cheerful sounds of birds',
      15,
      'https://images.unsplash.com/photo-1444464666168-49d633b86797',
      'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/morning-birds.mp3',
      'Morning'
    ),
    (
      'Peaceful Piano',
      'Gentle piano melodies to help you focus and relax',
      20,
      'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0',
      'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/peaceful-piano.mp3',
      'Focus'
    ),
    (
      'Healing Chimes',
      'Delicate wind chimes creating a peaceful atmosphere',
      18,
      'https://images.unsplash.com/photo-1530977875151-aae9742fde19',
      'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/healing-chimes.mp3',
      'Calm'
    )
) AS m(title, description, duration, image_url, audio_url, category)
JOIN meditation_categories c ON c.name = m.category
WHERE NOT EXISTS (
  SELECT 1 FROM meditations 
  WHERE title = m.title
);