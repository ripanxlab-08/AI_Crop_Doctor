"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppState } from "@/lib/store";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const { user } = useAppState();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const isPublicRoute = pathname === "/login" || pathname === "/";
    if (!user && !isPublicRoute) {
      router.push("/login");
    }
  }, [user, pathname, router]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
