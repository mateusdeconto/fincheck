import { supabase } from './supabase.js';

export async function saveDiagnosis({ userId, businessData, financialData, diagnosisText }) {
  const { error } = await supabase.from('diagnoses').insert({
    user_id: userId,
    business_name: businessData.businessName,
    segment: businessData.segment,
    financial_data: financialData,
    diagnosis_text: diagnosisText,
  });
  if (error) console.error('[saveDiagnosis]', error.message);
}

export async function loadLastDiagnosis(userId) {
  const { data, error } = await supabase
    .from('diagnoses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data;
}

export async function loadAllDiagnoses(userId) {
  const { data, error } = await supabase
    .from('diagnoses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}
