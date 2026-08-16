"use client";

import Link from "next/link";
import { Camera, ChevronRight, History, Sparkles, Upload, Zap, Activity, Shield } from "lucide-react";
import leaf3d from "@/assets/leaf-3d.png";
import coachAvatar from "@/assets/coach-avatar.png";
import { AppShell, NotificationBell, SectionTitle } from "@/components/app-shell";
import { CropCard, ReminderCard } from "@/components/crop-ui";
import { buildCropPlan, generateReminders } from "@/lib/crop-schedule";
import { useAppState } from "@/lib/store";
import { useT } from "@/lib/i18n";

function greetingKey() {
  const h = new Date().getHours();
  if (h < 12) return "home.greeting.morning" as const;
  if (h < 17) return "home.greeting.afternoon" as const;
  return "home.greeting.evening" as const;
}

/** Animated floating orb particle */
function FloatingOrb({
  size,
  color,
  x,
  y,
  delay,
}: {
  size: number;
  color: string;
  x: string;
  y: string;
  delay: string;
}) {
  return (
    <div
      className="pointer-events-none absolute rounded-full animate-float"
      aria-hidden
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: color,
        filter: `blur(${size / 2}px)`,
        animationDelay: delay,
        opacity: 0.6,
      }}
    />
  );
}

/** 3D stat chip */
function StatChip({
  value,
  label,
  icon,
  color,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl"
      style={{
        background: "oklch(1 0 0 / 5%)",
        border: `1px solid ${color}40`,
        boxShadow: `0 0 12px ${color}20`,
      }}
    >
      <span style={{ color }}>{icon}</span>
      <span
        className="text-lg font-bold"
        style={{
          color,
          fontFamily: "var(--font-mono)",
          textShadow: `0 0 10px ${color}60`,
        }}
      >
        {value}
      </span>
      <span
        className="text-[9px] font-bold uppercase tracking-widest"
        style={{ color: "oklch(0.6 0.04 200)" }}
      >
        {label}
      </span>
    </div>
  );
}

export default function HomeScreen() {
  const t = useT();
  const { sowingDate, profile, disabledReminderIds, user } = useAppState();
  const plan = buildCropPlan("tomato", sowingDate);
  const reminders = plan
    ? generateReminders(plan).filter((r) => !disabledReminderIds.includes(r.id))
    : [];

  return (
    <AppShell>
      {/* ── Header ── */}
      <div className="relative flex items-start justify-between gap-4 px-5 pb-2 pt-8 overflow-hidden">
        {/* Ambient particles */}
        <FloatingOrb
          size={60}
          color="oklch(0.72 0.2 152 / 0.4)"
          x="-10%"
          y="20%"
          delay="0s"
        />
        <FloatingOrb
          size={40}
          color="oklch(0.78 0.18 180 / 0.35)"
          x="75%"
          y="-10%"
          delay="2s"
        />

        <div className="relative">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.25em]"
            style={{ color: "oklch(0.72 0.2 152)", fontFamily: "var(--font-mono)" }}
          >
            ◈ {profile.region}
          </p>
          <h1
            className="mt-2 font-display text-3xl font-bold"
            style={{ lineHeight: 1.1, letterSpacing: "-0.03em" }}
          >
            {user ? (
              <>
                Hello,{" "}
                <span
                  style={{
                    color: "oklch(0.72 0.2 152)",
                    textShadow: "0 0 20px oklch(0.72 0.2 152 / 0.5)",
                  }}
                >
                  {user.name}
                </span>
              </>
            ) : (
              t(greetingKey())
            )}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "oklch(0.6 0.04 200)" }}>
            {user ? "Your crops are synced & secure" : t("home.question")}
          </p>
        </div>
        <NotificationBell count={reminders.length} />
      </div>

      {/* ── Hero diagnosis card ── */}
      <section className="px-5 pt-5">
        <div
          className="animate-rise relative overflow-hidden rounded-3xl p-6"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.14 0.04 200) 0%, oklch(0.11 0.03 240) 100%)",
            border: "1px solid oklch(0.72 0.2 152 / 0.3)",
            boxShadow:
              "0 0 40px oklch(0.72 0.2 152 / 0.12), inset 0 1px 0 oklch(1 0 0 / 0.08), 0 4px 0 oklch(0.35 0.12 152 / 0.4)",
          }}
        >
          {/* Background holographic gradient */}
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl opacity-60 animate-holo"
            aria-hidden
            style={{
              background:
                "linear-gradient(135deg, oklch(0.72 0.2 152 / 0.08) 0%, oklch(0.78 0.18 180 / 0.08) 33%, oklch(0.78 0.18 75 / 0.06) 66%, oklch(0.72 0.2 152 / 0.08) 100%)",
              backgroundSize: "300% 300%",
            }}
          />

          {/* Floating leaf asset */}
          <img
            src={typeof leaf3d === "string" ? leaf3d : leaf3d.src}
            alt=""
            width={1024}
            height={1024}
            className="pointer-events-none absolute -right-4 -top-4 size-36 animate-leaf opacity-95"
            style={{ filter: "drop-shadow(0 0 20px oklch(0.72 0.2 152 / 0.6))" }}
          />

          <div className="relative">
            {/* Badge */}
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: "oklch(0.72 0.2 152 / 0.15)",
                border: "1px solid oklch(0.72 0.2 152 / 0.4)",
                color: "oklch(0.72 0.2 152)",
                boxShadow: "0 0 8px oklch(0.72 0.2 152 / 0.25)",
              }}
            >
              <Sparkles className="size-3" aria-hidden />
              MobileViT · Precision AI
            </span>

            <h2
              className="mt-3 max-w-[62%] font-display text-2xl font-bold leading-tight"
              style={{ color: "oklch(0.95 0.015 180)" }}
            >
              {t("home.diagnosis.title")}
            </h2>
            <p
              className="mt-1.5 max-w-[62%] text-xs leading-relaxed"
              style={{ color: "oklch(0.72 0.08 200)" }}
            >
              {t("home.diagnosis.sub")}
            </p>

            <div className="mt-5 flex gap-3">
              <Link
                href="/diagnose?mode=camera"
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95"
                style={{
                  background: "linear-gradient(135deg, oklch(0.72 0.2 152) 0%, oklch(0.65 0.18 165) 100%)",
                  color: "oklch(0.08 0.02 152)",
                  boxShadow:
                    "0 0 20px oklch(0.72 0.2 152 / 0.45), 0 4px 0 oklch(0.35 0.12 152), inset 0 1px 0 oklch(1 0 0 / 0.25)",
                }}
              >
                <Camera className="size-4" aria-hidden />
                {t("home.capture")}
              </Link>
              <Link
                href="/diagnose?mode=upload"
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95"
                style={{
                  background: "oklch(1 0 0 / 8%)",
                  border: "1px solid oklch(1 0 0 / 20%)",
                  color: "oklch(0.9 0.015 180)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Upload className="size-4" aria-hidden />
                {t("home.upload")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick stats row ── */}
      <section className="px-5 pt-4">
        <div className="grid grid-cols-3 gap-3">
          <StatChip
            value="38"
            label="Diseases"
            icon={<Shield className="size-4" />}
            color="oklch(0.78 0.18 180)"
          />
          <StatChip
            value="99.2%"
            label="Accuracy"
            icon={<Activity className="size-4" />}
            color="oklch(0.72 0.2 152)"
          />
          <StatChip
            value="< 2s"
            label="Analysis"
            icon={<Zap className="size-4" />}
            color="oklch(0.78 0.18 75)"
          />
        </div>
      </section>

      {/* ── Sign-in upsell card ── */}
      {!user && (
        <section className="px-5 pt-4">
          <div
            className="animate-rise relative overflow-hidden rounded-3xl p-5"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.15 0.04 55) 0%, oklch(0.13 0.03 240) 100%)",
              border: "1px solid oklch(0.78 0.18 75 / 0.3)",
              boxShadow: "0 0 30px oklch(0.78 0.18 75 / 0.1), inset 0 1px 0 oklch(1 0 0 / 0.06)",
            }}
          >
            <span
              className="absolute -right-6 -bottom-6 text-6xl opacity-10 select-none pointer-events-none"
              aria-hidden
            >
              ☁️
            </span>
            <div className="relative">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background: "oklch(0.78 0.18 75 / 0.15)",
                  border: "1px solid oklch(0.78 0.18 75 / 0.4)",
                  color: "oklch(0.78 0.18 75)",
                }}
              >
                PRO EXPERIENCE
              </span>
              <h3
                className="mt-2 font-display text-base font-bold"
                style={{ color: "oklch(0.95 0.015 180)" }}
              >
                Sync Crops to Cloud
              </h3>
              <p
                className="mt-1 text-xs max-w-[85%] leading-relaxed"
                style={{ color: "oklch(0.6 0.04 200)" }}
              >
                Back up your AI leaf diagnosis history, custom crop reminders, and get seamless
                multi-device tracking.
              </p>
              <div className="mt-4">
                <Link
                  href="/login"
                  className="inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.78 0.18 75) 0%, oklch(0.68 0.2 45) 100%)",
                    color: "oklch(0.08 0.02 60)",
                    boxShadow:
                      "0 0 12px oklch(0.78 0.18 75 / 0.4), 0 3px 0 oklch(0.5 0.15 45)",
                  }}
                >
                  Sign In / Register
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Architecture card ── */}
      <section className="px-5 pt-4">
        <div
          className="animate-rise relative overflow-hidden rounded-3xl p-5"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.14 0.04 152) 0%, oklch(0.12 0.03 220) 100%)",
            border: "1px solid oklch(0.72 0.2 152 / 0.25)",
            boxShadow: "0 0 30px oklch(0.72 0.2 152 / 0.08), inset 0 1px 0 oklch(1 0 0 / 0.06)",
          }}
        >
          <span
            className="absolute -right-4 -bottom-4 text-6xl opacity-8 select-none pointer-events-none"
            aria-hidden
          >
            ⚙️
          </span>
          <div className="relative">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: "oklch(0.72 0.2 152 / 0.15)",
                border: "1px solid oklch(0.72 0.2 152 / 0.4)",
                color: "oklch(0.72 0.2 152)",
              }}
            >
              SYSTEM CONTEXT
            </span>
            <h3
              className="mt-2 font-display text-base font-bold"
              style={{ color: "oklch(0.95 0.015 180)" }}
            >
              Architecture & Stack
            </h3>
            <p
              className="mt-1 text-xs max-w-[85%] leading-relaxed"
              style={{ color: "oklch(0.6 0.04 200)" }}
            >
              Explore the recommended stack, system architecture loops, leaf validation pipelines,
              and MobileViT training metrics.
            </p>
            <div className="mt-4">
              <Link
                href="/architecture"
                className="inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.72 0.2 152) 0%, oklch(0.58 0.18 165) 100%)",
                  color: "oklch(0.08 0.02 152)",
                  boxShadow:
                    "0 0 12px oklch(0.72 0.2 152 / 0.4), 0 3px 0 oklch(0.35 0.12 152)",
                }}
              >
                View System Architecture
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Your crops ── */}
      <section className="px-5 pt-8">
        <SectionTitle
          action={
            <Link
              href="/crops"
              className="text-[10px] font-bold uppercase tracking-wider transition-colors hover:opacity-80"
              style={{ color: "oklch(0.72 0.2 152)" }}
            >
              All crops →
            </Link>
          }
        >
          {t("home.yourCrops")}
        </SectionTitle>
        {plan ? (
          <CropCard plan={plan} />
        ) : (
          <p className="text-sm" style={{ color: "oklch(0.6 0.04 200)" }}>
            No crop added yet.
          </p>
        )}
      </section>

      {/* ── Upcoming reminders ── */}
      <section className="px-5 pt-8">
        <SectionTitle
          action={
            <Link
              href="/calendar"
              className="text-[10px] font-bold uppercase tracking-wider transition-colors hover:opacity-80"
              style={{ color: "oklch(0.72 0.2 152)" }}
            >
              Calendar →
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

      {/* ── AI Assistant ── */}
      <section className="px-5 pt-8">
        <SectionTitle>{t("home.assistant")}</SectionTitle>
        <div
          className="flex items-center gap-4 p-4 rounded-3xl"
          style={{
            background: "oklch(1 0 0 / 4%)",
            border: "1px solid oklch(1 0 0 / 8%)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: "0 0 20px oklch(0.78 0.18 180 / 0.08)",
          }}
        >
          <div
            className="size-16 shrink-0 rounded-2xl overflow-hidden"
            style={{
              boxShadow: "0 0 16px oklch(0.78 0.18 180 / 0.4)",
              border: "1px solid oklch(0.78 0.18 180 / 0.3)",
            }}
          >
            <img
              src={typeof coachAvatar === "string" ? coachAvatar : coachAvatar.src}
              alt="Crop Coach assistant"
              width={768}
              height={768}
              loading="lazy"
              className="size-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="font-bold"
              style={{ color: "oklch(0.95 0.015 180)" }}
            >
              Crop Coach
            </p>
            <p className="text-xs mt-0.5" style={{ color: "oklch(0.6 0.04 200)" }}>
              {t("home.assistant.sub")}
            </p>
            <Link
              href="/assistant"
              className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-2xl px-4 text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.78 0.18 180) 0%, oklch(0.68 0.18 195) 100%)",
                color: "oklch(0.08 0.02 200)",
                boxShadow: "0 0 12px oklch(0.78 0.18 180 / 0.4), 0 3px 0 oklch(0.4 0.14 190)",
              }}
            >
              {t("home.assistant.cta")}
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* ── History link ── */}
      <section className="px-5 pb-4 pt-4">
        <Link
          href="/history"
          className="flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          style={{
            background: "oklch(1 0 0 / 4%)",
            border: "1px solid oklch(1 0 0 / 7%)",
            backdropFilter: "blur(12px)",
          }}
        >
          <span
            className="flex size-10 items-center justify-center rounded-xl"
            style={{
              background: "oklch(0.72 0.2 152 / 0.12)",
              border: "1px solid oklch(0.72 0.2 152 / 0.3)",
            }}
          >
            <History className="size-5" style={{ color: "oklch(0.72 0.2 152)" }} aria-hidden />
          </span>
          <span className="flex-1 text-sm font-semibold" style={{ color: "oklch(0.9 0.015 180)" }}>
            Diagnosis History
          </span>
          <ChevronRight className="size-5" style={{ color: "oklch(0.5 0.04 200)" }} aria-hidden />
        </Link>
      </section>
    </AppShell>
  );
}
