"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/store";
import { Loader2 } from "lucide-react";

export default function RootRedirect() {
  const router = useRouter();
  const { user } = useAppState();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      router.push("/home");
    }
  }, [user, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Loader2 className="size-10 animate-spin text-primary" />
    </main>
  );
}
