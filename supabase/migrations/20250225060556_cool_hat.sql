/*
  # Add Food Items Dataset with Nutritional Information

  1. Schema Changes
    - Add fiber and sugar columns to food_items table
    - Add unique constraint for food item identification
    
  2. Data
    - Insert common food items with complete nutritional information
    - Categories: whole foods, packaged foods, restaurant meals
    
  3. Notes
    - All nutritional values are per serving
    - Data sourced from USDA FoodData Central
*/

-- Add new columns for fiber and sugar
ALTER TABLE food_items 
ADD COLUMN IF NOT EXISTS fiber numeric,
ADD COLUMN IF NOT EXISTS sugar numeric;

-- Add a unique constraint for food items
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'food_items_unique_entry'
  ) THEN
    ALTER TABLE food_items
    ADD CONSTRAINT food_items_unique_entry 
    UNIQUE (name, brand, serving_size, serving_unit);
  END IF;
END $$;

-- Insert common whole foods
INSERT INTO food_items 
(name, brand, serving_size, serving_unit, calories, protein, carbs, fat, fiber, sugar)
VALUES
-- Fruits
('Apple', 'Generic', 100, 'g', 52, 0.3, 14, 0.2, 2.4, 10.4),
('Banana', 'Generic', 100, 'g', 89, 1.1, 23, 0.3, 2.6, 12.2),
('Orange', 'Generic', 100, 'g', 47, 0.9, 12, 0.1, 2.4, 9.4),

-- Vegetables
('Broccoli', 'Generic', 100, 'g', 34, 2.8, 7, 0.4, 2.6, 1.7),
('Spinach', 'Generic', 100, 'g', 23, 2.9, 3.6, 0.4, 2.2, 0.4),
('Carrot', 'Generic', 100, 'g', 41, 0.9, 10, 0.2, 2.8, 4.7),

-- Proteins
('Chicken Breast', 'Generic', 100, 'g', 165, 31, 0, 3.6, 0, 0),
('Salmon', 'Generic', 100, 'g', 208, 22, 0, 13, 0, 0),
('Egg', 'Generic', 50, 'g', 72, 6.3, 0.4, 4.8, 0, 0.2),

-- Grains
('Brown Rice', 'Generic', 100, 'g', 111, 2.6, 23, 0.9, 1.8, 0.4),
('Quinoa', 'Generic', 100, 'g', 120, 4.4, 21.3, 1.9, 2.8, 0.9),
('Oatmeal', 'Generic', 100, 'g', 389, 16.9, 66.3, 6.9, 10.6, 0),

-- Packaged Foods
('Greek Yogurt', 'Fage', 100, 'g', 97, 9, 3.8, 5, 0, 3.8),
('Granola Bar', 'Nature Valley', 42, 'g', 190, 4, 29, 6, 2, 12),
('Protein Bar', 'Quest', 60, 'g', 200, 21, 21, 8, 14, 1),

-- Restaurant Items
('Big Mac', 'McDonalds', 240, 'g', 563, 26, 46, 33, 3, 9),
('Chicken Burrito Bowl', 'Chipotle', 665, 'g', 665, 44, 83, 23, 8, 3),
('Caesar Salad', 'Panera', 330, 'g', 440, 31, 11, 33, 4, 2)

ON CONFLICT ON CONSTRAINT food_items_unique_entry
DO UPDATE SET
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  sugar = EXCLUDED.sugar;