import { createClient } from '@supabase/supabase-js'

// Provide placeholder values to prevent initialization errors when .env is not set.
// Replace these with your actual Supabase credentials in a .env.local file for full functionality.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ajjffccvbusuganyvipm.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
