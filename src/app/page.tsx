"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import IntroSplash from "@/components/intro-splash";

export default function RootRedirect() {
  const router = useRouter();
  const [splashFinished, setSplashFinished] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setSplashFinished(true);
    router.push("/login");
  }, [router]);

  if (!splashFinished) {
    return <IntroSplash onComplete={handleIntroComplete} />;
  }

  return null;
}
