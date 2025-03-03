/*
  # Update meditation audio URLs

  1. Changes
    - Updates audio URLs for existing meditation sounds
    - Ensures all URLs point to the correct Supabase storage location
*/

-- Update audio URLs for existing meditations
UPDATE meditations
SET audio_url = CASE title
  WHEN 'Morning Mindfulness' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/Sounds/morning-mindfulness.mp3'
  WHEN 'Deep Relaxation' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/Sounds/deep-relaxation.mp3'
  WHEN 'Stress Relief' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/Sounds/stress-relief.mp3'
  WHEN 'Better Sleep' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/Sounds/better-sleep.mp3'
  WHEN 'Focus & Concentration' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/Sounds/focus-concentration.mp3'
  WHEN 'Nature Sounds' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/Sounds/nature-sounds.mp3'
  WHEN 'Ocean Waves' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/Sounds/ocean-waves.mp3'
  WHEN 'Mindful Walking' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/Sounds/walking-meditation.mp3'
  WHEN 'Evening Wind Down' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/Sounds/evening-meditation.mp3'
  WHEN 'Gentle Rain' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/Sounds/Calm/gentle-rain.mp3'
  WHEN 'Forest Ambience' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/Sounds/Calm/forest-ambience.mp3'
  WHEN 'Flowing Stream' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/Sounds/Calm/flowing-stream.mp3'
  WHEN 'Mountain Wind' THEN 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/Sounds/Calm/mountain-wind.mp3'
  ELSE audio_url
END
WHERE title IN (
  'Morning Mindfulness',
  'Deep Relaxation',
  'Stress Relief',
  'Better Sleep',
  'Focus & Concentration',
  'Nature Sounds',
  'Ocean Waves',
  'Mindful Walking',
  'Evening Wind Down',
  'Gentle Rain',
  'Forest Ambience',
  'Flowing Stream',
  'Mountain Wind'
);