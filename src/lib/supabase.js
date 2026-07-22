import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fpaoxdeoemrmgkdmscaj.supabase.co";
const supabaseAnonKey = "sb_publishable_tpLhxnTC0wzcGFwDaD0p1A_kfIDq8v-";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
