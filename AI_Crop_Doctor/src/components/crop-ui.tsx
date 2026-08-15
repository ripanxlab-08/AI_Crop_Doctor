import { Link } from "@tanstack/react-router";
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

const STAGE_BG: Record<string, string> = {
  "stage-1": "bg-stage-1",
  "stage-2": "bg-stage-2",
  "stage-3": "bg-stage-3",
  "stage-4": "bg-stage-4",
  "stage-5": "bg-stage-5",
};

/** Sowing → Growth → Flowering → Fruiting → Harvest, current stage highlighted. */
export function CropTimeline({ plan, compact = false }: { plan: CropPlan; compact?: boolean }) {
  return (
    <div>
      <div className="flex gap-1.5" role="list" aria-label="Crop growth stages">
        {plan.windows.map((w) => (
          <div key={w.stage.key} role="listitem" className="flex-1">
            <div
              className={cn(
                "h-2 rounded-full transition-all",
                w.status === "upcoming" ? "bg-muted" : STAGE_BG[w.stage.tone],
                w.status === "current" && "h-2.5 ring-2 ring-primary/25",
              )}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5">
        {plan.windows.map((w) => (
          <p
            key={w.stage.key}
            className={cn(
              "flex-1 text-center text-[10px] leading-tight",
              w.status === "current" ? "font-bold text-foreground" : "text-muted-foreground",
            )}
          >
            {w.stage.label}
          </p>
        ))}
      </div>
      {!compact && plan.currentStage ? (
        <p className="mt-3 rounded-xl bg-secondary px-3 py-2 text-xs text-secondary-foreground">
          {plan.currentStage.farmerNote}
        </p>
      ) : null}
    </div>
  );
}

export function CropCard({ plan }: { plan: CropPlan }) {
  return (
    <Link to="/crops" className="block surface-lift animate-rise p-4">
      <div className="flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-2xl">
          {plan.crop.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{plan.crop.name}</p>
          <p className="text-xs text-muted-foreground">
            Day {plan.dayInCycle} of {plan.crop.growingDurationDays} · sown{" "}
            {formatDate(plan.sowingDate)}
          </p>
        </div>
        <span className="rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success">
          Growing
        </span>
      </div>
      <div className="mt-4">
        <CropTimeline plan={plan} />
      </div>
    </Link>
  );
}

const TONE_STYLES: Record<ReminderTone, { icon: typeof Leaf; wrap: string }> = {
  harvest: { icon: CalendarClock, wrap: "bg-accent-soft text-accent-foreground" },
  stage: { icon: Sprout, wrap: "bg-primary-soft text-primary" },
  watering: { icon: Droplets, wrap: "bg-info-soft text-info" },
  disease: { icon: ScanLine, wrap: "bg-warning-soft text-warning-foreground" },
  planting: { icon: Leaf, wrap: "bg-success-soft text-success" },
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
  const { icon: Icon, wrap } = TONE_STYLES[reminder.tone];
  return (
    <article className={cn("surface p-4", !enabled && "opacity-60")}>
      <div className="flex gap-3">
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", wrap)}>
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug">{reminder.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{reminder.detail}</p>
          <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {relativeDay(reminder.date)} · {formatDate(new Date(reminder.date))}
          </p>
        </div>
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={enabled}
            aria-label={enabled ? "Disable notification" : "Enable notification"}
            className={cn(
              "mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors",
              enabled ? "bg-primary" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "block size-5 rounded-full bg-card shadow-soft transition-transform",
                enabled ? "translate-x-5.5" : "translate-x-0.5",
              )}
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
  const wrap =
    tone === "accent"
      ? "bg-accent-soft"
      : tone === "warning"
        ? "bg-warning-soft"
        : "bg-primary-soft";
  return (
    <article className={cn("rounded-2xl p-4", wrap)}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
    </article>
  );
}

export function ConfidenceIndicator({ confidence }: { confidence: number }) {
  const band = confidenceBand(confidence);
  const pct = (confidence * 100).toFixed(1);
  const barTone =
    band.tone === "success" ? "bg-success" : band.tone === "warning" ? "bg-warning" : "bg-destructive";
  const textTone =
    band.tone === "success"
      ? "text-success"
      : band.tone === "warning"
        ? "text-warning-foreground"
        : "text-destructive";
  return (
    <div>
      <div className="flex items-end justify-between">
        <p className="font-display text-4xl font-bold tabular-nums">{pct}%</p>
        <p className={cn("pb-1 text-sm font-semibold", textTone)}>{band.label}</p>
      </div>
      <div
        role="progressbar"
        aria-valuenow={Number(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Prediction confidence"
        className="mt-2 h-3 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-700", barTone)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Prepared for text-to-speech; announces intent honestly until TTS is wired. */
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
      className={cn(
        "inline-flex min-h-12 items-center gap-2 rounded-2xl px-4 text-sm font-semibold transition-colors",
        variant === "solid"
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-card text-foreground",
      )}
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
      className={cn(
        "relative flex size-12 shrink-0 items-center justify-center rounded-2xl transition-colors",
        active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
      )}
    >
      {active ? (
        <span className="absolute inset-0 animate-ring rounded-2xl bg-primary/30" aria-hidden />
      ) : null}
      <Mic className="size-5" aria-hidden />
    </button>
  );
}

export function LoadingScanner({ label, image }: { label: string; image?: string | undefined }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative size-56 overflow-hidden rounded-3xl bg-primary-soft shadow-lift">
        {image ? (
          <img src={image} alt="Leaf being analysed" className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center">
            <Leaf className="size-16 text-primary animate-leaf" aria-hidden />
          </span>
        )}
        <span
          className="pointer-events-none absolute inset-x-0 h-0.5 animate-scan bg-primary shadow-[0_0_18px_2px_var(--color-primary)]"
          aria-hidden
        />
        <span className="pointer-events-none absolute inset-3 rounded-2xl border-2 border-primary/50" aria-hidden />
      </div>
      <p aria-live="polite" className="mt-5 text-sm font-semibold">
        {label}
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
  const wrap =
    kind === "danger" ? "bg-destructive-soft text-destructive" : "bg-warning-soft text-warning-foreground";
  return (
    <div className="surface p-5 text-center">
      <span className={cn("mx-auto flex size-14 items-center justify-center rounded-2xl", wrap)}>
        <Icon className="size-7" aria-hidden />
      </span>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 min-h-12 w-full rounded-2xl bg-primary px-4 font-semibold text-primary-foreground"
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
      {plan.windows.map((w) => (
        <li
          key={w.stage.key}
          className={cn(
            "flex items-center gap-3 rounded-2xl px-3 py-3",
            w.status === "current" ? "bg-primary-soft" : "bg-secondary/60",
          )}
        >
          <span className={cn("size-3 shrink-0 rounded-full", STAGE_BG[w.stage.tone])} aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              {w.stage.label}
              {w.status === "current" ? " · now" : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              {w.stage.startDay === w.stage.endDay
                ? formatDate(w.start)
                : formatRange(w.start, w.end)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
