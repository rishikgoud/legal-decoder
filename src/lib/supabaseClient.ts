import { createClient } from '@supabase/supabase-js'

// Provide placeholder values to prevent initialization errors when .env is not set.
// For full functionality, create a .env file with your actual Supabase credentials.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ajjffccvbusuganyvipm.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
