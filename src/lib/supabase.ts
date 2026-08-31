import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (typeof process !== "undefined" ? process.env["NEXT_PUBLIC_SUPABASE_URL"] : "") ||
  "https://royuykgcidecupjgrmwq.supabase.co";

const supabaseAnonKey =
  (typeof process !== "undefined" ? process.env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] : "") ||
  "sb_publishable_tf2qnRgpxdtYZCbiH4h9xg_cZVulZuU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
