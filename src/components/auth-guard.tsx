"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/store";
import { supabase } from "@/lib/supabase";

/**
 * AuthGuard - Wraps any protected page/component.
 *
 * Checks Supabase session on mount. If no valid session exists,
 * immediately redirects to /login.
 *
 * Usage: Wrap the top-level content of any protected page with <AuthGuard>.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAppState();
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    async function checkSession() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          // No valid Supabase session — redirect to login
          router.replace("/login");
        }
      } catch {
        // Network error — fall back to store state
        if (!user) {
          router.replace("/login");
        }
      }
    }

    // If store already has no user, redirect immediately (faster UX)
    if (!user) {
      checkSession();
    }
  }, [user, router]);

  // While checking auth, show nothing (prevents flash of protected content)
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
