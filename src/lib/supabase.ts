import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://adlgfohysjhnvezxgflh.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkbGdmb2h5c2pobnZlenhnZmxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzIzMDMsImV4cCI6MjA3NDY0ODMwM30.oI5W-jU7UGlsdZl1ztXmK2vzhPkWNrPeWdl8uVf2GUs'
const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function for handling Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error)
  
  if (error?.code === 'PGRST116') {
    return 'No data found'
  }
  
  if (error?.code === '23505') {
    return 'This record already exists'
  }
  
  if (error?.code === '23503') {
    return 'Referenced record not found'
  }
  
  if (error?.code === 'PGRST301') {
    return 'Permission denied'
  }
  
  return error?.message || 'An unexpected error occurred'
}

export { supabase }