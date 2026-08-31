"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Leaf, Loader2, Cloud } from "lucide-react";
import { AppShell, AppHeader } from "@/components/app-shell";
import { ErrorState } from "@/components/crop-ui";
import { formatDate } from "@/lib/crop-schedule";
import { useAppState, type HistoryEntry } from "@/lib/store";
import { confidenceBand } from "@/services/crop-api";
import { fetchDiagnosisHistory, type SupabaseDiagnosisRecord } from "@/lib/supabase-service";
import { useT } from "@/lib/i18n";
import AuthGuard from "@/components/auth-guard";
import { cn } from "@/lib/utils";

export default function HistoryScreen() {
  const t = useT();
  const { history: localHistory, user } = useAppState();
  const [supabaseRecords, setSupabaseRecords] = useState<SupabaseDiagnosisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch diagnosis history directly from Supabase DB on mount
  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchDiagnosisHistory(user?.token ? undefined : undefined)
      .then((records) => {
        if (active) {
          setSupabaseRecords(records);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch Supabase history:", err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  // Combine Supabase DB records and local history, avoiding duplicates
  const allRecords: HistoryEntry[] = [...localHistory];

  supabaseRecords.forEach((sb) => {
    const exists = allRecords.some(
      (r) =>
        r.id === sb.id ||
        (r.crop === sb.crop_name &&
          r.disease === sb.disease_name &&
          Math.abs(r.confidence - sb.confidence) < 0.01),
    );
    if (!exists) {
      allRecords.push({
        id: sb.id || `sb-${Date.now()}`,
        date: sb.created_at || new Date().toISOString(),
        crop: sb.crop_name || "Tomato",
        disease: sb.disease_name || "Diagnosis",
        confidence: sb.confidence || 0.9,
        stage: (sb.severity_stage as "G0" | "G1" | "G2" | "G3") || "G1",
        lesionPct: null,
        image: sb.image_url || "",
      });
    }
  });

  // Sort by date descending
  allRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <AuthGuard>
    <AppShell>
      <AppHeader
        title={t("history.title")}
        subtitle={loading ? "Syncing with Supabase Cloud..." : `${allRecords.length} total records`}
        backTo="/home"
      />
      <div className="space-y-3 px-5 py-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="mt-3 text-xs text-muted-foreground animate-pulse">
              Loading diagnosis history from Supabase Cloud...
            </p>
          </div>
        ) : allRecords.length === 0 ? (
          <ErrorState
            title="No diagnosis history yet"
            message="Your crop leaf diagnoses will be saved to Supabase Cloud and listed here."
          />
        ) : (
          allRecords.map((h) => {
            const band = confidenceBand(h.confidence);
            return (
              <Link key={h.id} href="/result" className="surface flex items-center gap-3 p-3">
                {h.image ? (
                  <img
                    src={h.image}
                    alt=""
                    className="size-16 shrink-0 rounded-2xl object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary-soft">
                    <Leaf className="size-6 text-primary" aria-hidden />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {formatDate(new Date(h.date))}
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft/60 px-2 py-0.5 text-[9px] font-bold text-primary">
                      âœ“ Supabase Synced
                    </span>
                  </div>
                  <p className="truncate font-semibold mt-0.5">{h.disease}</p>
                  <p className="text-xs text-muted-foreground">
                    {h.crop} Â· Severity:{" "}
                    {h.stage
                      ? ({
                          G0: "Healthy",
                          G1: "Early / Mild",
                          G2: "Moderate",
                          G3: "Severe",
                        }[h.stage] ?? h.stage)
                      : "not available"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-base font-bold tabular-nums">
                    {(h.confidence * 100).toFixed(1)}%
                  </p>
                  <p
                    className={cn(
                      "text-[10px] font-semibold",
                      band.tone === "success"
                        ? "text-success"
                        : band.tone === "warning"
                          ? "text-warning-foreground"
                          : "text-destructive",
                    )}
                  >
                    {band.label}
                  </p>
                </div>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              </Link>
            );
          })
        )}
      </div>
    </AppShell>
    </AuthGuard>
  );
}

