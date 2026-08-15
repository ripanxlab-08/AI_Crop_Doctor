/**
 * Deterministic crop scheduling.
 *
 * Every date shown in the app (stage windows, harvest window, reminders) is
 * derived from: sowing date + crop data in src/data/crops.ts.
 * Nothing here is random — the same sowing date always gives the same plan.
 */

import { getCrop, MONTH_NAMES, type Crop, type CropStage } from "@/data/crops";

export interface StageWindow {
  stage: CropStage;
  start: Date;
  end: Date;
  status: "done" | "current" | "upcoming";
}

export interface CropPlan {
  crop: Crop;
  sowingDate: Date;
  dayInCycle: number;
  windows: StageWindow[];
  currentStage: CropStage | null;
  harvestStart: Date;
  harvestEnd: Date;
  daysToHarvest: number;
  progress: number;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function diffInDays(a: Date, b: Date): number {
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86_400_000);
}

export function formatDate(date: Date, withYear = false): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}${withYear ? `, ${date.getFullYear()}` : ""}`;
}

export function formatRange(start: Date, end: Date): string {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function buildCropPlan(
  cropId: string,
  sowingISO: string,
  today = new Date(),
): CropPlan | null {
  const crop = getCrop(cropId);
  if (!crop || crop.stages.length === 0) return null;

  const sowingDate = startOfDay(new Date(sowingISO));
  const dayInCycle = diffInDays(today, sowingDate);

  const windows: StageWindow[] = crop.stages.map((stage) => {
    const start = addDays(sowingDate, stage.startDay);
    const end = addDays(sowingDate, stage.endDay);
    const status: StageWindow["status"] =
      dayInCycle > stage.endDay ? "done" : dayInCycle >= stage.startDay ? "current" : "upcoming";
    return { stage, start, end, status };
  });

  const current = windows.find((w) => w.status === "current")?.stage ?? null;
  const harvestWindow = windows[windows.length - 1]!;

  return {
    crop,
    sowingDate,
    dayInCycle,
    windows,
    currentStage: current,
    harvestStart: harvestWindow.start,
    harvestEnd: harvestWindow.end,
    daysToHarvest: diffInDays(harvestWindow.start, today),
    progress: Math.max(0, Math.min(1, dayInCycle / crop.growingDurationDays)),
  };
}

export type ReminderTone = "harvest" | "stage" | "watering" | "disease" | "planting";

export interface Reminder {
  id: string;
  title: string;
  detail: string;
  date: string;
  tone: ReminderTone;
  enabled: boolean;
  generated: boolean;
}

/** Reminders computed from the crop plan — never invented dates. */
export function generateReminders(plan: CropPlan, today = new Date()): Reminder[] {
  const out: Reminder[] = [];
  const { crop, currentStage, harvestStart, daysToHarvest, sowingDate } = plan;

  if (currentStage) {
    out.push({
      id: `gen-stage-${crop.id}`,
      title: `${crop.name} is currently in the ${currentStage.label.toLowerCase()} stage`,
      detail: currentStage.farmerNote,
      date: startOfDay(today).toISOString(),
      tone: "stage",
      enabled: true,
      generated: true,
    });
  }

  if (daysToHarvest >= 0) {
    out.push({
      id: `gen-harvest-${crop.id}`,
      title: `${crop.name} harvest expected in ${daysToHarvest} days`,
      detail: `Harvest window: ${formatRange(harvestStart, plan.harvestEnd)}. ${crop.harvestNote}`,
      date: harvestStart.toISOString(),
      tone: "harvest",
      enabled: true,
      generated: true,
    });
  }

  const nextWatering = addDays(today, plan.dayInCycle % 2 === 0 ? 1 : 2);
  out.push({
    id: `gen-water-${crop.id}`,
    title: `Watering reminder — ${formatDate(nextWatering)}`,
    detail: "Water at the base of the plant in the early morning. Avoid wetting the leaves.",
    date: nextWatering.toISOString(),
    tone: "watering",
    enabled: true,
    generated: true,
  });

  if (currentStage && (currentStage.key === "flowering" || currentStage.key === "fruiting")) {
    out.push({
      id: `gen-disease-${crop.id}`,
      title: "Recommended time to monitor for disease",
      detail: `${crop.name} is most sensitive to leaf disease in this stage. Check the lower leaves and run an AI diagnosis if you see spots.`,
      date: addDays(today, 1).toISOString(),
      tone: "disease",
      enabled: true,
      generated: true,
    });
  }

  const nextMonth = (today.getMonth() + 1) % 12;
  const plantable = plan.crop.id === "tomato" ? crop : crop;
  if (plantable.plantingMonths.includes(nextMonth + 1)) {
    out.push({
      id: `gen-planting-${crop.id}`,
      title: `Favourable planting period for ${crop.name} starts in ${MONTH_NAMES[nextMonth]}`,
      detail: `Suitable planting months: ${crop.plantingMonths.map((m) => MONTH_NAMES[m - 1]).join(", ")}.`,
      date: new Date(today.getFullYear(), nextMonth, 1).toISOString(),
      tone: "planting",
      enabled: true,
      generated: true,
    });
  }

  void sowingDate;
  return out;
}

export function relativeDay(iso: string, today = new Date()): string {
  const days = diffInDays(new Date(iso), today);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 0) return `${Math.abs(days)} days ago`;
  return `in ${days} days`;
}
