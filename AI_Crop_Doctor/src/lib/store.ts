/**
 * Lightweight client store (localStorage + useSyncExternalStore).
 * Stands in for the future FastAPI-backed user/profile/history endpoints.
 */

import { useSyncExternalStore } from "react";
import type { DiagnosisResponse } from "@/services/crop-api";
import type { LanguageCode } from "@/lib/i18n";
import { addDays, startOfDay } from "@/lib/crop-schedule";
import type { Reminder } from "@/lib/crop-schedule";
import { supabase } from "./supabase";

export interface HistoryEntry {
  id: string;
  date: string;
  crop: string;
  disease: string;
  confidence: number;
  /** G0–G3 disease stage. null for healthy results. */
  stage: "G0" | "G1" | "G2" | "G3" | null;
  /** Estimated lesion percentage. */
  lesionPct: number | null;
  image: string;
}

export interface FarmerProfile {
  name: string;
  region: string;
  language: LanguageCode;
  crops: string[];
  notifications: boolean;
  voiceGuidance: boolean;
  units: "metric" | "imperial";
}

export interface AppState {
  onboarded: boolean;
  sowingDate: string;
  profile: FarmerProfile;
  history: HistoryEntry[];
  customReminders: Reminder[];
  disabledReminderIds: string[];
  lastResult: (DiagnosisResponse & { image: string; at: string }) | null;
  user: { email: string; name: string; token: string } | null;
}

const KEY = "acd.state.v1";
/** Keys that are safe to persist in localStorage (NEVER include `user`) */
const PERSIST_KEYS: (keyof AppState)[] = [
  "onboarded",
  "sowingDate",
  "profile",
  "history",
  "customReminders",
  "disabledReminderIds",
  "lastResult",
];

function seedState(): AppState {
  const today = startOfDay(new Date());
  return {
    onboarded: false,
    user: null, // ALWAYS null on cold start — Supabase session sets this
    sowingDate: addDays(today, -39).toISOString(),
    profile: {
      name: "",
      region: "",
      language: "en",
      crops: [],
      notifications: true,
      voiceGuidance: true,
      units: "metric",
    },
    history: [],
    customReminders: [],
    disabledReminderIds: [],
    lastResult: null,
  };
}

let state: AppState = seedState();
let hydrated = false;
const listeners = new Set<() => void>();

// Subscribe to Supabase auth changes
if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange((_event, session) => {
    hydrate(); // Ensure state is loaded from localStorage first
    if (session?.user) {
      const email = session.user.email || "";
      const name =
        (session.user.user_metadata?.["name"] as string | undefined) ||
        (email.split("@")[0] as string) ||
        "Farmer";
      const token = session.access_token;
      setState((s) => ({
        user: { email, name, token },
        profile: {
          ...s.profile,
          name: s.profile.name === "Ripan Samui" && name !== "farmer" ? name : s.profile.name,
        },
      }));
    } else {
      setState({ user: null });
    }
  });
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<AppState>;
      // SECURITY: Never restore `user` from localStorage.
      // Auth state is ONLY set by Supabase's onAuthStateChange.
      delete saved.user;
      state = { ...state, ...saved };
    }
  } catch {
    /* ignore corrupt storage */
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    // Only persist safe, non-auth keys
    const toSave = PERSIST_KEYS.reduce(
      (acc, key) => ({ ...acc, [key]: state[key] }),
      {} as Partial<AppState>,
    );
    window.localStorage.setItem(KEY, JSON.stringify(toSave));
  } catch {
    /* storage full / unavailable */
  }
}

export function setState(patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) {
  const next = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...next };
  persist();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  listener();
  return () => listeners.delete(listener);
}

export function useAppState(): AppState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
}

export function addHistoryEntry(entry: HistoryEntry) {
  setState((s) => ({ history: [entry, ...s.history] }));
}

export function toggleReminder(id: string) {
  setState((s) => ({
    disabledReminderIds: s.disabledReminderIds.includes(id)
      ? s.disabledReminderIds.filter((x) => x !== id)
      : [...s.disabledReminderIds, id],
  }));
}

export function addCustomReminder(reminder: Reminder) {
  setState((s) => ({ customReminders: [...s.customReminders, reminder] }));
}

export function updateCustomReminder(id: string, patch: Partial<Reminder>) {
  setState((s) => ({
    customReminders: s.customReminders.map((r) => (r.id === id ? { ...r, ...patch } : r)),
  }));
}

export function deleteCustomReminder(id: string) {
  setState((s) => ({ customReminders: s.customReminders.filter((r) => r.id !== id) }));
}

export function updateProfile(patch: Partial<FarmerProfile>) {
  setState((s) => ({ profile: { ...s.profile, ...patch } }));
}

export function loginUser(email: string, name: string) {
  setState((s) => ({
    user: { email, name, token: s.user?.token || "" },
    profile: {
      ...s.profile,
      name: name || s.profile.name || email.split("@")[0] || "Farmer",
    },
  }));
}

export function logoutUser() {
  supabase.auth.signOut({ scope: "local" }).catch((err) => {
    console.error("Error signing out from Supabase:", err);
  });
  setState({ user: null });
}
