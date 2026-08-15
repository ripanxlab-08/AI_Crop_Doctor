import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, Pencil, X } from "lucide-react";
import { AppShell, AppHeader, SectionTitle } from "@/components/app-shell";
import { ReminderCard, StageRangeList, VoiceButton } from "@/components/crop-ui";
import { MONTH_NAMES } from "@/data/crops";
import {
  addDays,
  buildCropPlan,
  diffInDays,
  formatDate,
  generateReminders,
  startOfDay,
  type Reminder,
} from "@/lib/crop-schedule";
import {
  addCustomReminder,
  deleteCustomReminder,
  toggleReminder,
  updateCustomReminder,
  useAppState,
} from "@/lib/store";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "AI Crop Doctor" },
      {
        name: "description",
        content:
          "A tomato crop calendar built from your sowing date: growth stages, flowering, fruiting, expected harvest window and reminders.",
      },
      { property: "og:title", content: "AI Crop Doctor" },
      {
        property: "og:description",
        content: "Sowing, growth, flowering, fruiting and harvest windows with farm reminders.",
      },
    ],
  }),
  component: CalendarScreen,
});

const STAGE_DOT: Record<string, string> = {
  "stage-1": "bg-stage-1",
  "stage-2": "bg-stage-2",
  "stage-3": "bg-stage-3",
  "stage-4": "bg-stage-4",
  "stage-5": "bg-stage-5",
};

function CalendarScreen() {
  const t = useT();
  const { sowingDate, disabledReminderIds, customReminders } = useAppState();
  const today = startOfDay(new Date());
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [showForm, setShowForm] = useState(false);

  const plan = buildCropPlan("tomato", sowingDate);

  const grid = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const lead = first.getDay();
    const cells: (Date | null)[] = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    }
    return cells;
  }, [cursor]);

  const stageForDate = (date: Date) => {
    if (!plan) return null;
    return plan.windows.find((w) => date >= w.start && date <= w.end) ?? null;
  };

  const generated = plan ? generateReminders(plan) : [];
  const allReminders = [...generated, ...customReminders].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const saveReminder = (form: { title: string; detail: string; date: string }) => {
    if (editing && !editing.generated) {
      updateCustomReminder(editing.id, form);
    } else {
      addCustomReminder({
        id: `c-${Date.now()}`,
        title: form.title,
        detail: form.detail,
        date: new Date(form.date).toISOString(),
        tone: "stage",
        enabled: true,
        generated: false,
      });
    }
    setShowForm(false);
    setEditing(null);
  };

  return (
    <AppShell>
      <AppHeader
        title={t("calendar.title")}
        subtitle="Dates are calculated from your sowing date"
        backTo="/home"
      />

      <div className="space-y-5 px-5 py-5">
        <section className="surface-lift p-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              className="flex size-10 items-center justify-center rounded-xl bg-secondary"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <p className="font-display text-lg font-bold uppercase tracking-wide">
              {MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}
            </p>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              className="flex size-10 items-center justify-center rounded-xl bg-secondary"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-muted-foreground">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <span key={`${d}${i}`}>{d}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {grid.map((date, i) => {
              if (!date) return <span key={`empty-${i}`} />;
              const w = stageForDate(date);
              const isToday = diffInDays(date, today) === 0;
              return (
                <div
                  key={date.toISOString()}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center rounded-xl text-xs",
                    isToday ? "bg-primary font-bold text-primary-foreground" : "bg-secondary/40",
                  )}
                >
                  {date.getDate()}
                  <span
                    className={cn(
                      "mt-1 size-1.5 rounded-full",
                      w ? STAGE_DOT[w.stage.tone] : "bg-transparent",
                    )}
                    aria-hidden
                  />
                </div>
              );
            })}
          </div>

          {plan ? (
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px]">
              {plan.windows.map((w) => (
                <span key={w.stage.key} className="flex items-center gap-1.5">
                  <span className={cn("size-2 rounded-full", STAGE_DOT[w.stage.tone])} aria-hidden />
                  {w.stage.label}
                </span>
              ))}
            </div>
          ) : null}
        </section>

        {plan ? (
          <section>
            <SectionTitle action={<VoiceButton label="Listen" />}>
              Tomato timeline · sown {formatDate(plan.sowingDate)}
            </SectionTitle>
            <StageRangeList plan={plan} />
            <p className="mt-3 rounded-2xl bg-accent-soft px-4 py-3 text-xs text-accent-foreground">
              Expected harvest: {formatDate(plan.harvestStart)} – {formatDate(plan.harvestEnd)} ·{" "}
              {plan.crop.harvestNote}
            </p>
          </section>
        ) : null}

        <section>
          <SectionTitle
            action={
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setShowForm(true);
                }}
                className="inline-flex min-h-10 items-center gap-1 rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground"
              >
                <Plus className="size-4" aria-hidden /> {t("calendar.addReminder")}
              </button>
            }
          >
            {t("calendar.reminders")}
          </SectionTitle>

          <div className="space-y-3">
            {allReminders.map((r) => (
              <ReminderCard
                key={r.id}
                reminder={r}
                enabled={!disabledReminderIds.includes(r.id)}
                onToggle={() => toggleReminder(r.id)}
                actions={
                  r.generated ? undefined : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(r);
                          setShowForm(true);
                        }}
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-secondary px-3 text-xs font-semibold"
                      >
                        <Pencil className="size-3.5" aria-hidden /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCustomReminder(r.id)}
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-destructive-soft px-3 text-xs font-semibold text-destructive"
                      >
                        <Trash2 className="size-3.5" aria-hidden /> Delete
                      </button>
                    </>
                  )
                }
              />
            ))}
          </div>
        </section>
      </div>

      {showForm ? (
        <ReminderForm
          initial={editing}
          defaultDate={addDays(today, 1)}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSave={saveReminder}
        />
      ) : null}
    </AppShell>
  );
}

function ReminderForm({
  initial,
  defaultDate,
  onClose,
  onSave,
}: {
  initial: Reminder | null;
  defaultDate: Date;
  onClose: () => void;
  onSave: (form: { title: string; detail: string; date: string }) => void;
}) {
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [detail, setDetail] = useState(initial?.detail ?? "");
  const [date, setDate] = useState(initial ? iso(new Date(initial.date)) : iso(defaultDate));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0">
      <div className="w-full max-w-screen-sm rounded-t-3xl bg-card p-5 shadow-lift">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{initial ? "Edit Reminder" : "Add Reminder"}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-10 items-center justify-center rounded-xl bg-secondary"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            onSave({ title: title.trim(), detail: detail.trim(), date });
          }}
        >
          <label className="block text-sm font-medium">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Spray tomato field"
              className="mt-1 min-h-13 w-full rounded-2xl border border-input bg-background px-4 text-sm"
            />
          </label>
          <label className="block text-sm font-medium">
            Details
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={2}
              placeholder="Early morning, both sides of the leaves"
              className="mt-1 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm"
            />
          </label>
          <label className="block text-sm font-medium">
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 min-h-13 w-full rounded-2xl border border-input bg-background px-4 text-sm"
            />
          </label>
          <button
            type="submit"
            className="min-h-14 w-full rounded-2xl bg-primary font-semibold text-primary-foreground"
          >
            Save Reminder
          </button>
        </form>
      </div>
    </div>
  );
}
