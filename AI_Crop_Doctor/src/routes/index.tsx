import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, Leaf, ScanLine, Sprout } from "lucide-react";
import leaf3d from "@/assets/leaf-3d.png";
import { setState, useAppState } from "@/lib/store";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Crop Doctor" },
      {
        name: "description",
        content:
          "AI Crop Doctor detects tomato leaf diseases from a photo using a MobileViT model and gives farmers simple treatment, prevention and crop calendar guidance.",
      },
      { property: "og:title", content: "AI Crop Doctor" },
      {
        property: "og:description",
        content:
          "Detect crop diseases from a leaf photo, get farmer-friendly guidance and never miss a crop activity.",
      },
    ],
  }),
  component: SplashOnboarding,
});

const SLIDES = [
  {
    icon: ScanLine,
    title: "Detect Crop Diseases",
    body: "Capture or upload a photo of a crop leaf. Our AI model checks the leaf and tells you which disease it looks like, with a confidence score you can trust.",
  },
  {
    icon: Sprout,
    title: "Get Smart Crop Guidance",
    body: "Understand the disease in simple words — what it is, why it happened, what to do today, how to prevent it and how to treat it safely.",
  },
  {
    icon: CalendarDays,
    title: "Never Miss Important Crop Activities",
    body: "See your sowing period, growth timeline, flowering, fruiting and harvest window, with reminders calculated from your own sowing date.",
  },
];

function SplashOnboarding() {
  const t = useT();
  const navigate = useNavigate();
  const { onboarded } = useAppState();
  const [phase, setPhase] = useState<"splash" | "onboarding">("splash");
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setPhase("onboarding"), 2400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (onboarded) {
      navigate({ to: "/home" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skipToHome = () => {
    setState({ onboarded: true });
    navigate({ to: "/home" });
  };

  const finishToLogin = () => {
    setState({ onboarded: true });
    navigate({ to: "/login" });
  };

  if (phase === "splash") {
    return (
      <main className="field-hero flex min-h-screen flex-col items-center justify-center px-8 text-center">
        <div className="relative flex size-44 items-center justify-center">
          <span className="absolute inset-0 animate-ring rounded-full bg-primary-foreground/25" aria-hidden />
          <span className="absolute inset-4 rounded-full bg-primary-foreground/10" aria-hidden />
          <img
            src={leaf3d}
            alt=""
            width={1024}
            height={1024}
            className="relative size-32 animate-leaf drop-shadow-xl"
          />
          <span
            className="pointer-events-none absolute inset-x-6 h-0.5 animate-scan bg-primary-foreground/90"
            aria-hidden
          />
        </div>
        <h1 className="mt-8 font-display text-3xl font-bold">{t("app.name")}</h1>
        <p className="mt-2 text-sm opacity-90">{t("app.tagline")}</p>
        <p className="mt-10 text-xs uppercase tracking-[0.2em] opacity-70">Loading crop models…</p>
      </main>
    );
  }

  const current = SLIDES[slide]!;
  const Icon = current.icon;
  const last = slide === SLIDES.length - 1;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-screen-sm flex-col px-6 pb-10 pt-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={skipToHome}
          className="min-h-11 rounded-xl px-3 text-sm font-semibold text-muted-foreground"
        >
          {t("onboarding.skip")}
        </button>
      </div>

      <div key={slide} className="animate-rise flex flex-1 flex-col items-center justify-center text-center">
        <div className="relative flex size-52 items-center justify-center rounded-[2.5rem] bg-primary-soft shadow-lift">
          <img src={leaf3d} alt="" width={1024} height={1024} loading="lazy" className="size-32 animate-leaf" />
          <span className="absolute bottom-4 right-4 flex size-12 items-center justify-center rounded-2xl bg-card shadow-soft">
            <Icon className="size-6 text-primary" aria-hidden />
          </span>
        </div>
        <h2 className="mt-8 text-balance-tight font-display text-2xl font-bold">{current.title}</h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">{current.body}</p>
      </div>

      <div className="mb-6 flex justify-center gap-2">
        {SLIDES.map((s, i) => (
          <span
            key={s.title}
            className={`h-2 rounded-full transition-all ${i === slide ? "w-8 bg-primary" : "w-2 bg-muted"}`}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => (last ? finishToLogin() : setSlide(slide + 1))}
        className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-lift"
      >
        <Leaf className="size-5" aria-hidden />
        {last ? t("onboarding.start") : t("onboarding.next")}
      </button>
    </main>
  );
}
