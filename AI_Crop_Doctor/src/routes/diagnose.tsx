import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, Check, Images, Upload, X } from "lucide-react";
import { AppShell, AppHeader } from "@/components/app-shell";
import { ErrorState, LoadingScanner } from "@/components/crop-ui";
import {
  CropApiError,
  QUALITY_ISSUES,
  SAMPLE_LEAF_IMAGE,
  diagnose as diagnoseApi,
  verifyImage,
  verifyImageWithIssue,
  type QualityResponse,
} from "@/services/crop-api";
import { addHistoryEntry, setState } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/diagnose")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: (search["mode"] === "upload" ? "upload" : "camera") as "camera" | "upload",
  }),
  head: () => ({
    meta: [
      { title: "AI Crop Doctor" },
      {
        name: "description",
        content:
          "Capture or upload a tomato leaf photo. The app checks image quality first, then runs MobileViT disease detection.",
      },
      { property: "og:title", content: "AI Crop Doctor" },
      {
        property: "og:description",
        content: "Image quality verification followed by AI tomato leaf disease detection.",
      },
    ],
  }),
  component: DiagnoseScreen,
});

type Phase = "pick" | "preview" | "verifying" | "quality-failed" | "diagnosing" | "error";

const STEPS = ["diagnose.checkingQuality", "diagnose.scanning", "diagnose.running", "diagnose.preparing"] as const;

function DiagnoseScreen() {
  const t = useT();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("pick");
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<QualityResponse | null>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [forceIssue, setForceIssue] = useState<keyof typeof QUALITY_ISSUES | "">("");

  const pick = (f: File | undefined) => {
    if (!f) return;
    setFile(f);
    setImage(URL.createObjectURL(f));
    setQuality(null);
    setPhase("preview");
  };

  const useSample = () => {
    setFile(null);
    setImage(SAMPLE_LEAF_IMAGE);
    setQuality(null);
    setPhase("preview");
  };

  const reset = () => {
    setPhase("pick");
    setImage(null);
    setFile(null);
    setQuality(null);
    setStep(0);
    setError(null);
  };

  const run = async () => {
    try {
      setPhase("verifying");
      setStep(0);
      const q = forceIssue ? await verifyImageWithIssue(forceIssue) : await verifyImage(file);
      setQuality(q);
      if (!q.valid) {
        setPhase("quality-failed");
        return;
      }
      setPhase("diagnosing");
      setStep(1);
      const timers = [
        setTimeout(() => setStep(2), 700),
        setTimeout(() => setStep(3), 1700),
      ];
      const result = await diagnoseApi(file);
      timers.forEach(clearTimeout);
      const shown = image ?? SAMPLE_LEAF_IMAGE;
      setState({ lastResult: { ...result, image: shown, at: new Date().toISOString() } });
      addHistoryEntry({
        id: `h-${Date.now()}`,
        date: new Date().toISOString(),
        crop: result.crop,
        disease: result.disease,
        confidence: result.confidence,
        severity: result.severity,
        image: shown,
      });
      navigate({ to: "/result" });
    } catch (e) {
      const err = e as CropApiError;
      setError({
        title:
          err.kind === "offline"
            ? "No internet connection"
            : err.kind === "model_unavailable"
              ? "AI model unavailable"
              : "Server unavailable",
        message: err.message ?? "Something went wrong. Please try again.",
      });
      setPhase("error");
    }
  };

  return (
    <AppShell>
      <AppHeader title={t("diagnose.title")} subtitle={t("diagnose.instruction")} backTo="/home" />

      <div className="px-5 py-5">
        {phase === "pick" ? (
          <div className="animate-rise space-y-4">
            <div className="surface-lift flex flex-col items-center p-6 text-center">
              <span className="flex size-20 items-center justify-center rounded-3xl bg-primary-soft">
                <Camera className="size-9 text-primary" aria-hidden />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold">Take one clear leaf photo</h2>
              <ul className="mt-3 space-y-1.5 text-left text-xs text-muted-foreground">
                <li>• Use daylight, avoid strong shadows.</li>
                <li>• Fill the frame with a single leaf.</li>
                <li>• Hold the phone steady until the photo is sharp.</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-lift"
            >
              <Camera className="size-5" aria-hidden /> {t("diagnose.camera")}
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-card text-sm font-semibold shadow-soft"
              >
                <Images className="size-5" aria-hidden /> {t("diagnose.gallery")}
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-card text-sm font-semibold shadow-soft"
              >
                <Upload className="size-5" aria-hidden /> {t("diagnose.upload")}
              </button>
            </div>
            <button
              type="button"
              onClick={useSample}
              className="min-h-12 w-full rounded-2xl border border-dashed border-border text-sm font-semibold text-muted-foreground"
            >
              Use sample tomato leaf (demo)
            </button>

            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => pick(e.target.files?.[0])}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => pick(e.target.files?.[0])}
            />
          </div>
        ) : null}

        {phase === "preview" && image ? (
          <div className="animate-rise space-y-4">
            <div className="relative overflow-hidden rounded-3xl shadow-lift">
              <img src={image} alt="Selected leaf" className="aspect-square w-full object-cover" />
              <button
                type="button"
                onClick={reset}
                aria-label="Remove image"
                className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-xl bg-card/90 shadow-soft"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <label className="surface block p-4 text-xs">
              <span className="font-semibold">Demo: simulate a quality problem</span>
              <select
                value={forceIssue}
                onChange={(e) => setForceIssue(e.target.value as keyof typeof QUALITY_ISSUES | "")}
                className="mt-2 min-h-12 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                <option value="">None — image is good</option>
                <option value="blurry">Blurry image</option>
                <option value="dark">Dark leaf</option>
                <option value="too_far">Too far from leaf</option>
                <option value="no_leaf">No leaf detected</option>
              </select>
            </label>

            <button
              type="button"
              onClick={run}
              className="min-h-14 w-full rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-lift"
            >
              {t("diagnose.start")}
            </button>
            <button
              type="button"
              onClick={reset}
              className="min-h-12 w-full rounded-2xl bg-secondary text-sm font-semibold text-secondary-foreground"
            >
              {t("diagnose.retake")}
            </button>
          </div>
        ) : null}

        {phase === "verifying" || phase === "diagnosing" ? (
          <div className="animate-rise pt-6">
            <LoadingScanner label={t(STEPS[step]!)} image={image ?? undefined} />
            <ol className="mx-auto mt-8 max-w-xs space-y-3">
              {STEPS.map((s, i) => (
                <li key={s} className="flex items-center gap-3 text-sm">
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full text-xs font-bold",
                      i < step
                        ? "bg-success text-success-foreground"
                        : i === step
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {i < step ? <Check className="size-4" aria-hidden /> : i + 1}
                  </span>
                  <span className={i <= step ? "font-medium" : "text-muted-foreground"}>{t(s)}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {phase === "quality-failed" && quality?.issue ? (
          <div className="animate-rise space-y-4">
            {image ? (
              <img
                src={image}
                alt="Rejected leaf photo"
                className="aspect-square w-full rounded-3xl object-cover opacity-70"
              />
            ) : null}
            <div className="surface p-5">
              <p className="text-sm font-semibold text-destructive">{t("diagnose.imageBad")}</p>
              <p className="mt-1 font-display text-lg font-bold">{quality.issue.message}</p>
              <p className="mt-1 text-sm text-muted-foreground">{quality.issue.hint}</p>
              <ul className="mt-4 space-y-2">
                {quality.checks.map((c) => (
                  <li key={c.label} className="flex items-center gap-2 text-sm">
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full",
                        c.passed
                          ? "bg-success-soft text-success"
                          : "bg-destructive-soft text-destructive",
                      )}
                    >
                      {c.passed ? <Check className="size-3.5" aria-hidden /> : <X className="size-3.5" aria-hidden />}
                    </span>
                    {c.label}
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={reset}
              className="min-h-14 w-full rounded-2xl bg-primary text-base font-semibold text-primary-foreground"
            >
              Capture another image
            </button>
          </div>
        ) : null}

        {phase === "error" && error ? (
          <div className="animate-rise pt-4">
            <ErrorState
              title={error.title}
              message={error.message}
              hint="Your photo is kept, so you can retry without taking it again."
              onRetry={() => void run()}
              kind="danger"
            />
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
