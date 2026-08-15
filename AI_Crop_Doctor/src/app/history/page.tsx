"use client";

import Link from "next/link";
import { ChevronRight, Leaf } from "lucide-react";
import { AppShell, AppHeader } from "@/components/app-shell";
import { ErrorState } from "@/components/crop-ui";
import { formatDate } from "@/lib/crop-schedule";
import { useAppState } from "@/lib/store";
import { confidenceBand } from "@/services/crop-api";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function HistoryScreen() {
  const t = useT();
  const { history } = useAppState();

  return (
    <AppShell>
      <AppHeader title={t("history.title")} subtitle={`${history.length} records`} backTo="/home" />
      <div className="space-y-3 px-5 py-5">
        {history.length === 0 ? (
          <ErrorState title="No history yet" message="Your diagnoses will be listed here." />
        ) : null}
        {history.map((h) => {
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
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {formatDate(new Date(h.date))}
                </p>
                <p className="truncate font-semibold">{h.disease}</p>
                <p className="text-xs text-muted-foreground">
                  {h.crop} · Severity:{" "}
                  {h.stage
                    ? ({
                        G0: "Healthy",
                        G1: "Early / Mild",
                        G2: "Moderate",
                        G3: "Severe",
                      }[h.stage] ?? h.stage)
                    : "not available yet"}
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
        })}
      </div>
    </AppShell>
  );
}
