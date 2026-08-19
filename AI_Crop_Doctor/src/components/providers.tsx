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

    const isLoginRoute = pathname === "/login";
    const isRootRoute = pathname === "/";

    // If already logged in and on login page → go to home
    if (user && (isLoginRoute || isRootRoute)) {
      router.push("/home");
      return;
    }

    // ALL routes (except /login itself) are protected.
    // Unauthenticated users MUST log in — no guest access allowed.
    if (!user && !isLoginRoute) {
      router.push("/login");
    }
  }, [user, pathname, router, sessionChecked]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
