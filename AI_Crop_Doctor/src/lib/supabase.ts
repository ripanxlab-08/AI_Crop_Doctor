import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (typeof process !== "undefined" ? process.env["NEXT_PUBLIC_SUPABASE_URL"] : "") || "";
const supabaseAnonKey =
  (typeof process !== "undefined" ? process.env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] : "") || "";

if (supabaseUrl.includes("YOUR_PROJECT_ID")) {
  console.warn(
    "⚠️ Supabase URL is still using the placeholder. Please restart your dev server (Ctrl + C then bun run dev).",
  );
} else {
  console.log("🔌 Supabase URL initialized.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
