"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/store";
import IntroSplash from "@/components/intro-splash";

/** Show intro once per browser session — not on every navigation. */
const SEEN_KEY = "acd.intro.seen";

export default function RootRedirect() {
  const router = useRouter();
  const { user } = useAppState();
  const [showIntro, setShowIntro] = useState<boolean | null>(null);

  // Determine on the client whether to show the intro
  useEffect(() => {
    if (typeof window === "undefined") return;
    const alreadySeen = sessionStorage.getItem(SEEN_KEY) === "1";
    setShowIntro(!alreadySeen);
  }, []);

  const handleIntroComplete = useCallback(() => {
    sessionStorage.setItem(SEEN_KEY, "1");
    setShowIntro(false);
  }, []);

  // Once intro is done (or skipped), navigate to the correct page
  useEffect(() => {
    if (showIntro !== false) return; // still loading or playing intro
    if (user) {
      router.push("/home");
    } else {
      router.push("/login");
    }
  }, [showIntro, user, router]);

  // Null = hydrating (prevents flash)
  if (showIntro === null) return null;

  if (showIntro) {
    return <IntroSplash onComplete={handleIntroComplete} />;
  }

  // Transitioning — render nothing (navigation is in progress)
  return null;
}
