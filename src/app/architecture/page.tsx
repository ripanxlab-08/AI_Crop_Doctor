"use client";

import { useEffect, useState } from "react";
import {
  Cpu,
  Layers,
  Network,
  TrendingUp,
  Server,
  Database,
  Volume2,
  Lock,
  Cloud,
  FileCode,
  ScanLine,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Eye,
  Sliders,
} from "lucide-react";
import { AppShell, AppHeader } from "@/components/app-shell";
import { cn } from "@/lib/utils";
import AuthGuard from "@/components/auth-guard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Data parsed directly from trainingHistory.json in Crop_Scan-dataset
const ML_TRAINING_DATA = [
  { epoch: 1, accuracy: 60.7, val_accuracy: 82.9, loss: 1.33, val_loss: 0.53 },
  { epoch: 2, accuracy: 85.5, val_accuracy: 90.8, loss: 0.46, val_loss: 0.29 },
  { epoch: 3, accuracy: 91.3, val_accuracy: 92.8, loss: 0.27, val_loss: 0.22 },
  { epoch: 4, accuracy: 94.0, val_accuracy: 93.4, loss: 0.19, val_loss: 0.21 },
  { epoch: 5, accuracy: 95.4, val_accuracy: 93.4, loss: 0.14, val_loss: 0.21 },
  { epoch: 6, accuracy: 96.5, val_accuracy: 94.3, loss: 0.11, val_loss: 0.18 },
  { epoch: 7, accuracy: 97.0, val_accuracy: 93.5, loss: 0.09, val_loss: 0.22 },
  { epoch: 8, accuracy: 97.6, val_accuracy: 96.1, loss: 0.08, val_loss: 0.12 },
  { epoch: 9, accuracy: 98.0, val_accuracy: 95.7, loss: 0.06, val_loss: 0.15 },
  { epoch: 10, accuracy: 98.2, val_accuracy: 96.7, loss: 0.06, val_loss: 0.11 },
];

const STACK_LAYERS = [
  {
    layer: "Frontend",
    tech: "Next.js + TS (migrated)",
    why: "Fast, SSR/static generation, excellent performance, and modern layout conventions.",
    icon: Cloud,
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    layer: "UI",
    tech: "Tailwind CSS v4",
    why: "Curated oklch color palettes, clean farmer-friendly cards, and custom micro-animations.",
    icon: Layers,
    color: "text-teal-500 bg-teal-500/10",
  },
  {
    layer: "AI Training",
    tech: "PyTorch + timm + MobileViT",
    why: "Trained on Google Colab with cos-annealing. Achieved 98% train accuracy, 96.7% validation accuracy.",
    icon: Cpu,
    color: "text-orange-500 bg-orange-500/10",
  },
  {
    layer: "Backend",
    tech: "FastAPI + Python",
    why: "Extremely lightweight API server designed to run PyTorch model inference and quality verification checks.",
    icon: Server,
    color: "text-emerald-500 bg-emerald-500/10",
  },
  {
    layer: "Database",
    tech: "PostgreSQL (Supabase)",
    why: "Handles user profiles, diagnosis history, and crop activity schedules securely.",
    icon: Database,
    color: "text-indigo-500 bg-indigo-500/10",
  },
  {
    layer: "API Protocol",
    tech: "REST API (JSON)",
    why: "Simple and robust communication sending base64/form-data images and returning predictions.",
    icon: FileCode,
    color: "text-pink-500 bg-pink-500/10",
  },
  {
    layer: "Image Process",
    tech: "OpenCV",
    why: "Performs blur checks, brightness calculations, and leaf presence verification before classification.",
    icon: ScanLine,
    color: "text-cyan-500 bg-cyan-500/10",
  },
  {
    layer: "Voice",
    tech: "Web Speech TTS / STT",
    why: "Reads results, calendar timelines, and transcribes voice questions in browser to help offline farmers.",
    icon: Volume2,
    color: "text-violet-500 bg-violet-500/10",
  },
  {
    layer: "Authentication",
    tech: "Supabase Auth + OAuth",
    why: "Allows secure email/password and social login to synchronize farmer data to the cloud.",
    icon: Lock,
    color: "text-amber-500 bg-amber-500/10",
  },
  {
    layer: "Deployment",
    tech: "Render / Railway",
    why: "Easy, continuous integration server deployment for FastAPI backend and PostgreSQL db storage.",
    icon: ShieldCheck,
    color: "text-rose-500 bg-rose-500/10",
  },
];

export default function ArchitectureScreen() {
  const [activeTab, setActiveTab] = useState<"stack" | "arch" | "metrics">("stack");
  const [archSubTab, setArchSubTab] = useState<"core" | "pipeline">("core");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AuthGuard>
    <AppShell>
      <AppHeader
        title="System Architecture"
        subtitle="Recommended Stack, System Loops & ML Details"
        backTo="/home"
      />

      <div className="px-5 py-5 space-y-6">
        {/* Sliding Navigation Tabs */}
        <div className="relative flex rounded-2xl bg-secondary/80 p-1.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]">
          <div
            className="absolute bottom-1.5 top-1.5 rounded-xl bg-card shadow-soft transition-all duration-300"
            style={{
              width: "calc(33.333% - 4px)",
              left:
                activeTab === "stack"
                  ? "4px"
                  : activeTab === "arch"
                    ? "calc(33.333% + 2px)"
                    : "calc(66.666%)",
            }}
          />
          <button
            type="button"
            onClick={() => setActiveTab("stack")}
            className={cn(
              "relative z-10 flex-1 py-2 text-center text-xs font-bold transition-colors",
              activeTab === "stack" ? "text-primary" : "text-muted-foreground",
            )}
          >
            1. Tech Stack
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("arch")}
            className={cn(
              "relative z-10 flex-1 py-2 text-center text-xs font-bold transition-colors",
              activeTab === "arch" ? "text-primary" : "text-muted-foreground",
            )}
          >
            2. Diagrams
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("metrics")}
            className={cn(
              "relative z-10 flex-1 py-2 text-center text-xs font-bold transition-colors",
              activeTab === "metrics" ? "text-primary" : "text-muted-foreground",
            )}
          >
            3. ML Metrics
          </button>
        </div>

        {/* TAB 1: RECOMMENDED STACK */}
        {activeTab === "stack" && (
          <div className="animate-rise space-y-4">
            <div className="surface p-4 bg-gradient-to-br from-primary-soft/10 to-card">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Technology Blueprint
              </h2>
              <p className="text-xs text-muted-foreground">
                The recommended modern architecture layers designed to provide a farmer-friendly,
                highly available, and mobile-responsive crop disease detection solution.
              </p>
            </div>

            <div className="space-y-3">
              {STACK_LAYERS.map((layer) => {
                const Icon = layer.icon;
                return (
                  <div
                    key={layer.layer}
                    className="surface flex items-start gap-4 p-4 hover:shadow-md transition-shadow"
                  >
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-xl",
                        layer.color,
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-baseline gap-2">
                        <h3 className="text-sm font-bold text-foreground">{layer.layer}</h3>
                        <span className="text-xs font-semibold text-primary">{layer.tech}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {layer.why}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: SYSTEM ARCHITECTURE DIAGRAMS */}
        {activeTab === "arch" && (
          <div className="animate-rise space-y-4">
            <div className="flex justify-center gap-2 bg-secondary/40 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setArchSubTab("core")}
                className={cn(
                  "flex-1 py-1.5 text-center text-[10px] font-bold rounded-lg transition-all",
                  archSubTab === "core"
                    ? "bg-card shadow-soft text-foreground"
                    : "text-muted-foreground",
                )}
              >
                Core Client-Server Data Loop
              </button>
              <button
                type="button"
                onClick={() => setArchSubTab("pipeline")}
                className={cn(
                  "flex-1 py-1.5 text-center text-[10px] font-bold rounded-lg transition-all",
                  archSubTab === "pipeline"
                    ? "bg-card shadow-soft text-foreground"
                    : "text-muted-foreground",
                )}
              >
                Quality Gate Inference Pipeline
              </button>
            </div>

            {/* Core Client-Server Flow */}
            {archSubTab === "core" && (
              <div className="surface-lift p-5 space-y-6 relative overflow-hidden bg-card/65">
                {/* Micro-animated background lines */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />

                <div className="relative text-center border-b border-border/60 pb-3">
                  <h3 className="text-sm font-bold text-foreground">Interactive Core Data Flow</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Click steps below to see how crop data loops between frontend interfaces and ML
                    engines.
                  </p>
                </div>

                <div className="relative space-y-4 max-w-md mx-auto">
                  <FlowCard
                    num="1"
                    title="Frontend Interface (Next.js)"
                    tech="Camera / Gallery / History"
                    desc="User shoots or uploads a leaf picture. Handles user settings, localized languages, and stores histories."
                  />
                  <FlowArrow />
                  <FlowCard
                    num="2"
                    title="Image Verification (OpenCV)"
                    tech="Frontend / Backend Quality Filters"
                    desc="Filters out blurry, dark, low-res, or leaf-free photos before feeding the model."
                  />
                  <FlowArrow />
                  <FlowCard
                    num="3"
                    title="FastAPI Gateway (Python REST)"
                    tech="Backend Router"
                    desc="Secure server endpoint receiving images, executing validation scripts, and routing to the PyTorch pipeline."
                  />
                  <FlowArrow />
                  <FlowCard
                    num="4"
                    title="MobileViT Small Classifier"
                    tech="ML Inference (PyTorch)"
                    desc="Runs Vision Transformer classification across 38 crop classes, producing categorical disease & confidence scores."
                  />
                  <FlowArrow />
                  <FlowCard
                    num="5"
                    title="Farming Recommendation Engine"
                    tech="Agricultural Knowledge DB"
                    desc="Maps predictions to action steps, preventions, treatments, and triggers Web Speech TTS voice output."
                  />
                </div>
              </div>
            )}

            {/* Verification Pipeline */}
            {archSubTab === "pipeline" && (
              <div className="surface-lift p-5 space-y-5 bg-card/65">
                <div className="text-center border-b border-border/60 pb-3">
                  <h3 className="text-sm font-bold text-foreground">
                    Leaf Verification & Inference Pipeline
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Multi-stage gatekeeping pipeline to guarantee classification accuracy.
                  </p>
                </div>

                {/* Farmer Image Capture */}
                <div className="flex items-center gap-3 bg-primary-soft/30 p-3 rounded-2xl border border-primary/20">
                  <div className="size-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                    In
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-foreground">
                      Farmer Captures Leaf Photo
                    </h4>
                    <p className="text-[10px] text-muted-foreground">
                      High-res RGB image input (base64/binary)
                    </p>
                  </div>
                </div>

                {/* Vertical Connector */}
                <div className="w-0.5 h-4 bg-primary/20 ml-7" />

                {/* Quality Gates */}
                <div className="border border-border/80 rounded-2xl p-4 space-y-3 bg-secondary/30 relative">
                  <span className="absolute -top-2 left-4 px-2 py-0.5 rounded bg-foreground text-background text-[9px] font-bold uppercase tracking-wider">
                    OpenCV Quality Filters
                  </span>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <CheckItem text="Blur & Sharpness check" />
                    <CheckItem text="Brightness threshold" />
                    <CheckItem text="Resolution minimums" />
                    <CheckItem text="Leaf Visibility check" />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center pt-1 border-t border-border/50">
                    If any checks fail, quality-failed warning is immediately returned to prevent
                    model pollution.
                  </p>
                </div>

                <div className="w-0.5 h-4 bg-primary/20 ml-7" />

                {/* MobileViT Model */}
                <div className="flex items-center gap-3 bg-orange-500/10 p-3 rounded-2xl border border-orange-500/20">
                  <div className="size-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-xs">
                    ML
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-foreground">
                      Tomato Disease Classifier (MobileViT)
                    </h4>
                    <p className="text-[10px] text-muted-foreground">
                      Extracts deep spatial-attentive leaf features
                    </p>
                  </div>
                </div>

                <div className="w-0.5 h-4 bg-primary/20 ml-7" />

                {/* Stage / Severity Module */}
                <div className="flex items-center gap-3 bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
                  <div className="size-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                    Sev
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-foreground">
                      Disease Severity Estimation (Stage Module)
                    </h4>
                    <p className="text-[10px] text-muted-foreground">
                      Classifies infection into Mild, Moderate, or Severe
                    </p>
                  </div>
                </div>

                <div className="w-0.5 h-4 bg-primary/20 ml-7" />

                {/* Output */}
                <div className="flex items-center gap-3 bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
                  <div className="size-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                    Out
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-foreground">
                      Treatment Recommendations & Voice Guidance
                    </h4>
                    <p className="text-[10px] text-muted-foreground">
                      Announces crop actions via Web Speech Synthesis
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MODEL TRAINING METRICS */}
        {activeTab === "metrics" && (
          <div className="animate-rise space-y-5">
            <div className="surface p-4 bg-gradient-to-br from-orange-500/10 to-card">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">
                MobileViT-S ML Training Metrics
              </h2>
              <p className="text-xs text-muted-foreground">
                Trained on the <strong>New Plant Diseases Dataset</strong> (87k augmented leaf
                images). Visualizing actual loss and accuracy trends stored in{" "}
                <code>trainingHistory.json</code>:
              </p>
            </div>

            {mounted ? (
              <div className="space-y-6">
                {/* Accuracy Line Chart */}
                <div className="surface p-4 space-y-2">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <TrendingUp className="size-4 text-primary" /> Training vs Validation Accuracy
                  </h3>
                  <div className="h-64 w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={ML_TRAINING_DATA}
                        margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="epoch" name="Epoch" />
                        <YAxis domain={[50, 100]} unit="%" />
                        <Tooltip formatter={(value: any) => [`${value}%`]} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="accuracy"
                          name="Train Accuracy"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="val_accuracy"
                          name="Val Accuracy"
                          stroke="#0284c7"
                          strokeWidth={2.5}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Loss Line Chart */}
                <div className="surface p-4 space-y-2">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sliders className="size-4 text-destructive" /> Training vs Validation Loss
                  </h3>
                  <div className="h-64 w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={ML_TRAINING_DATA}
                        margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="epoch" />
                        <YAxis domain={[0, 1.5]} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="loss"
                          name="Train Loss"
                          stroke="#ef4444"
                          strokeWidth={2.5}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="val_loss"
                          name="Val Loss"
                          stroke="#f59e0b"
                          strokeWidth={2.5}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="surface h-64 flex items-center justify-center text-xs text-muted-foreground animate-pulse">
                Loading interactive charts...
              </div>
            )}

            {/* Model details stats */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="surface p-3 space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                  Model Parameters
                </p>
                <p className="font-bold text-foreground">MobileViT Small</p>
                <p className="text-[11px] text-muted-foreground">~5.6M weights Â· PyTorch</p>
              </div>
              <div className="surface p-3 space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                  Dataset Scope
                </p>
                <p className="font-bold text-foreground">38 Crop/Disease Classes</p>
                <p className="text-[11px] text-muted-foreground">Apple, Corn, Potato, Tomato</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
    </AuthGuard>
  );
}

function FlowCard({
  num,
  title,
  tech,
  desc,
}: {
  num: string;
  title: string;
  tech: string;
  desc: string;
}) {
  return (
    <div className="surface p-3.5 relative border-l-4 border-l-primary hover:translate-x-1 transition-transform">
      <span className="absolute right-3.5 top-3 text-[10px] font-extrabold text-primary bg-primary-soft/50 rounded-full size-5 flex items-center justify-center shadow-soft">
        {num}
      </span>
      <h4 className="text-xs font-bold text-foreground pr-6">{title}</h4>
      <p className="text-[10px] font-semibold text-primary mt-0.5">{tech}</p>
      <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">{desc}</p>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex flex-col items-center justify-center py-0.5" aria-hidden>
      <div className="w-0.5 h-4 bg-primary/30 border-dashed" />
      <ArrowRight className="size-3.5 text-primary rotate-90" />
    </div>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px]">
      <CheckCircle2 className="size-3.5 text-success shrink-0" />
      <span className="truncate">{text}</span>
    </div>
  );
}

