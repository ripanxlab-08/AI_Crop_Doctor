"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppState } from "@/lib/store";
import { supabase } from "@/lib/supabase";

/**
 * Routes that do NOT require authentication.
 * Everything else is a protected route — unauthenticated users are redirected to /login.
 */
const PUBLIC_ROUTES = ["/", "/login"];

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const { user } = useAppState();
  const pathname = usePathname();
  const router = useRouter();

  /**
   * `sessionChecked` = true once Supabase has resolved the initial session.
   * We MUST NOT make any redirect decisions before this is true, otherwise
   * a valid Supabase session may not yet be reflected in `user` and the user
   * gets flash-redirected to /login unnecessarily.
   */
  const [sessionChecked, setSessionChecked] = useState(false);
  const checking = useRef(false);

  useEffect(() => {
    if (checking.current) return;
    checking.current = true;
    // getSession() triggers onAuthStateChange in store.ts which sets `user`.
    // We only mark sessionChecked=true after that resolves.
    supabase.auth.getSession().then(() => {
      setSessionChecked(true);
    });
  }, []);

  useEffect(() => {
    // Never redirect until Supabase has confirmed (or denied) the session.
    if (!sessionChecked) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (user) {
      // Authenticated users should not linger on the login or root pages.
      if (isPublicRoute) {
        router.push("/home");
      }
    } else {
      // No valid Supabase session — enforce login for ALL protected routes.
      if (!isPublicRoute) {
        router.push("/login");
      }
    }
  }, [user, pathname, router, sessionChecked]);

  // While waiting for the Supabase session check, render nothing to prevent
  // a flash of protected content before auth resolves.
  if (!sessionChecked) return null;

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
