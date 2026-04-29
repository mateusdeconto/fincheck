import { supabase } from './supabase.js';

export async function loadUserPlan(userId) {
  const { data } = await supabase
    .from('user_plans')
    .select('plan')
    .eq('user_id', userId)
    .single();
  return data?.plan || 'free';
}
