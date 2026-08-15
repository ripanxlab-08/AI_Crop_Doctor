import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env["VITE_SUPABASE_URL"] as string) || (import.meta.env["NEXT_PUBLIC_SUPABASE_URL"] as string) || "";
const supabaseAnonKey = (import.meta.env["VITE_SUPABASE_ANON_KEY"] as string) || (import.meta.env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] as string) || "";

if (supabaseUrl.includes("YOUR_PROJECT_ID")) {
  console.warn("⚠️ Supabase URL is still using the placeholder. Please restart your dev server (Ctrl + C then bun run dev).");
} else {
  console.log("🔌 Supabase URL initialized with:", supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
