import { createClient } from "@supabase/supabase-js";

// This tells Vercel to pull the keys from its secure dashboard, not the file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Safety check: if variables are missing, throw a clear error instead of "Load failed"
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Vercel project settings.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);