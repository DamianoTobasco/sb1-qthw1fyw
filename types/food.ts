export interface FoodItem {
  id: string;
  name: string;
  brand: string | null;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  created_at: string;
}

export interface FoodLog {
  id: string;
  user_id: string;
  food_item_id: string;
  servings: number;
  meal_type: string;
  logged_at: string;
  created_at: string;
  food_item: FoodItem;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';