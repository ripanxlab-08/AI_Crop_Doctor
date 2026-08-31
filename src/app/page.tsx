"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/store";
import IntroSplash from "@/components/intro-splash";

export default function RootRedirect() {
  const router = useRouter();
  const { user } = useAppState();
  const [splashFinished, setSplashFinished] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setSplashFinished(true);
    if (user) {
      router.push("/home");
    } else {
      router.push("/login");
    }
  }, [user, router]);

  if (!splashFinished) {
    return <IntroSplash onComplete={handleIntroComplete} />;
  }

  return null;
}
