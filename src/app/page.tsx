"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/store";
import IntroSplash from "@/components/intro-splash";

const SEEN_KEY = "acd.intro.seen";

export default function RootRedirect() {
  const router = useRouter();
  const { user } = useAppState();
  const [showIntro, setShowIntro] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // If not logged in, redirect directly to /login without showing intro
    if (!user) {
      router.push("/login");
      return;
    }

    const alreadySeen = sessionStorage.getItem(SEEN_KEY) === "1";
    setShowIntro(!alreadySeen);
  }, [user, router]);

  const handleIntroComplete = useCallback(() => {
    sessionStorage.setItem(SEEN_KEY, "1");
    setShowIntro(false);
  }, []);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (showIntro === false) {
      router.push("/home");
    }
  }, [showIntro, user, router]);

  if (!user) return null;
  if (showIntro === null) return null;

  if (showIntro) {
    return <IntroSplash onComplete={handleIntroComplete} />;
  }

  return null;
}
