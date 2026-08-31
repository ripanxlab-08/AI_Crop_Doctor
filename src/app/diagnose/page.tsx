"use client";

import { useRef, useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, Check, Images, Upload, X, ZapOff, FlipHorizontal } from "lucide-react";
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
import { addHistoryEntry, setState, useAppState } from "@/lib/store";
import { insertDiagnosisHistory } from "@/lib/supabase-service";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const STEPS = [
  "diagnose.checkingQuality",
  "diagnose.scanning",
  "diagnose.running",
  "diagnose.stageAnalysis",
  "diagnose.preparing",
] as const;

type Phase = "pick" | "preview" | "verifying" | "quality-failed" | "diagnosing" | "error";

// Dataset demo samples
const DEMO_SAMPLES = [
  {
    name: "Apple Cedar Rust",
    filename: "AppleCedarRust1.JPG",
    emoji: "🍎",
    desc: "Gymnosporangium rust",
    image: "/demo/apple_cedar_rust.png",
  },
  {
    name: "Apple Scab",
    filename: "AppleScab1.JPG",
    emoji: "🍎",
    desc: "Venturia fungal spots",
    image: "/demo/apple_scab.png",
  },
  {
    name: "Corn Common Rust",
    filename: "CornCommonRust1.JPG",
    emoji: "🌽",
    desc: "Puccinia powdery spots",
    image: "/demo/corn_common_rust.png",
  },
  {
    name: "Potato Early Blight",
    filename: "PotatoEarlyBlight1.JPG",
    emoji: "🥔",
    desc: "Alternaria concentric rings",
    image: "/demo/potato_early_blight.png",
  },
  {
    name: "Tomato Yellow Curl",
    filename: "TomatoYellowCurlVirus1.JPG",
    emoji: "🍅",
    desc: "Whitefly TYLC virus",
    image: "/demo/tomato_yellow_curl.png",
  },
  {
    name: "Tomato Healthy",
    filename: "TomatoHealthy1.JPG",
    emoji: "🍅",
    desc: "Clean green foliage",
    image: "/demo/tomato_healthy.png",
  },
];

/* ─────────────────────────── WebcamModal ────────────────────────────────── */

/**
 * Full-screen webcam capture modal.
 * Uses browser getUserMedia — works on PC / laptop webcams without any plugin.
 * On capture it converts the live video frame to a File via canvas.
 */
function WebcamModal({
  onCapture,
  onClose,
}: {
  onCapture: (file: File, dataUrl: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [camError, setCamError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [facingUser, setFacingUser] = useState(false); // false = environment (back) cam
  const [flash, setFlash] = useState(false);

  /** Start (or restart after flip) the camera stream */
  const startStream = useCallback(async (front: boolean) => {
    // Stop any existing stream first
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setReady(false);
    setCamError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: front ? "user" : "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setReady(true);
      }
    } catch (err) {
      const e = err as DOMException;
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        setCamError(
          "Camera permission denied. Please allow camera access in your browser settings and refresh.",
        );
      } else if (e.name === "NotFoundError") {
        setCamError("No camera found on this device. Please connect a webcam and try again.");
      } else {
        setCamError(`Could not open camera: ${e.message || e.name}`);
      }
    }
  }, []);

  // Start camera on mount
  useEffect(() => {
    void startStream(false);
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flipCamera = () => {
    const next = !facingUser;
    setFacingUser(next);
    void startStream(next);
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !ready) return;

    // Flash animation
    setFlash(true);
    setTimeout(() => setFlash(false), 250);

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror if front-facing
    if (facingUser) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `webcam-capture-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        // Stop stream before handing off
        streamRef.current?.getTracks().forEach((t) => t.stop());
        onCapture(file, dataUrl);
      },
      "image/jpeg",
      0.92,
    );
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black"
      role="dialog"
      aria-modal="true"
      aria-label="Webcam capture"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm">
        <button
          type="button"
          onClick={onClose}
          className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Close camera"
        >
          <X className="size-5" />
        </button>
        <p className="text-sm font-semibold text-white">
          {ready ? "🟢 Camera live" : camError ? "🔴 Error" : "⏳ Starting..."}
        </p>
        <button
          type="button"
          onClick={flipCamera}
          disabled={!!camError}
          className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-30"
          aria-label="Flip camera"
        >
          <FlipHorizontal className="size-5" />
        </button>
      </div>

      {/* Live video area */}
      <div className="relative flex-1 overflow-hidden bg-black flex items-center justify-center">
        {/* Flash overlay */}
        <div
          className={cn(
            "absolute inset-0 z-10 bg-white transition-opacity duration-150 pointer-events-none",
            flash ? "opacity-80" : "opacity-0",
          )}
          aria-hidden
        />

        {camError ? (
          <div className="flex flex-col items-center gap-4 px-8 text-center">
            <ZapOff className="size-14 text-red-400" />
            <p className="text-white font-semibold">{camError}</p>
            <button
              type="button"
              onClick={() => void startStream(facingUser)}
              className="rounded-2xl bg-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/30 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "h-full w-full object-cover",
                facingUser && "scale-x-[-1]", // mirror front-facing
              )}
            />

            {/* Leaf guide overlay */}
            {ready && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div
                  className="border-2 border-white/60 rounded-3xl"
                  style={{ width: "72%", aspectRatio: "1/1" }}
                  aria-hidden
                >
                  {/* Corner accents */}
                  {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map(
                    (pos, i) => (
                      <div
                        key={i}
                        className={cn(
                          "absolute size-8 border-white",
                          "border-t-4 border-l-4",
                          pos,
                          i === 1 && "rotate-90",
                          i === 2 && "-rotate-90",
                          i === 3 && "rotate-180",
                        )}
                        aria-hidden
                      />
                    ),
                  )}
                </div>
                <p className="absolute bottom-6 text-white/80 text-sm font-medium px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm">
                  Place the leaf inside the frame
                </p>
              </div>
            )}

            {/* Loading shimmer */}
            {!ready && !camError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="size-12 rounded-full border-4 border-white/20 border-t-white animate-spin" />
                <p className="text-white/70 text-sm">Starting camera...</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Capture button */}
      <div className="flex items-center justify-center gap-6 bg-black/80 backdrop-blur-sm py-6">
        {/* Shutter ring */}
        <button
          type="button"
          onClick={capture}
          disabled={!ready}
          id="webcam-capture-btn"
          aria-label="Capture photo"
          className={cn(
            "relative flex size-20 items-center justify-center rounded-full transition-all duration-150",
            "bg-white shadow-[0_0_0_6px_rgba(255,255,255,0.25)]",
            "active:scale-90 hover:scale-105",
            !ready && "opacity-40 cursor-not-allowed",
          )}
        >
          <span className="size-14 rounded-full bg-primary block" />
        </button>
      </div>

      {/* Hidden canvas for pixel capture */}
      <canvas ref={canvasRef} className="hidden" aria-hidden />
    </div>
  );
}

/* ────────────────────────── Main screen ────────────────────────────────── */

function DiagnoseScreenContent() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAppState();
  const mode = (searchParams.get("mode") === "upload" ? "upload" : "camera") as "camera" | "upload";

  const fileRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("pick");
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<QualityResponse | null>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [forceIssue, setForceIssue] = useState<keyof typeof QUALITY_ISSUES | "">("");

  // Webcam modal state
  const [webcamOpen, setWebcamOpen] = useState(false);

  const pick = (f: File | undefined) => {
    if (!f) return;
    setFile(f);
    setImage(URL.createObjectURL(f));
    setQuality(null);
    setPhase("preview");
  };

  /** Called by WebcamModal when user presses the shutter */
  const handleWebcamCapture = (capturedFile: File, dataUrl: string) => {
    setWebcamOpen(false);
    setFile(capturedFile);
    setImage(dataUrl);
    setQuality(null);
    setPhase("preview");
  };

  const selectSample = () => {
    setFile(null);
    setImage(typeof SAMPLE_LEAF_IMAGE === "string" ? SAMPLE_LEAF_IMAGE : SAMPLE_LEAF_IMAGE.src);
    setQuality(null);
    setPhase("preview");
  };

  const selectDemoSample = (sample: (typeof DEMO_SAMPLES)[number]) => {
    const mockFile = new File([], sample.filename);
    setFile(mockFile);
    setImage(sample.image);
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
        setTimeout(() => setStep(4), 2400),
      ];
      const result = await diagnoseApi(file);
      timers.forEach(clearTimeout);

      if (!result.is_leaf) {
        throw new CropApiError(
          "low_confidence",
          "This image does not look like a supported crop leaf. Please take a clear photo of a single leaf of a supported crop (Tomato, Potato, Corn, Apple, etc.) in good lighting.",
        );
      }

      const shown =
        image ??
        (typeof SAMPLE_LEAF_IMAGE === "string" ? SAMPLE_LEAF_IMAGE : SAMPLE_LEAF_IMAGE.src);
      setState({ lastResult: { ...result, image: shown, at: new Date().toISOString() } });
      addHistoryEntry({
        id: `h-${Date.now()}`,
        date: new Date().toISOString(),
        crop: result.crop,
        disease: result.disease,
        confidence: result.confidence,
        stage: result.stage,
        lesionPct: result.lesionPct,
        image: shown,
      });

      // Persist to Supabase diagnosis_history DB table
      insertDiagnosisHistory({
        user_id: user?.id,
        crop_name: result.crop,
        disease_name: result.disease,
        confidence: result.confidence,
        severity_stage: result.stage,
        image_url: shown,
      }).catch((err) => {
        console.warn("Notice: Supabase diagnosis_history insert error:", err);
      });

      router.push("/result");
    } catch (e) {
      const err = e as CropApiError;
      setError({
        title:
          err.kind === "offline"
            ? "No internet connection"
            : err.kind === "model_unavailable"
              ? "AI model unavailable"
              : err.kind === "low_confidence"
                ? "Not a supported leaf"
                : "Server unavailable",
        message: err.message ?? "Something went wrong. Please try again.",
      });
      setPhase("error");
    }
  };

  return (
    <>
      {/* ── Webcam modal (rendered outside AppShell so it covers full viewport) ── */}
      {webcamOpen && (
        <WebcamModal onCapture={handleWebcamCapture} onClose={() => setWebcamOpen(false)} />
      )}

      <AppShell>
        <AppHeader
          title={t("diagnose.title")}
          subtitle={t("diagnose.instruction")}
          backTo="/home"
        />

        <div className="px-5 py-5">
          {phase === "pick" ? (
            <div className="animate-rise space-y-5">
              <div className="surface-lift flex flex-col items-center p-6 text-center">
                <span className="flex size-20 items-center justify-center rounded-3xl bg-primary-soft">
                  <Camera className="size-9 text-primary" aria-hidden />
                </span>
                <h2 className="mt-4 font-display text-lg font-bold">Take one clear leaf photo</h2>
                <ul className="mt-3 space-y-1.5 text-left text-xs text-muted-foreground">
                  <li>• Point your webcam at a leaf in good light.</li>
                  <li>• Fill the guide frame with a single leaf.</li>
                  <li>• Hold steady, then press the shutter button.</li>
                </ul>
              </div>

              {/* ── Camera button — opens live webcam ── */}
              <button
                type="button"
                id="open-webcam-btn"
                onClick={() => setWebcamOpen(true)}
                className="flex min-h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-lift hover:opacity-90 active:scale-[0.98] transition-all"
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

              {/* Dataset demo samples */}
              <section className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Dataset Demo Samples
                  </h3>
                  <span className="text-[10px] font-bold text-primary bg-primary-soft rounded-full px-2 py-0.5">
                    MobileViT Ready
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Click a sample leaf to run a real classification based on the `Crop_Scan-dataset`
                  classes:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {DEMO_SAMPLES.map((sample) => (
                    <button
                      key={sample.name}
                      type="button"
                      onClick={() => selectDemoSample(sample)}
                      className="surface flex items-start gap-3 p-2.5 text-left hover:scale-[1.02] active:scale-95 transition-all duration-200"
                    >
                      <span className="text-2xl shrink-0 p-1 rounded-xl bg-secondary">
                        {sample.emoji}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate text-foreground">{sample.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{sample.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <button
                type="button"
                onClick={selectSample}
                className="min-h-12 w-full rounded-2xl border border-dashed border-border text-sm font-semibold text-muted-foreground"
              >
                Use general tomato sample leaf
              </button>

              {/* File picker for gallery / upload */}
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
                <img
                  src={image}
                  alt="Selected leaf"
                  className="aspect-square w-full object-cover"
                />
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
                  onChange={(e) =>
                    setForceIssue(e.target.value as keyof typeof QUALITY_ISSUES | "")
                  }
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
                    <span className={i <= step ? "font-medium" : "text-muted-foreground"}>
                      {t(s)}
                    </span>
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
                        {c.passed ? (
                          <Check className="size-3.5" aria-hidden />
                        ) : (
                          <X className="size-3.5" aria-hidden />
                        )}
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
    </>
  );
}

export default function DiagnoseScreen() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
          Loading scanner interface...
        </div>
      }
    >
      <DiagnoseScreenContent />
    </Suspense>
  );
}
