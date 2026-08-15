"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ChevronRight,
  Clock,
  Info,
  Leaf,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { AppShell, AppHeader, SectionTitle } from "@/components/app-shell";
import { ConfidenceIndicator, ErrorState, VoiceButton } from "@/components/crop-ui";
import { getDiseaseByName } from "@/data/crops";
import type { StageTreatment } from "@/data/crops";
import { useAppState } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/* ─────────────────────────────── helpers ───────────────────────────────── */

function InfoBlock({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Leaf;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface p-4">
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft">
          <Icon className="size-4.5 text-primary" aria-hidden />
        </span>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="mt-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
          <span>{i}</span>
        </li>
      ))}
    </ul>
  );
}

/* ──────────────────────────── stage panel ───────────────────────────────── */

/** Colour tokens per stage — all HSL so they work in both light / dark modes. */
const STAGE_STYLES = {
  G0: {
    bg: "bg-[hsl(142_76%_36%/0.12)]",
    border: "border-[hsl(142_76%_36%/0.35)]",
    badge: "bg-[hsl(142_76%_36%)] text-white",
    bar: "bg-[hsl(142_76%_36%)]",
    text: "text-[hsl(142_76%_25%)] dark:text-[hsl(142_76%_60%)]",
  },
  G1: {
    bg: "bg-[hsl(48_96%_53%/0.12)]",
    border: "border-[hsl(48_96%_53%/0.4)]",
    badge: "bg-[hsl(48_96%_53%)] text-black",
    bar: "bg-[hsl(48_96%_53%)]",
    text: "text-[hsl(38_92%_35%)] dark:text-[hsl(48_96%_65%)]",
  },
  G2: {
    bg: "bg-[hsl(25_95%_53%/0.12)]",
    border: "border-[hsl(25_95%_53%/0.4)]",
    badge: "bg-[hsl(25_95%_53%)] text-white",
    bar: "bg-[hsl(25_95%_53%)]",
    text: "text-[hsl(25_95%_35%)] dark:text-[hsl(25_95%_65%)]",
  },
  G3: {
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    badge: "bg-destructive text-destructive-foreground",
    bar: "bg-destructive",
    text: "text-destructive",
  },
} as const;

const STAGE_LABELS: Record<"G0" | "G1" | "G2" | "G3", string> = {
  G0: "Healthy",
  G1: "Early / Mild",
  G2: "Moderate",
  G3: "Severe",
};

function StagePanel({
  stage,
  lesionPct,
  stageTreatment,
}: {
  stage: "G0" | "G1" | "G2" | "G3";
  lesionPct: number;
  stageTreatment: StageTreatment;
}) {
  const styles = STAGE_STYLES[stage];
  const [barWidth, setBarWidth] = useState(0);

  // Animate bar on mount
  useEffect(() => {
    const t = setTimeout(() => setBarWidth(Math.min(lesionPct, 100)), 250);
    return () => clearTimeout(t);
  }, [lesionPct]);

  return (
    <section
      className={cn("rounded-2xl border p-4 space-y-4 animate-rise", styles.bg, styles.border)}
      aria-label="Disease stage and treatment"
    >
      {/* ── Stage header ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl" aria-hidden>
            {stageTreatment.emoji}
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Disease Stage
            </p>
            <h3 className={cn("text-xl font-bold font-display leading-tight", styles.text)}>
              {stage} — {STAGE_LABELS[stage]}
            </h3>
          </div>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest shrink-0",
            styles.badge,
          )}
        >
          {stage}
        </span>
      </div>

      {/* ── Lesion percentage bar (hidden for G0) ── */}
      {stage !== "G0" && (
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground font-medium">Leaf Lesion Area</span>
            <span className={cn("font-bold tabular-nums", styles.text)}>{lesionPct}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000 ease-out",
                styles.bar,
              )}
              style={{ width: `${barWidth}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] mt-1 text-muted-foreground px-0.5">
            <span>0%</span>
            <span>15%</span>
            <span>40%</span>
            <span>100%</span>
          </div>
          {/* Stage markers */}
          <div className="flex gap-1 mt-2.5">
            {(["G0", "G1", "G2", "G3"] as const).map((s) => (
              <div
                key={s}
                className={cn(
                  "flex-1 rounded-lg py-1.5 text-center text-[10px] font-bold transition-all",
                  s === stage
                    ? cn("shadow-sm", STAGE_STYLES[s].badge)
                    : "bg-muted/60 text-muted-foreground",
                )}
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Stage-specific recommendations ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
          {stage === "G0" ? "✅ Status" : `🌿 Stage ${stage} Treatment`}
        </p>
        <ul className="space-y-2.5">
          {stageTreatment.recommendations.map((rec, i) => (
            <li key={i} className="flex gap-2.5 text-sm">
              <span
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                  styles.badge,
                )}
                aria-hidden
              >
                {i + 1}
              </span>
              <span className="leading-relaxed">{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Urgent alert for G3 ── */}
      {stage === "G3" && (
        <div className="flex gap-2 rounded-xl bg-destructive/10 border border-destructive/25 p-3">
          <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" aria-hidden />
          <p className="text-xs text-destructive font-medium leading-relaxed">
            This is a <strong>severe infection</strong>. Act immediately and contact your local
            agriculture extension officer for emergency support.
          </p>
        </div>
      )}
    </section>
  );
}

/* ────────────────────────── main screen ─────────────────────────────────── */

export default function ResultScreen() {
  const t = useT();
  const { lastResult } = useAppState();
  const [speaking, setSpeaking] = useState(false);

  // Clean up ongoing speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!lastResult) {
    return (
      <AppShell>
        <AppHeader title={t("result.title")} backTo="/home" />
        <div className="px-5 py-8">
          <ErrorState
            title="No diagnosis yet"
            message="Run a leaf diagnosis first and your result will appear here."
          />
          <Link
            href="/diagnose?mode=camera"
            className="mt-4 flex min-h-14 items-center justify-center rounded-2xl bg-primary font-semibold text-primary-foreground"
          >
            Start a diagnosis
          </Link>
        </div>
      </AppShell>
    );
  }

  const info = getDiseaseByName(lastResult.crop, lastResult.disease);
  const stage = (lastResult.stage ?? "G1") as "G0" | "G1" | "G2" | "G3";
  const lesionPct = lastResult.lesionPct ?? 0;
  const stageTreatment = info?.stageTreatments?.find((s) => s.stage === stage);

  // TTS Voice Guidance
  const speak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);

    const titleText = `${lastResult.crop} leaf diagnosed with ${info?.name || lastResult.disease}.`;
    const confidenceText = `Confidence score is ${(lastResult.confidence * 100).toFixed(0)} percent.`;
    const stageLabelSpoken =
      stage === "G0"
        ? "Healthy — no disease found"
        : stage === "G1"
          ? "Early or Mild"
          : stage === "G2"
            ? "Moderate"
            : "Severe — emergency action required";
    const stageText = `Disease stage is ${stage}: ${stageLabelSpoken}. Estimated leaf lesion area: ${lesionPct} percent.`;
    const treatmentText = stageTreatment
      ? `Stage ${stage} treatment steps: ${stageTreatment.recommendations.join(". ")}`
      : "";
    const explanationText = info?.what ? `Disease description: ${info.what}` : "";

    const textToSpeak = [titleText, confidenceText, stageText, explanationText, treatmentText]
      .filter(Boolean)
      .join(" ");

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.85;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <AppShell>
      <AppHeader title={t("result.title")} subtitle={lastResult.model} backTo="/diagnose" />

      <div className="space-y-4 px-5 py-5">
        {/* ── Leaf photo + disease name ── */}
        <div className="animate-rise surface-lift overflow-hidden">
          <img
            src={lastResult.image}
            alt={`${lastResult.crop} leaf diagnosed with ${lastResult.disease}`}
            className="aspect-[4/3] w-full object-cover"
          />
          <div className="p-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              <Leaf className="size-3.5" aria-hidden /> {lastResult.crop}
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold">
              {info?.name ?? `${lastResult.crop} ${lastResult.disease}`}
            </h2>
            <div className="mt-4">
              <ConfidenceIndicator confidence={lastResult.confidence} />
            </div>
            {lastResult.confidence < 0.35 && (
              <div className="mt-4 flex gap-2.5 rounded-xl bg-destructive-soft border border-destructive/25 p-3 text-destructive animate-rise">
                <AlertTriangle className="size-4.5 shrink-0 mt-0.5" aria-hidden />
                <p className="text-xs font-medium leading-relaxed">
                  <strong>Low confidence — model still under training.</strong> The predicted disease may not be accurate. Treat this diagnosis as a preliminary suggestion only.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Top predictions ── */}
        <section className="surface p-4">
          <SectionTitle>{t("result.top")}</SectionTitle>
          <ul className="space-y-3">
            {lastResult.top_predictions.map((p, idx) => (
              <li key={p.disease}>
                <div className="flex justify-between text-sm">
                  <span className={cn("font-medium", idx === 0 && "font-bold")}>{p.disease}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {(p.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", idx === 0 ? "bg-primary" : "bg-stage-3")}
                    style={{ width: `${Math.max(p.confidence * 100, 1.5)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Voice + Coach ── */}
        <div className="flex gap-3">
          <VoiceButton
            label={speaking ? "Stop Listening" : t("result.listen")}
            onClick={speak}
            variant="solid"
          />
          <Link
            href="/assistant"
            className="flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-2xl border border-border bg-card text-sm font-semibold"
          >
            Ask Crop Coach <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>
        {speaking && (
          <p className="text-xs text-primary animate-pulse font-medium" aria-live="polite">
            🔊 Reading out your diagnosis, severity stage, and treatment steps...
          </p>
        )}

        {/* ── G0–G3 Stage Panel ── */}
        {stageTreatment && (
          <StagePanel stage={stage} lesionPct={lesionPct} stageTreatment={stageTreatment} />
        )}

        {/* ── Disease detail cards ── */}
        {info ? (
          <>
            <InfoBlock icon={Info} title={t("result.what")}>
              {info.what}
            </InfoBlock>
            <InfoBlock icon={Leaf} title={t("result.symptoms")}>
              <Bullets items={info.symptoms} />
            </InfoBlock>
            <InfoBlock icon={Activity} title={t("result.cause")}>
              {info.cause}
            </InfoBlock>
            <InfoBlock icon={Clock} title={t("result.now")}>
              <Bullets items={info.actionNow} />
            </InfoBlock>
            <InfoBlock icon={ShieldCheck} title={t("result.prevention")}>
              <Bullets items={info.prevention} />
            </InfoBlock>
            <InfoBlock icon={Stethoscope} title={t("result.treatment")}>
              <Bullets items={info.treatment} />
            </InfoBlock>
          </>
        ) : (
          <ErrorState
            title="Unknown crop or disease"
            message="The model returned a label that is not in the crop database yet, so no guidance can be shown."
          />
        )}
      </div>
    </AppShell>
  );
}
