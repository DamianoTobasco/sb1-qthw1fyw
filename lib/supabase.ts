import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { format, isToday, parseISO } from 'date-fns';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});

// Test user UUID - in production, this would come from authentication
export const TEST_USER_ID = '123e4567-e89b-12d3-a456-426614174000';

// Default food database for the app when Supabase table is empty
const DEFAULT_FOOD_DATABASE = [
  // Fruits
  { id: 'fruit-1', food_name: 'Apple', serving_size: 1, serving_unit: 'medium (182g)', calories: 95, protein: 0.5, carbohydrate: 25, fat: 0.3 },
  { id: 'fruit-2', food_name: 'Banana', serving_size: 1, serving_unit: 'medium (118g)', calories: 105, protein: 1.3, carbohydrate: 27, fat: 0.4 },
  { id: 'fruit-3', food_name: 'Orange', serving_size: 1, serving_unit: 'medium (131g)', calories: 62, protein: 1.2, carbohydrate: 15.4, fat: 0.2 },
  { id: 'fruit-4', food_name: 'Strawberries', serving_size: 1, serving_unit: 'cup (144g)', calories: 46, protein: 1, carbohydrate: 11, fat: 0.4 },
  { id: 'fruit-5', food_name: 'Blueberries', serving_size: 1, serving_unit: 'cup (148g)', calories: 84, protein: 1.1, carbohydrate: 21.4, fat: 0.5 },

  // Vegetables
  { id: 'veg-1', food_name: 'Broccoli', serving_size: 1, serving_unit: 'cup (91g)', calories: 31, protein: 2.6, carbohydrate: 6, fat: 0.3 },
  { id: 'veg-2', food_name: 'Spinach', serving_size: 1, serving_unit: 'cup (30g)', calories: 7, protein: 0.9, carbohydrate: 1.1, fat: 0.1 },
  { id: 'veg-3', food_name: 'Carrot', serving_size: 1, serving_unit: 'medium (61g)', calories: 25, protein: 0.6, carbohydrate: 6, fat: 0.1 },
  { id: 'veg-4', food_name: 'Sweet Potato', serving_size: 1, serving_unit: 'medium (114g)', calories: 100, protein: 2, carbohydrate: 23, fat: 0.1 },
  { id: 'veg-5', food_name: 'Avocado', serving_size: 0.5, serving_unit: 'medium (68g)', calories: 114, protein: 1.3, carbohydrate: 6, fat: 10.5 },

  // Proteins
  { id: 'protein-1', food_name: 'Chicken Breast', serving_size: 3, serving_unit: 'oz (85g)', calories: 140, protein: 26, carbohydrate: 0, fat: 3 },
  { id: 'protein-2', food_name: 'Salmon', serving_size: 3, serving_unit: 'oz (85g)', calories: 177, protein: 19, carbohydrate: 0, fat: 11 },
  { id: 'protein-3', food_name: 'Eggs', serving_size: 1, serving_unit: 'large (50g)', calories: 72, protein: 6.3, carbohydrate: 0.4, fat: 5 },
  { id: 'protein-4', food_name: 'Ground Beef (93% lean)', serving_size: 3, serving_unit: 'oz (85g)', calories: 164, protein: 22, carbohydrate: 0, fat: 8 },
  { id: 'protein-5', food_name: 'Tofu', serving_size: 0.5, serving_unit: 'cup (124g)', calories: 94, protein: 10, carbohydrate: 2, fat: 6 },

  // Grains
  { id: 'grain-1', food_name: 'Brown Rice', serving_size: 0.5, serving_unit: 'cup cooked (98g)', calories: 108, protein: 2.5, carbohydrate: 22.5, fat: 0.9 },
  { id: 'grain-2', food_name: 'Quinoa', serving_size: 0.5, serving_unit: 'cup cooked (92g)', calories: 111, protein: 4, carbohydrate: 20, fat: 1.8 },
  { id: 'grain-3', food_name: 'Oatmeal', serving_size: 0.5, serving_unit: 'cup dry (40g)', calories: 150, protein: 5, carbohydrate: 27, fat: 3 },
  { id: 'grain-4', food_name: 'Whole Wheat Bread', serving_size: 1, serving_unit: 'slice (38g)', calories: 81, protein: 4, carbohydrate: 15, fat: 1.1 },
  { id: 'grain-5', food_name: 'Pasta', serving_size: 2, serving_unit: 'oz dry (57g)', calories: 211, protein: 7.5, carbohydrate: 42, fat: 1.3 },

  // Dairy
  { id: 'dairy-1', food_name: 'Greek Yogurt', serving_size: 1, serving_unit: 'cup (245g)', calories: 146, protein: 23, carbohydrate: 9, fat: 4 },
  { id: 'dairy-2', food_name: 'Milk (2%)', serving_size: 1, serving_unit: 'cup (244g)', calories: 122, protein: 8, carbohydrate: 12, fat: 5 },
  { id: 'dairy-3', food_name: 'Cheddar Cheese', serving_size: 1, serving_unit: 'oz (28g)', calories: 115, protein: 7, carbohydrate: 0.4, fat: 9.5 },
  { id: 'dairy-4', food_name: 'Cottage Cheese', serving_size: 0.5, serving_unit: 'cup (113g)', calories: 90, protein: 12, carbohydrate: 5, fat: 2.5 },
  { id: 'dairy-5', food_name: 'Butter', serving_size: 1, serving_unit: 'tbsp (14g)', calories: 102, protein: 0.1, carbohydrate: 0, fat: 11.5 },

  // Snacks & Others
  { id: 'snack-1', food_name: 'Almonds', serving_size: 1, serving_unit: 'oz (28g)', calories: 164, protein: 6, carbohydrate: 6, fat: 14 },
  { id: 'snack-2', food_name: 'Dark Chocolate', serving_size: 1, serving_unit: 'oz (28g)', calories: 155, protein: 2, carbohydrate: 13, fat: 11 },
  { id: 'snack-3', food_name: 'Peanut Butter', serving_size: 2, serving_unit: 'tbsp (32g)', calories: 188, protein: 8, carbohydrate: 6, fat: 16 },
  { id: 'snack-4', food_name: 'Protein Bar', serving_size: 1, serving_unit: 'bar (60g)', calories: 210, protein: 20, carbohydrate: 21, fat: 7 },
  { id: 'snack-5', food_name: 'Hummus', serving_size: 0.25, serving_unit: 'cup (60g)', calories: 104, protein: 3, carbohydrate: 12, fat: 5 },

  // Common Meals
  { id: 'meal-1', food_name: 'Grilled Chicken Salad', serving_size: 1, serving_unit: 'bowl (300g)', calories: 320, protein: 35, carbohydrate: 10, fat: 15 },
  { id: 'meal-2', food_name: 'Tuna Sandwich', serving_size: 1, serving_unit: 'sandwich (200g)', calories: 350, protein: 30, carbohydrate: 35, fat: 11 },
  { id: 'meal-3', food_name: 'Vegetable Stir Fry', serving_size: 1, serving_unit: 'cup (240g)', calories: 220, protein: 10, carbohydrate: 25, fat: 9 },
  { id: 'meal-4', food_name: 'Spaghetti with Tomato Sauce', serving_size: 1, serving_unit: 'serving (300g)', calories: 380, protein: 12, carbohydrate: 71, fat: 7 },
  { id: 'meal-5', food_name: 'Burrito Bowl', serving_size: 1, serving_unit: 'bowl (450g)', calories: 650, protein: 35, carbohydrate: 80, fat: 22 },

  // Beverages
  { id: 'beverage-1', food_name: 'Orange Juice', serving_size: 1, serving_unit: 'cup (248g)', calories: 111, protein: 2, carbohydrate: 26, fat: 0.5 },
  { id: 'beverage-2', food_name: 'Coffee (black)', serving_size: 1, serving_unit: 'cup (240g)', calories: 2, protein: 0.3, carbohydrate: 0, fat: 0 },
  { id: 'beverage-3', food_name: 'Green Tea', serving_size: 1, serving_unit: 'cup (240g)', calories: 0, protein: 0, carbohydrate: 0, fat: 0 },
  { id: 'beverage-4', food_name: 'Protein Shake', serving_size: 1, serving_unit: 'scoop (30g)', calories: 120, protein: 24, carbohydrate: 3, fat: 1.5 },
  { id: 'beverage-5', food_name: 'Smoothie', serving_size: 1, serving_unit: 'cup (240g)', calories: 180, protein: 5, carbohydrate: 34, fat: 2.5 }
];

// Meditation related functions
export async function listMeditationSounds() {
  try {
    console.log('Fetching meditation sounds from Supabase...');
    
    // First try: direct select without RLS constraints
    let { data, error } = await supabase
      .from('meditations')
      .select('*')
      .order('title', { ascending: true });

    // If the first attempt fails, try using a view or function if available
    if (error || !data || data.length === 0) {
      console.log('First attempt failed or returned no results, trying alternative query...');
      
      // Try getting data from the debug view we created
      const viewResult = await supabase
        .from('meditation_debug')
        .select('*')
        .order('title', { ascending: true });
        
      if (!viewResult.error && viewResult.data && viewResult.data.length > 0) {
        console.log('Successfully retrieved data from meditation_debug view');
        
        // We need to map the view data to our expected format
        // Since the view may not have all fields, we're ensuring consistent structure
        data = viewResult.data.map(item => ({
          id: item.id,
          title: item.title,
          description: 'Meditation sound',
          duration: 10,
          image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000',
          audio_url: item.audio_url,
          category: item.category || 'Relaxation',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
      } else {
        console.log('Alternative query also failed, checking for test meditation...');
        
        // Last resort - try to get at least the test meditation
        const testResult = await supabase
          .from('meditations')
          .select('*')
          .eq('title', 'Test Meditation')
          .limit(1);
          
        if (!testResult.error && testResult.data && testResult.data.length > 0) {
          console.log('Found test meditation');
          data = testResult.data;
        } else {
          console.error('All attempts failed to retrieve meditation data');
          // Return some fallback data if everything else fails
          data = [{
            id: 'fallback-1',
            title: 'Fallback Meditation',
            description: 'This is a fallback meditation for when the database is unavailable',
            duration: 5,
            image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000',
            audio_url: 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/stress-relief.mp3',
            category: 'Relaxation',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }];
        }
      }
    }
    
    console.log(`Retrieved ${data?.length || 0} meditation sounds`);
    
    // Validate and fix data
    const validatedData = data.map(item => ({
      ...item,
      // Ensure all records have valid URLs
      audio_url: item.audio_url && item.audio_url.startsWith('http') 
        ? item.audio_url 
        : 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/stress-relief.mp3',
      image_url: item.image_url && item.image_url.startsWith('http')
        ? item.image_url
        : 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000',
      // Ensure every item has a category
      category: item.category || 'Relaxation'
    }));
    
    // Log first few meditation records for debugging
    if (validatedData.length > 0) {
      console.log('Sample meditation records:');
      for (let i = 0; i < Math.min(3, validatedData.length); i++) {
        console.log(`${i+1}. ${validatedData[i].title} (${validatedData[i].category}): ${validatedData[i].audio_url}`);
      }
    } else {
      console.log('No meditation data available after validation!');
    }
    
    return validatedData;
  } catch (error) {
    console.error('Error loading meditation sounds:', error);
    
    // Return fallback data in case of complete failure
    return [{
      id: 'fallback-1',
      title: 'Fallback Meditation',
      description: 'This is a fallback meditation for when the database is unavailable',
      duration: 5,
      image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000',
      audio_url: 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/stress-relief.mp3',
      category: 'Relaxation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }];
  }
}

// Food logging related functions
export async function deleteFoodLog(logId: string) {
  try {
    const { error } = await supabase
      .from('food_logs')
      .delete()
      .eq('id', logId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting food log:', error);
    throw error;
  }
}

// Search for food in the database, with local fallback
export async function searchFood(query: string): Promise<any[]> {
  if (!query.trim()) return [];
  
  console.log(`Searching for food: "${query}"`);
  
  try {
    // First try to search in Supabase
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(25);

    if (error) {
      console.error('Supabase search error:', error);
      throw error;
    }

    // If we got results from Supabase, return them
    if (data && data.length > 0) {
      console.log(`Found ${data.length} results from database`);
      
      // Format the data to match our expected structure
      return data.map(item => ({
        id: item.id,
        food_name: item.name,
        serving_size: item.serving_size,
        serving_unit: item.serving_unit,
        calories: item.calories,
        protein: item.protein,
        carbohydrate: item.carbs,
        fat: item.fat
      }));
    }

    // If no results from database or error, use local fallback data
    console.log('No results from database, using local food database');
    
    // Filter the local food database based on the query
    const filteredResults = DEFAULT_FOOD_DATABASE.filter(item => 
      item.food_name.toLowerCase().includes(query.toLowerCase())
    );
    
    console.log(`Found ${filteredResults.length} matches in local database`);
    return filteredResults;
    
  } catch (error) {
    console.error('Error searching food:', error);
    
    // On error, fall back to local database
    console.log('Error occurred, using local food database');
    const filteredResults = DEFAULT_FOOD_DATABASE.filter(item => 
      item.food_name.toLowerCase().includes(query.toLowerCase())
    );
    return filteredResults;
  }
}

export async function logFood(userId: string, foodData: any, servingMultiplier: number = 1) {
  try {
    const { data, error } = await supabase
      .from('food_logs')
      .insert({
        user_id: userId,
        food_name: foodData.food_name,
        serving_size: servingMultiplier,
        serving_unit: foodData.serving_unit || 'serving',
        calories: Math.round(foodData.calories * servingMultiplier),
        protein: Math.round(foodData.protein * servingMultiplier),
        carbs: Math.round(foodData.carbohydrate * servingMultiplier),
        fat: Math.round(foodData.fat * servingMultiplier),
        meal_type: 'meal',
        logged_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error details:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error logging food:', error);
    throw error;
  }
}

export async function getFoodLogs(userId: string, date: string) {
  try {
    const formattedDate = format(new Date(date), 'yyyy-MM-dd');
    const { data, error } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', `${formattedDate}T00:00:00`)
      .lte('logged_at', `${formattedDate}T23:59:59`)
      .order('logged_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting food logs:', error);
    return [];
  }
}

export async function getDailyNutrition(userId: string, date: string) {
  try {
    const formattedDate = format(new Date(date), 'yyyy-MM-dd');
    const { data, error } = await supabase
      .from('food_logs')
      .select('calories, protein, carbs, fat')
      .eq('user_id', userId)
      .gte('logged_at', `${formattedDate}T00:00:00`)
      .lte('logged_at', `${formattedDate}T23:59:59`);

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };
    }

    return data.reduce((acc, item) => ({
      calories: acc.calories + (item.calories || 0),
      protein: acc.protein + (item.protein || 0),
      carbs: acc.carbs + (item.carbs || 0),
      fat: acc.fat + (item.fat || 0),
    }), {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    });
  } catch (error) {
    console.error('Error getting daily nutrition:', error);
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
  }
}

// Water tracking functions
export async function getWaterIntake(userId: string, date: string) {
  try {
    const formattedDate = format(new Date(date), 'yyyy-MM-dd');
    const { data, error } = await supabase
      .from('water_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', `${formattedDate}T00:00:00`)
      .lte('logged_at', `${formattedDate}T23:59:59`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    
    if (data && data.length > 0) {
      return data[0];
    } else {
      // If no record exists for today, create a new one with default values
      const newRecord = {
        user_id: userId,
        amount: 0,
        goal: 64, // Default to 64oz (8 cups)
        logged_at: new Date().toISOString(),
      };
      
      // Only insert a new record if we're checking today's date
      // This prevents creating new records for past dates when viewing history
      const today = new Date();
      const checkDate = new Date(date);
      
      if (
        today.getFullYear() === checkDate.getFullYear() &&
        today.getMonth() === checkDate.getMonth() &&
        today.getDate() === checkDate.getDate()
      ) {
        await supabase.from('water_logs').insert(newRecord);
      }
      
      return newRecord;
    }
  } catch (error) {
    console.error('Error getting water intake:', error);
    // Return a default record if there's an error
    return {
      amount: 0,
      goal: 64,
    };
  }
}

export async function updateWaterIntake(userId: string, date: string, amount: number, goal: number) {
  try {
    const formattedDate = format(new Date(date), 'yyyy-MM-dd');
    
    // Check if a record exists for today
    const { data, error: checkError } = await supabase
      .from('water_logs')
      .select('id')
      .eq('user_id', userId)
      .gte('logged_at', `${formattedDate}T00:00:00`)
      .lte('logged_at', `${formattedDate}T23:59:59`)
      .limit(1);
    
    if (checkError) throw checkError;
    
    if (data && data.length > 0) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('water_logs')
        .update({ amount, goal })
        .eq('id', data[0].id);
      
      if (updateError) throw updateError;
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('water_logs')
        .insert({
          user_id: userId,
          amount,
          goal,
          logged_at: new Date().toISOString(),
        });
      
      if (insertError) throw insertError;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating water intake:', error);
    throw error;
  }
}

// Workout tracking functions
export async function saveWorkout(userId: string, date: string, workout: any) {
  try {
    const { data, error } = await supabase
      .from('workout_logs')
      .insert({
        user_id: userId,
        date: format(new Date(date), 'yyyy-MM-dd'),
        exercise: workout.exercise,
        sets: workout.sets,
        reps: workout.reps,
        weight: workout.weight,
        notes: workout.notes || '',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving workout:', error);
    throw error;
  }
}

export async function getWorkoutsByDate(userId: string, date: string) {
  try {
    const formattedDate = format(new Date(date), 'yyyy-MM-dd');
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', formattedDate)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting workouts:', error);
    return [];
  }
}

export async function deleteWorkout(workoutId: string) {
  try {
    const { error } = await supabase
      .from('workout_logs')
      .delete()
      .eq('id', workoutId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting workout:', error);
    throw error;
  }
}

export async function getDatesWithWorkouts(userId: string, year: number, month: number) {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');
    
    const { data, error } = await supabase
      .from('workout_logs')
      .select('date')
      .eq('user_id', userId)
      .gte('date', formattedStartDate)
      .lte('date', formattedEndDate)
      .order('date', { ascending: true });

    if (error) throw error;
    
    // Get unique dates with workouts
    const uniqueDates = [...new Set(data?.map(item => item.date))];
    return uniqueDates;
  } catch (error) {
    console.error('Error getting workout dates:', error);
    return [];
  }
}

export async function getLastLoginDate(userId: string): Promise<Date | null> {
  try {
    const { data, error } = await supabase
      .from('user_activity')
      .select('last_login')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data?.last_login ? parseISO(data.last_login) : null;
  } catch (error) {
    console.error('Error getting last login:', error);
    return null;
  }
}

// Habit tracking functions
export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  start_date: string;
  icon?: string;
  color?: string;
  target_days?: number;
  created_at: string;
  updated_at: string;
}

export async function getUserHabits(userId: string) {
  try {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting habits:', error);
    // Return mock data if there's an error or no data
    return [
      {
        id: 'habit-1',
        user_id: userId,
        name: 'No Vaping',
        description: 'Quit vaping for good',
        start_date: '2025-02-01T00:00:00.000Z',
        icon: 'ban',
        color: '#ff6b6b',
        created_at: '2025-02-01T00:00:00.000Z',
        updated_at: '2025-02-01T00:00:00.000Z'
      },
      {
        id: 'habit-2',
        user_id: userId,
        name: 'Daily Meditation',
        description: 'Meditate for at least 10 minutes',
        start_date: '2025-01-15T00:00:00.000Z',
        icon: 'lotus',
        color: '#A163F6',
        created_at: '2025-01-15T00:00:00.000Z',
        updated_at: '2025-01-15T00:00:00.000Z'
      },
      {
        id: 'habit-3',
        user_id: userId,
        name: 'No Sugar',
        description: 'Avoid added sugars',
        start_date: '2025-02-10T00:00:00.000Z',
        icon: 'nutrition',
        color: '#38E8E0',
        created_at: '2025-02-10T00:00:00.000Z',
        updated_at: '2025-02-10T00:00:00.000Z'
      }
    ];
  }
}

export async function createHabit(userId: string, habit: Partial<Habit>) {
  try {
    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: userId,
        name: habit.name,
        description: habit.description || '',
        start_date: habit.start_date || new Date().toISOString(),
        icon: habit.icon || 'checkmark-circle',
        color: habit.color || '#A163F6',
        target_days: habit.target_days || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating habit:', error);
    throw error;
  }
}

export async function deleteHabit(habitId: string) {
  try {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting habit:', error);
    throw error;
  }
}

export function calculateHabitStreak(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  
  // Calculate the difference in days
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// Fixed updateLastLogin function to handle the unique constraint error
export async function updateLastLogin(userId: string, date: Date, streak: number) {
  try {
    // First check if a record exists
    const { data, error: checkError } = await supabase
      .from('user_activity')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      // If there's an error other than "no rows returned", throw it
      throw checkError;
    }
    
    if (data) {
      // Record exists, update it
      const { error: updateError } = await supabase
        .from('user_activity')
        .update({
          last_login: date.toISOString(),
          streak: streak,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);
        
      if (updateError) throw updateError;
    } else {
      // No record exists, insert a new one
      const { error: insertError } = await supabase
        .from('user_activity')
        .insert({
          user_id: userId,
          last_login: date.toISOString(),
          streak: streak,
          updated_at: new Date().toISOString()
        });
        
      if (insertError) throw insertError;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating last login:', error);
    return false;
  }
}