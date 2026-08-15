import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, ChevronRight, Clock, Info, Leaf, ShieldCheck, Stethoscope } from "lucide-react";
import { AppShell, AppHeader, SectionTitle } from "@/components/app-shell";
import { ConfidenceIndicator, ErrorState, VoiceButton } from "@/components/crop-ui";
import { getDiseaseByName } from "@/data/crops";
import { useAppState } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/result")({
  head: () => ({
    meta: [
      { title: "AI Crop Doctor" },
      {
        name: "description",
        content:
          "Your AI leaf diagnosis with confidence score, top predictions, symptoms, prevention and treatment guidance in simple language.",
      },
      { property: "og:title", content: "AI Crop Doctor" },
      {
        property: "og:description",
        content: "Disease name, confidence, symptoms, causes, prevention and treatment guidance.",
      },
    ],
  }),
  component: ResultScreen,
});

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

function ResultScreen() {
  const t = useT();
  const { lastResult } = useAppState();
  const [speaking, setSpeaking] = useState(false);

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
            to="/diagnose"
            search={{ mode: "camera" }}
            className="mt-4 flex min-h-14 items-center justify-center rounded-2xl bg-primary font-semibold text-primary-foreground"
          >
            Start a diagnosis
          </Link>
        </div>
      </AppShell>
    );
  }

  const info = getDiseaseByName(lastResult.crop, lastResult.disease);
  const speak = () => {
    setSpeaking(true);
    setTimeout(() => setSpeaking(false), 1800);
  };

  return (
    <AppShell>
      <AppHeader title={t("result.title")} subtitle={lastResult.model} backTo="/diagnose" />

      <div className="space-y-4 px-5 py-5">
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
          </div>
        </div>

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

        <div className="flex gap-3">
          <VoiceButton
            label={speaking ? "Reading out…" : t("result.listen")}
            onClick={speak}
            variant="solid"
          />
          <Link
            to="/assistant"
            className="flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-2xl border border-border bg-card text-sm font-semibold"
          >
            Ask Crop Coach <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>
        {speaking ? (
          <p className="text-xs text-muted-foreground" aria-live="polite">
            Voice guidance is prepared in this build and will speak the full result once the
            text-to-speech service is connected.
          </p>
        ) : null}

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

        <section className="rounded-2xl border border-dashed border-border p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">{t("result.severity")}</h3>
            <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Coming in the next model update
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {lastResult.severity ?? t("result.severityPending")}
          </p>
          <div className="mt-3 flex gap-2" aria-hidden>
            {["Mild", "Moderate", "Severe"].map((s) => (
              <span
                key={s}
                className="flex-1 rounded-xl bg-muted/70 py-2 text-center text-xs font-medium text-muted-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
