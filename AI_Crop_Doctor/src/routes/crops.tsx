import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AppShell, AppHeader } from "@/components/app-shell";
import { CROPS, DISEASES, MONTH_NAMES } from "@/data/crops";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/crops")({
  head: () => ({
    meta: [
      { title: "AI Crop Doctor" },
      {
        name: "description",
        content:
          "Crop reference data: growing duration, suitable planting months, growth stages, harvest period, common diseases and care tips.",
      },
      { property: "og:title", content: "AI Crop Doctor" },
      {
        property: "og:description",
        content: "Growing duration, planting months, stages, diseases and care for each crop.",
      },
    ],
  }),
  component: CropsScreen,
});

function CropsScreen() {
  const t = useT();
  const [open, setOpen] = useState<string | null>("tomato");

  return (
    <AppShell>
      <AppHeader
        title={t("crops.title")}
        subtitle="New crops are added as data — no redesign needed"
        backTo="/home"
      />
      <div className="space-y-3 px-5 py-5">
        {CROPS.map((crop) => {
          const expanded = open === crop.id;
          const diseases = DISEASES.filter((d) => crop.commonDiseaseIds.includes(d.id));
          return (
            <section key={crop.id} className={cn("surface overflow-hidden", !crop.available && "opacity-80")}>
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : crop.id)}
                aria-expanded={expanded}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-2xl">
                  {crop.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{crop.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {crop.growingDurationDays} days ·{" "}
                    {crop.plantingMonths.map((m) => MONTH_NAMES[m - 1]?.slice(0, 3)).join(", ")}
                  </span>
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase",
                    crop.available
                      ? "bg-success-soft text-success"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {crop.available ? "Model ready" : "Planned"}
                </span>
                <ChevronDown
                  className={cn("size-5 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")}
                  aria-hidden
                />
              </button>

              {expanded ? (
                <div className="animate-rise space-y-4 border-t border-border px-4 py-4 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <Fact label="Growing duration" value={`${crop.growingDurationDays} days`} />
                    <Fact
                      label="Expected harvest"
                      value={
                        crop.stages.length
                          ? `Day ${crop.stages[crop.stages.length - 1]!.startDay}–${crop.growingDurationDays}`
                          : "Pending data"
                      }
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Suitable planting months
                    </p>
                    <p className="mt-1">
                      {crop.plantingMonths.map((m) => MONTH_NAMES[m - 1]).join(", ")}
                    </p>
                  </div>
                  {crop.stages.length ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Growth stages
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {crop.stages.map((s) => (
                          <li key={s.key} className="flex justify-between gap-3">
                            <span className="font-medium">{s.label}</span>
                            <span className="text-muted-foreground">
                              Day {s.startDay}–{s.endDay}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {diseases.length ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Common diseases
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {diseases.map((d) => (
                          <span key={d.id} className="rounded-full bg-secondary px-3 py-1 text-xs">
                            {d.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {crop.care.length ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Basic care
                      </p>
                      <ul className="mt-2 space-y-2 text-muted-foreground">
                        {crop.care.map((c) => (
                          <li key={c} className="flex gap-2">
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="rounded-2xl bg-muted/60 p-3 text-xs text-muted-foreground">
                      Detection and guidance for {crop.name} are planned for a future model update.
                      The screen already reads this crop from the database.
                    </p>
                  )}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary/60 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}
