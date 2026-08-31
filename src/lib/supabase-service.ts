import { supabase } from "./supabase";

export interface SupabaseProfile {
  id: string;
  full_name: string;
  phone: string | null;
  location: string | null;
  created_at?: string;
}

export interface SupabaseDiagnosisRecord {
  id?: string;
  user_id?: string;
  crop_name: string;
  disease_name: string;
  confidence: number;
  severity_stage: string | null;
  image_url: string | null;
  created_at?: string;
}

/**
 * Fetch profile for current authenticated user from public.profiles
 */
export async function fetchProfile(userId?: string): Promise<SupabaseProfile | null> {
  try {
    let targetUserId = userId;
    if (!targetUserId) {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        targetUserId = authData.user.id;
      }
    }

    if (!targetUserId) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", targetUserId)
      .single();

    if (error) {
      console.warn("Notice fetching profile from Supabase:", error.message);
      return null;
    }
    return data as SupabaseProfile;
  } catch (err) {
    console.error("Error in fetchProfile:", err);
    return null;
  }
}

/**
 * Upsert user profile to public.profiles
 */
export async function upsertProfile(profile: Partial<SupabaseProfile> & { id: string }) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .upsert(profile, { onConflict: "id" })
      .select();

    if (error) {
      console.error("Error upserting profile:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error("Failed to save profile:", err);
    return null;
  }
}

/**
 * Fetch diagnosis history for current user from public.diagnosis_history
 */
export async function fetchDiagnosisHistory(userId?: string): Promise<SupabaseDiagnosisRecord[]> {
  try {
    let targetUserId = userId;
    if (!targetUserId) {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        targetUserId = authData.user.id;
      }
    }

    let query = supabase
      .from("diagnosis_history")
      .select("*")
      .order("created_at", { ascending: false });

    if (targetUserId) {
      query = query.eq("user_id", targetUserId);
    }

    const { data, error } = await query;

    if (error) {
      console.warn("Notice fetching diagnosis_history from Supabase:", error.message);
      return [];
    }
    return (data || []) as SupabaseDiagnosisRecord[];
  } catch (err) {
    console.error("Error in fetchDiagnosisHistory:", err);
    return [];
  }
}

/**
 * Insert a new diagnosis result into public.diagnosis_history
 */
export async function insertDiagnosisHistory(entry: SupabaseDiagnosisRecord) {
  try {
    let targetUserId = entry.user_id;
    if (!targetUserId) {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        targetUserId = authData.user.id;
      }
    }

    const payload = {
      crop_name: entry.crop_name,
      disease_name: entry.disease_name,
      confidence: entry.confidence,
      severity_stage: entry.severity_stage || "G1",
      image_url: entry.image_url || null,
      ...(targetUserId ? { user_id: targetUserId } : {}),
    };

    const { data, error } = await supabase
      .from("diagnosis_history")
      .insert(payload)
      .select();

    if (error) {
      console.error("Error inserting into diagnosis_history:", error.message);
      return null;
    }
    console.log("✓ Successfully inserted diagnosis_history record to Supabase:", data);
    return data;
  } catch (err) {
    console.error("Failed to insert diagnosis history:", err);
    return null;
  }
}
