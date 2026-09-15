import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Helper to fetch user submissions from Supabase if configured
 */
export async function getSupabaseSubmissions(userId) {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Supabase query fallback (Supabase not configured or table missing):", err.message);
    return null;
  }
}

/**
 * Helper to store submission in Supabase if configured
 */
export async function saveSupabaseSubmission(submissionData) {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .insert([submissionData]);

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Supabase save fallback:", err.message);
    return null;
  }
}
