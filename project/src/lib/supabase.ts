import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ghvvynxalczkewrlvceq.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodnZ5bnhhbGN6a2V3cmx2Y2VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NjUyMDMsImV4cCI6MjA4NzM0MTIwM30.hi-dwTLeF69SKhc96UEXN_vQ4qnvwkt-7_VYOGx9IJ8";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);