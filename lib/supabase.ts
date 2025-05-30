import { createBrowserClient } from '@supabase/ssr'
import { Database } from './types/supabase'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Helper function to get user by phone
export async function getUserByPhone(phone: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return null
    }
    throw error
  }
  return data
}

// Helper function to get user's latest grievance
export async function getLatestGrievance(userId: string) {
  const { data, error } = await supabase
    .from('grievances')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows returned"
  return data
}

// Helper function to create or update user
export async function upsertUser(userData: Database['public']['Tables']['users']['Insert']) {
  const { data, error } = await supabase
    .from('users')
    .upsert(userData, { onConflict: 'phone' })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Helper function to create grievance
export async function createGrievance(grievanceData: Database['public']['Tables']['grievances']['Insert']) {
  const { data, error } = await supabase
    .from('grievances')
    .insert(grievanceData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Helper function to update user profile
export async function updateUserProfile(
  userId: string,
  profileData: {
    first_name?: string;
    last_name?: string;
    reg_number?: string;
    email?: string;
  }
) {
  const { data, error } = await supabase
    .from('users')
    .update(profileData)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
} 