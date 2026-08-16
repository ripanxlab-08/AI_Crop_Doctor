import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  Droplets,
  Leaf,
  Mic,
  ScanLine,
  Sprout,
  Volume2,
  WifiOff,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { CropPlan, Reminder, ReminderTone } from "@/lib/crop-schedule";
import { formatDate, formatRange, relativeDay } from "@/lib/crop-schedule";
import { confidenceBand } from "@/services/crop-api";

const STAGE_COLORS: Record<string, { bar: string; glow: string }> = {
  "stage-1": { bar: "oklch(0.72 0.18 100)", glow: "oklch(0.72 0.18 100 / 0.5)" },
  "stage-2": { bar: "oklch(0.72 0.2 152)", glow: "oklch(0.72 0.2 152 / 0.5)" },
  "stage-3": { bar: "oklch(0.7 0.16 90)", glow: "oklch(0.7 0.16 90 / 0.5)" },
  "stage-4": { bar: "oklch(0.72 0.18 45)", glow: "oklch(0.72 0.18 45 / 0.5)" },
  "stage-5": { bar: "oklch(0.65 0.2 30)", glow: "oklch(0.65 0.2 30 / 0.5)" },
};

/** Sowing → Growth → Flowering → Fruiting → Harvest, current stage highlighted. */
export function CropTimeline({ plan, compact = false }: { plan: CropPlan; compact?: boolean }) {
  return (
    <div>
      <div className="flex gap-1.5" role="list" aria-label="Crop growth stages">
        {plan.windows.map((w) => {
          const colors = STAGE_COLORS[w.stage.tone] ?? { bar: "oklch(0.5 0.05 200)", glow: "transparent" };
          return (
            <div key={w.stage.key} role="listitem" className="flex-1">
              <div
                className="rounded-full transition-all duration-500"
                style={{
                  height: w.status === "current" ? "10px" : "6px",
                  background:
                    w.status === "upcoming"
                      ? "oklch(1 0 0 / 10%)"
                      : `linear-gradient(90deg, ${colors.bar}, ${colors.bar})`,
                  boxShadow:
                    w.status === "current"
                      ? `0 0 8px ${colors.glow}, 0 0 16px ${colors.glow}`
                      : "none",
                  border: w.status === "current" ? `1px solid ${colors.bar}60` : "none",
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5">
        {plan.windows.map((w) => (
          <p
            key={w.stage.key}
            className="flex-1 text-center text-[10px] leading-tight font-medium"
            style={{
              color:
                w.status === "current"
                  ? "oklch(0.72 0.2 152)"
                  : "oklch(0.5 0.04 200)",
              fontFamily: w.status === "current" ? "var(--font-mono)" : undefined,
            }}
          >
            {w.stage.label}
          </p>
        ))}
      </div>
      {!compact && plan.currentStage ? (
        <p
          className="mt-3 rounded-xl px-3 py-2 text-xs leading-relaxed"
          style={{
            background: "oklch(0.72 0.2 152 / 0.08)",
            border: "1px solid oklch(0.72 0.2 152 / 0.2)",
            color: "oklch(0.75 0.08 180)",
          }}
        >
          {plan.currentStage.farmerNote}
        </p>
      ) : null}
    </div>
  );
}

export function CropCard({ plan }: { plan: CropPlan }) {
  return (
    <Link
      href="/crops"
      className="block animate-rise p-4 rounded-3xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
      style={{
        background: "oklch(1 0 0 / 5%)",
        border: "1px solid oklch(1 0 0 / 10%)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 4px 24px oklch(0 0 0 / 0.3), 0 0 0 1px oklch(0.72 0.2 152 / 0.1)",
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex size-12 items-center justify-center rounded-2xl text-2xl"
          style={{
            background: "oklch(0.72 0.2 152 / 0.12)",
            border: "1px solid oklch(0.72 0.2 152 / 0.3)",
            boxShadow: "0 0 12px oklch(0.72 0.2 152 / 0.2)",
          }}
        >
          {plan.crop.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold" style={{ color: "oklch(0.95 0.015 180)" }}>
            {plan.crop.name}
          </p>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.6 0.04 200)", fontFamily: "var(--font-mono)" }}
          >
            Day {plan.dayInCycle} / {plan.crop.growingDurationDays} · {formatDate(plan.sowingDate)}
          </p>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-bold"
          style={{
            background: "oklch(0.72 0.2 152 / 0.12)",
            border: "1px solid oklch(0.72 0.2 152 / 0.4)",
            color: "oklch(0.72 0.2 152)",
            boxShadow: "0 0 8px oklch(0.72 0.2 152 / 0.2)",
          }}
        >
          Growing
        </span>
      </div>
      <div className="mt-4">
        <CropTimeline plan={plan} />
      </div>
    </Link>
  );
}

const TONE_ICONS: Record<ReminderTone, typeof Leaf> = {
  harvest: CalendarClock,
  stage: Sprout,
  watering: Droplets,
  disease: ScanLine,
  planting: Leaf,
};

const TONE_COLORS: Record<ReminderTone, { bg: string; border: string; icon: string; glow: string }> = {
  harvest: {
    bg: "oklch(0.78 0.18 75 / 0.1)",
    border: "oklch(0.78 0.18 75 / 0.3)",
    icon: "oklch(0.78 0.18 75)",
    glow: "oklch(0.78 0.18 75 / 0.2)",
  },
  stage: {
    bg: "oklch(0.72 0.2 152 / 0.1)",
    border: "oklch(0.72 0.2 152 / 0.3)",
    icon: "oklch(0.72 0.2 152)",
    glow: "oklch(0.72 0.2 152 / 0.2)",
  },
  watering: {
    bg: "oklch(0.68 0.15 230 / 0.1)",
    border: "oklch(0.68 0.15 230 / 0.3)",
    icon: "oklch(0.68 0.15 230)",
    glow: "oklch(0.68 0.15 230 / 0.2)",
  },
  disease: {
    bg: "oklch(0.65 0.22 27 / 0.1)",
    border: "oklch(0.65 0.22 27 / 0.3)",
    icon: "oklch(0.65 0.22 27)",
    glow: "oklch(0.65 0.22 27 / 0.2)",
  },
  planting: {
    bg: "oklch(0.78 0.18 180 / 0.1)",
    border: "oklch(0.78 0.18 180 / 0.3)",
    icon: "oklch(0.78 0.18 180)",
    glow: "oklch(0.78 0.18 180 / 0.2)",
  },
};

export function ReminderCard({
  reminder,
  enabled = true,
  onToggle,
  actions,
}: {
  reminder: Reminder;
  enabled?: boolean;
  onToggle?: () => void;
  actions?: ReactNode;
}) {
  const Icon = TONE_ICONS[reminder.tone];
  const toneColors = TONE_COLORS[reminder.tone];

  return (
    <article
      className="p-4 rounded-2xl transition-all duration-300"
      style={{
        background: "oklch(1 0 0 / 4%)",
        border: `1px solid ${toneColors.border}`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: `0 0 16px ${toneColors.glow}`,
        opacity: enabled ? 1 : 0.5,
      }}
    >
      <div className="flex gap-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: toneColors.bg,
            border: `1px solid ${toneColors.border}`,
            boxShadow: `0 0 8px ${toneColors.glow}`,
          }}
        >
          <Icon className="size-5" style={{ color: toneColors.icon }} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug" style={{ color: "oklch(0.92 0.015 180)" }}>
            {reminder.title}
          </p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: "oklch(0.6 0.04 200)" }}>
            {reminder.detail}
          </p>
          <p
            className="mt-2 text-[10px] font-bold uppercase tracking-wider"
            style={{ color: toneColors.icon, fontFamily: "var(--font-mono)" }}
          >
            {relativeDay(reminder.date)} · {formatDate(new Date(reminder.date))}
          </p>
        </div>
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={enabled}
            aria-label={enabled ? "Disable notification" : "Enable notification"}
            className="mt-0.5 h-6 w-11 shrink-0 rounded-full transition-all duration-300"
            style={{
              background: enabled
                ? "linear-gradient(90deg, oklch(0.72 0.2 152) 0%, oklch(0.65 0.18 165) 100%)"
                : "oklch(1 0 0 / 10%)",
              boxShadow: enabled ? "0 0 8px oklch(0.72 0.2 152 / 0.5)" : "none",
              border: "1px solid oklch(1 0 0 / 10%)",
            }}
          >
            <span
              className="block size-5 rounded-full transition-transform shadow-sm"
              style={{
                background: enabled ? "oklch(0.08 0.02 152)" : "oklch(0.5 0.04 200)",
                transform: enabled ? "translateX(22px)" : "translateX(2px)",
              }}
            />
          </button>
        ) : null}
      </div>
      {actions ? <div className="mt-3 flex gap-2">{actions}</div> : null}
    </article>
  );
}

export function NotificationCard({
  title,
  body,
  tone = "primary",
}: {
  title: string;
  body: string;
  tone?: "primary" | "accent" | "warning";
}) {
  const colors =
    tone === "accent"
      ? { bg: "oklch(0.78 0.18 180 / 0.1)", border: "oklch(0.78 0.18 180 / 0.3)", text: "oklch(0.78 0.18 180)" }
      : tone === "warning"
        ? { bg: "oklch(0.78 0.18 75 / 0.1)", border: "oklch(0.78 0.18 75 / 0.3)", text: "oklch(0.78 0.18 75)" }
        : { bg: "oklch(0.72 0.2 152 / 0.1)", border: "oklch(0.72 0.2 152 / 0.3)", text: "oklch(0.72 0.2 152)" };

  return (
    <article
      className="rounded-2xl p-4"
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
      }}
    >
      <p className="text-sm font-semibold" style={{ color: colors.text }}>
        {title}
      </p>
      <p className="mt-1 text-xs leading-relaxed" style={{ color: "oklch(0.6 0.04 200)" }}>
        {body}
      </p>
    </article>
  );
}

export function ConfidenceIndicator({ confidence }: { confidence: number }) {
  const band = confidenceBand(confidence);
  const pct = (confidence * 100).toFixed(1);

  const colors =
    band.tone === "success"
      ? { bar: "oklch(0.72 0.2 152)", glow: "oklch(0.72 0.2 152 / 0.5)", text: "oklch(0.72 0.2 152)" }
      : band.tone === "warning"
        ? { bar: "oklch(0.78 0.18 75)", glow: "oklch(0.78 0.18 75 / 0.5)", text: "oklch(0.78 0.18 75)" }
        : { bar: "oklch(0.65 0.22 27)", glow: "oklch(0.65 0.22 27 / 0.5)", text: "oklch(0.65 0.22 27)" };

  return (
    <div>
      <div className="flex items-end justify-between">
        <p
          className="font-display text-5xl font-bold tabular-nums"
          style={{
            color: colors.text,
            textShadow: `0 0 20px ${colors.glow}`,
            fontFamily: "var(--font-mono)",
          }}
        >
          {pct}%
        </p>
        <p
          className="pb-1 text-sm font-bold uppercase tracking-wider"
          style={{ color: colors.text }}
        >
          {band.label}
        </p>
      </div>
      <div
        role="progressbar"
        aria-valuenow={Number(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Prediction confidence"
        className="mt-3 h-3 overflow-hidden rounded-full"
        style={{ background: "oklch(1 0 0 / 8%)" }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-1000"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${colors.bar}, oklch(0.78 0.18 180))`,
            boxShadow: `0 0 8px ${colors.glow}, 0 0 16px ${colors.glow}`,
          }}
        />
      </div>
    </div>
  );
}

/** Voice/TTS button */
export function VoiceButton({
  label = "Listen to this",
  onClick,
  variant = "outline",
}: {
  label?: string;
  onClick?: () => void;
  variant?: "outline" | "solid";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-12 items-center gap-2 rounded-2xl px-4 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-95"
      style={
        variant === "solid"
          ? {
              background:
                "linear-gradient(135deg, oklch(0.72 0.2 152) 0%, oklch(0.65 0.18 165) 100%)",
              color: "oklch(0.08 0.02 152)",
              boxShadow: "0 0 12px oklch(0.72 0.2 152 / 0.4), 0 3px 0 oklch(0.35 0.12 152)",
            }
          : {
              background: "oklch(1 0 0 / 5%)",
              border: "1px solid oklch(1 0 0 / 12%)",
              color: "oklch(0.9 0.015 180)",
              backdropFilter: "blur(8px)",
            }
      }
    >
      <Volume2 className="size-5" aria-hidden />
      {label}
    </button>
  );
}

export function MicButton({ onClick, active }: { onClick?: () => void; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Ask by voice"
      className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95"
      style={{
        background: active
          ? "linear-gradient(135deg, oklch(0.72 0.2 152) 0%, oklch(0.65 0.18 165) 100%)"
          : "oklch(1 0 0 / 6%)",
        border: `1px solid ${active ? "oklch(0.72 0.2 152 / 0.5)" : "oklch(1 0 0 / 10%)"}`,
        color: active ? "oklch(0.08 0.02 152)" : "oklch(0.7 0.04 200)",
        boxShadow: active ? "0 0 16px oklch(0.72 0.2 152 / 0.5)" : "none",
      }}
    >
      {active ? (
        <span
          className="absolute inset-0 animate-ring rounded-2xl"
          style={{ background: "oklch(0.72 0.2 152 / 0.3)" }}
          aria-hidden
        />
      ) : null}
      <Mic className="size-5" aria-hidden />
    </button>
  );
}

export function LoadingScanner({ label, image }: { label: string; image?: string | undefined }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative size-56 overflow-hidden rounded-3xl"
        style={{
          background: "oklch(0.12 0.03 240)",
          border: "1px solid oklch(0.72 0.2 152 / 0.3)",
          boxShadow: "0 0 40px oklch(0.72 0.2 152 / 0.2), inset 0 0 40px oklch(0 0 0 / 0.3)",
        }}
      >
        {image ? (
          <img src={image} alt="Leaf being analysed" className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center">
            <Leaf
              className="size-16 animate-leaf"
              style={{ color: "oklch(0.72 0.2 152)", filter: "drop-shadow(0 0 16px oklch(0.72 0.2 152 / 0.8))" }}
              aria-hidden
            />
          </span>
        )}

        {/* Scan line with neon glow */}
        <span
          className="pointer-events-none absolute inset-x-0 h-0.5 animate-scan"
          style={{
            background: "oklch(0.72 0.2 152)",
            boxShadow:
              "0 0 12px 3px oklch(0.72 0.2 152 / 0.8), 0 0 30px 8px oklch(0.72 0.2 152 / 0.4)",
          }}
          aria-hidden
        />

        {/* Corner brackets */}
        <span
          className="pointer-events-none absolute inset-3 rounded-2xl"
          style={{ border: "1px solid oklch(0.72 0.2 152 / 0.4)" }}
          aria-hidden
        />

        {/* Corner accents */}
        {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos, i) => (
          <span
            key={i}
            className={cn("pointer-events-none absolute size-5 border-2", pos)}
            style={{
              borderColor: "oklch(0.72 0.2 152)",
              borderRadius: i === 0 ? "8px 0 0 0" : i === 1 ? "0 8px 0 0" : i === 2 ? "0 0 0 8px" : "0 0 8px 0",
              borderWidth: "2px",
              borderStyle: `solid ${i % 2 === 0 ? "none solid" : "solid none"} ${i < 2 ? "none" : "solid"} ${i === 0 || i === 3 ? "solid" : "none"}`,
            }}
            aria-hidden
          />
        ))}
      </div>

      <p
        aria-live="polite"
        className="mt-5 text-sm font-bold uppercase tracking-widest"
        style={{
          color: "oklch(0.72 0.2 152)",
          fontFamily: "var(--font-mono)",
          textShadow: "0 0 10px oklch(0.72 0.2 152 / 0.6)",
        }}
      >
        ◈ {label}
      </p>
    </div>
  );
}

export function ErrorState({
  title,
  message,
  hint,
  onRetry,
  retryLabel = "Try again",
  kind = "warning",
}: {
  title: string;
  message: string;
  hint?: string;
  onRetry?: () => void;
  retryLabel?: string;
  kind?: "warning" | "offline" | "danger";
}) {
  const Icon = kind === "offline" ? WifiOff : AlertTriangle;
  const colors =
    kind === "danger"
      ? { bg: "oklch(0.65 0.22 27 / 0.1)", border: "oklch(0.65 0.22 27 / 0.3)", icon: "oklch(0.65 0.22 27)", glow: "oklch(0.65 0.22 27 / 0.3)" }
      : { bg: "oklch(0.78 0.18 75 / 0.1)", border: "oklch(0.78 0.18 75 / 0.3)", icon: "oklch(0.78 0.18 75)", glow: "oklch(0.78 0.18 75 / 0.3)" };

  return (
    <div
      className="p-6 text-center rounded-3xl"
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        boxShadow: `0 0 24px ${colors.glow}`,
      }}
    >
      <span
        className="mx-auto flex size-16 items-center justify-center rounded-2xl"
        style={{
          background: `${colors.icon}15`,
          border: `1px solid ${colors.border}`,
          boxShadow: `0 0 16px ${colors.glow}`,
        }}
      >
        <Icon className="size-8" style={{ color: colors.icon }} aria-hidden />
      </span>
      <h3
        className="mt-4 text-base font-bold"
        style={{ color: "oklch(0.95 0.015 180)" }}
      >
        {title}
      </h3>
      <p className="mt-1 text-sm" style={{ color: "oklch(0.6 0.04 200)" }}>
        {message}
      </p>
      {hint ? (
        <p className="mt-2 text-xs" style={{ color: "oklch(0.5 0.04 200)" }}>
          {hint}
        </p>
      ) : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 min-h-12 w-full rounded-2xl px-4 font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.72 0.2 152) 0%, oklch(0.65 0.18 165) 100%)",
            color: "oklch(0.08 0.02 152)",
            boxShadow: "0 0 12px oklch(0.72 0.2 152 / 0.4), 0 3px 0 oklch(0.35 0.12 152)",
          }}
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}

export function StageRangeList({ plan }: { plan: CropPlan }) {
  return (
    <ul className="space-y-2">
      {plan.windows.map((w) => {
        const colors = STAGE_COLORS[w.stage.tone] ?? { bar: "oklch(0.5 0.05 200)", glow: "transparent" };
        return (
          <li
            key={w.stage.key}
            className="flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-200"
            style={{
              background: w.status === "current" ? "oklch(0.72 0.2 152 / 0.08)" : "oklch(1 0 0 / 4%)",
              border: `1px solid ${w.status === "current" ? "oklch(0.72 0.2 152 / 0.3)" : "oklch(1 0 0 / 7%)"}`,
              boxShadow: w.status === "current" ? "0 0 12px oklch(0.72 0.2 152 / 0.15)" : "none",
            }}
          >
            <span
              className="size-3 shrink-0 rounded-full"
              style={{
                background: colors.bar,
                boxShadow: w.status !== "upcoming" ? `0 0 6px ${colors.glow}` : "none",
              }}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p
                className="text-sm font-semibold"
                style={{ color: w.status === "current" ? "oklch(0.95 0.015 180)" : "oklch(0.75 0.04 200)" }}
              >
                {w.stage.label}
                {w.status === "current" ? (
                  <span
                    className="ml-2 text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: "oklch(0.72 0.2 152)", fontFamily: "var(--font-mono)" }}
                  >
                    ● now
                  </span>
                ) : ""}
              </p>
              <p className="text-xs" style={{ color: "oklch(0.5 0.04 200)", fontFamily: "var(--font-mono)" }}>
                {w.stage.startDay === w.stage.endDay
                  ? formatDate(w.start)
                  : formatRange(w.start, w.end)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
