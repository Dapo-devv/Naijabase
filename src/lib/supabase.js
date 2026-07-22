import { createClient } from "@supabase/supabase-js";

// Load from local .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Instead of crashing the app, print a console error so you can see the problem
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("🚨 LOCAL ERROR: Missing Supabase environment variables.");
  console.error("Create a .env file in the root of your project with:");
  console.error("VITE_SUPABASE_URL=your_url");
  console.error("VITE_SUPABASE_ANON_KEY=your_key");
  console.error("Then restart the dev server.");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");