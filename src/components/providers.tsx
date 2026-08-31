"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppState } from "@/lib/store";
import { supabase } from "@/lib/supabase";

/**
 * Routes that do NOT require authentication.
 * Everything else is protected — unauthenticated users are redirected to /login.
 */
const PUBLIC_ROUTES = ["/login"];

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const { user } = useAppState();
  const pathname = usePathname();
  const router = useRouter();

  const [sessionChecked, setSessionChecked] = useState(false);
  const checking = useRef(false);

  useEffect(() => {
    if (checking.current) return;
    checking.current = true;

    supabase.auth.getSession().then(() => {
      setSessionChecked(true);
    });
  }, []);

  useEffect(() => {
    if (!sessionChecked) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (user) {
      // Authenticated users should not stay on the login page
      if (isPublicRoute) {
        router.push("/home");
      }
    } else {
      // Unauthenticated users trying to access protected pages get redirected to /login
      if (!isPublicRoute && pathname !== "/") {
        router.push("/login");
      }
    }
  }, [user, pathname, router, sessionChecked]);

  if (!sessionChecked) return null;

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
