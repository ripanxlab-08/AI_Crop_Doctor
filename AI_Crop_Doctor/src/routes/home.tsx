import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, ChevronRight, History, Sparkles, Upload } from "lucide-react";
import leaf3d from "@/assets/leaf-3d.png";
import coachAvatar from "@/assets/coach-avatar.png";
import { AppShell, NotificationBell, SectionTitle } from "@/components/app-shell";
import { CropCard, ReminderCard } from "@/components/crop-ui";
import { buildCropPlan, generateReminders } from "@/lib/crop-schedule";
import { useAppState } from "@/lib/store";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "AI Crop Doctor" },
      {
        name: "description",
        content:
          "Your crop dashboard: run an AI leaf diagnosis, follow your tomato growth stage and see upcoming crop reminders.",
      },
      { property: "og:title", content: "AI Crop Doctor" },
      {
        property: "og:description",
        content: "Run an AI leaf diagnosis and follow your tomato crop stage and reminders.",
      },
    ],
  }),
  component: HomeScreen,
});

function greetingKey() {
  const h = new Date().getHours();
  if (h < 12) return "home.greeting.morning" as const;
  if (h < 17) return "home.greeting.afternoon" as const;
  return "home.greeting.evening" as const;
}

function HomeScreen() {
  const t = useT();
  const { sowingDate, profile, disabledReminderIds, user } = useAppState();
  const plan = buildCropPlan("tomato", sowingDate);
  const reminders = plan
    ? generateReminders(plan).filter((r) => !disabledReminderIds.includes(r.id))
    : [];

  return (
    <AppShell>
      <div className="flex items-start justify-between gap-4 px-5 pb-2 pt-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {profile.region}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold">
            {user ? `Hello, ${user.name}` : t(greetingKey())}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {user ? "Your crops are synced & secure" : t("home.question")}
          </p>
        </div>
        <NotificationBell count={reminders.length} />
      </div>

      <section className="px-5 pt-4">
        <div className="field-hero animate-rise relative overflow-hidden rounded-3xl p-5 shadow-lift">
          <img
            src={leaf3d}
            alt=""
            width={1024}
            height={1024}
            className="pointer-events-none absolute -right-6 -top-4 size-40 animate-leaf opacity-90"
          />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-[11px] font-semibold">
            <Sparkles className="size-3.5" aria-hidden /> MobileViT · Tomato
          </span>
          <h2 className="mt-3 max-w-[62%] text-balance-tight font-display text-2xl font-bold">
            {t("home.diagnosis.title")}
          </h2>
          <p className="mt-1 max-w-[62%] text-xs opacity-90">{t("home.diagnosis.sub")}</p>
          <div className="mt-5 flex gap-3">
            <Link
              to="/diagnose"
              search={{ mode: "camera" }}
              className="flex min-h-13 flex-1 items-center justify-center gap-2 rounded-2xl bg-card text-sm font-semibold text-foreground shadow-soft"
            >
              <Camera className="size-5" aria-hidden />
              {t("home.capture")}
            </Link>
            <Link
              to="/diagnose"
              search={{ mode: "upload" }}
              className="flex min-h-13 flex-1 items-center justify-center gap-2 rounded-2xl border border-primary-foreground/35 text-sm font-semibold"
            >
              <Upload className="size-5" aria-hidden />
              {t("home.upload")}
            </Link>
          </div>
        </div>
      </section>

      {!user && (
        <section className="px-5 pt-4">
          <div className="surface-lift animate-rise relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-accent-soft to-card border border-accent/20">
            <span className="absolute -right-6 -bottom-6 text-7xl opacity-15 select-none pointer-events-none">
              ☁️
            </span>
            <div className="relative">
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/25 px-2.5 py-0.5 text-[10px] font-bold text-accent-foreground">
                PRO EXPERIENCE
              </span>
              <h3 className="mt-2 font-display text-base font-bold text-foreground">
                Sync Crops to Cloud
              </h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-[85%] leading-relaxed">
                Back up your AI leaf diagnosis history, custom crop reminders, and get seamless multi-device tracking.
              </p>
              <div className="mt-4">
                <Link
                  to="/login"
                  className="inline-flex min-h-10 items-center justify-center rounded-xl bg-accent px-4 text-xs font-bold text-accent-foreground shadow-[0_3px_0_oklch(0.65_0.14_70)] active:shadow-none active:translate-y-[3px] transition-all"
                >
                  Sign In / Register
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="px-5 pt-7">
        <SectionTitle
          action={
            <Link to="/crops" className="text-xs font-semibold text-primary">
              All crops
            </Link>
          }
        >
          {t("home.yourCrops")}
        </SectionTitle>
        {plan ? (
          <CropCard plan={plan} />
        ) : (
          <p className="text-sm text-muted-foreground">No crop added yet.</p>
        )}
      </section>

      <section className="px-5 pt-7">
        <SectionTitle
          action={
            <Link to="/calendar" className="text-xs font-semibold text-primary">
              Calendar
            </Link>
          }
        >
          {t("home.upcoming")}
        </SectionTitle>
        <div className="space-y-3">
          {reminders.slice(0, 3).map((r) => (
            <ReminderCard key={r.id} reminder={r} />
          ))}
        </div>
      </section>

      <section className="px-5 pt-7">
        <SectionTitle>{t("home.assistant")}</SectionTitle>
        <div className="surface-lift flex items-center gap-4 p-4">
          <img
            src={coachAvatar}
            alt="Crop Coach assistant"
            width={768}
            height={768}
            loading="lazy"
            className="size-16 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Crop Coach</p>
            <p className="text-xs text-muted-foreground">{t("home.assistant.sub")}</p>
            <Link
              to="/assistant"
              className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              {t("home.assistant.cta")}
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-5 pb-4 pt-7">
        <Link to="/history" className="surface flex items-center gap-3 p-4">
          <span className="flex size-10 items-center justify-center rounded-xl bg-secondary">
            <History className="size-5 text-secondary-foreground" aria-hidden />
          </span>
          <span className="flex-1 text-sm font-semibold">Diagnosis History</span>
          <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
        </Link>
      </section>
    </AppShell>
  );
}
