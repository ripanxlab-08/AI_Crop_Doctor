"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppState } from "@/lib/store";
import { supabase } from "@/lib/supabase";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const { user } = useAppState();
  const pathname = usePathname();
  const router = useRouter();
  // Track if we're waiting for Supabase session to resolve (avoid flash-redirect)
  const [sessionChecked, setSessionChecked] = useState(false);
  const checking = useRef(false);

  // On mount: check if Supabase has an active session before deciding to redirect.
  // This prevents the "flash redirect to login" when a user refreshes the page.
  useEffect(() => {
    if (checking.current) return;
    checking.current = true;
    supabase.auth.getSession().then(() => {
      setSessionChecked(true);
    });
  }, []);

  useEffect(() => {
    if (!sessionChecked) return;

    // Only truly protected routes that need a logged-in user.
    // The app supports guest mode for all main pages, so we do NOT
    // redirect guests away from /home, /diagnose, etc.
    // We only redirect away from the root "/" if unauthenticated.
    const isLoginRoute = pathname === "/login";
    const isRootRoute = pathname === "/";

    // If already logged in and on login page → go home
    if (user && isLoginRoute) {
      router.push("/home");
      return;
    }

    // Root "/" always redirects: guests → login, users → home
    if (isRootRoute) {
      router.push(user ? "/home" : "/login");
    }

    // All other routes (/home, /diagnose, /calendar, /assistant, /profile, /result, etc.)
    // are accessible in guest mode — no forced redirect.
  }, [user, pathname, router, sessionChecked]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
