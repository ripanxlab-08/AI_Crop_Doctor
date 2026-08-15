import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, History, Languages, Leaf, MapPin, Volume2 } from "lucide-react";
import { AppShell, AppHeader, SectionTitle } from "@/components/app-shell";
import { NotificationCard } from "@/components/crop-ui";
import { CROPS } from "@/data/crops";
import { LANGUAGES, useT } from "@/lib/i18n";
import { updateProfile, useAppState, logoutUser } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "AI Crop Doctor" },
      {
        name: "description",
        content:
          "Set your name, region, preferred language, crops, notification and voice preferences for AI Crop Doctor.",
      },
      { property: "og:title", content: "AI Crop Doctor" },
      {
        property: "og:description",
        content: "Name, region, language, crops, notifications and voice preferences.",
      },
    ],
  }),
  component: ProfileScreen,
});

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="surface flex items-center gap-3 p-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn("h-7 w-12 shrink-0 rounded-full transition-colors", checked ? "bg-primary" : "bg-muted")}
      >
        <span
          className={cn(
            "block size-6 rounded-full bg-card shadow-soft transition-transform",
            checked ? "translate-x-5.5" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

function ProfileScreen() {
  const t = useT();
  const { profile, user } = useAppState();

  return (
    <AppShell>
      <AppHeader title={t("profile.title")} backTo="/home" />
      <div className="space-y-5 px-5 py-5">
        <section className="surface-lift p-5">
          <div className="flex items-center gap-4">
            <span className="flex size-16 items-center justify-center rounded-3xl bg-primary-soft font-display text-xl font-bold text-primary">
              {(user ? user.name : profile.name)
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-display text-lg font-bold">{user ? user.name : profile.name}</p>
                {!user && (
                  <span className="rounded-full bg-secondary text-secondary-foreground px-2 py-0.5 text-[9px] font-bold tracking-wider">
                    GUEST
                  </span>
                )}
              </div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <MapPin className="size-3.5" aria-hidden /> {profile.region}
              </p>
              {user && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {user.email}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium">
              Name
              <input
                value={profile.name}
                onChange={(e) => updateProfile({ name: e.target.value })}
                className="mt-1 min-h-13 w-full rounded-2xl border border-input bg-background px-4 text-sm"
              />
            </label>
            <label className="block text-sm font-medium">
              Location / Region
              <input
                value={profile.region}
                onChange={(e) => updateProfile({ region: e.target.value })}
                className="mt-1 min-h-13 w-full rounded-2xl border border-input bg-background px-4 text-sm"
              />
            </label>
          </div>

          {!user && (
            <div className="mt-4 rounded-2xl bg-accent-soft p-4 border border-accent/20 flex flex-col gap-2">
              <div>
                <p className="text-sm font-bold text-accent-foreground">Sign In to Back Up Data</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Sync and persist your AI leaf diagnosis history, crop calendar, and custom reminders to Nadia Cloud.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-accent text-xs font-bold text-accent-foreground shadow-[0_3px_0_oklch(0.65_0.14_70)] active:shadow-none active:translate-y-[3px] transition-all self-start px-4 mt-1 cursor-pointer"
              >
                Sign In / Register
              </Link>
            </div>
          )}
        </section>

        <section>
          <SectionTitle>
            <span className="flex items-center gap-2">
              <Languages className="size-4" aria-hidden /> Preferred Language
            </span>
          </SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                disabled={!l.available}
                onClick={() => updateProfile({ language: l.code })}
                className={cn(
                  "min-h-13 rounded-2xl border px-3 text-sm font-semibold transition-colors",
                  profile.language === l.code
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-card",
                  !l.available && "opacity-50",
                )}
              >
                {l.native}
                {!l.available ? <span className="block text-[10px] font-normal">soon</span> : null}
              </button>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle>
            <span className="flex items-center gap-2">
              <Leaf className="size-4" aria-hidden /> My Crops
            </span>
          </SectionTitle>
          <div className="flex flex-wrap gap-2">
            {CROPS.map((c) => {
              const selected = profile.crops.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={!c.available}
                  onClick={() =>
                    updateProfile({
                      crops: selected
                        ? profile.crops.filter((x) => x !== c.id)
                        : [...profile.crops, c.id],
                    })
                  }
                  className={cn(
                    "min-h-12 rounded-2xl border px-4 text-sm font-medium",
                    selected ? "border-primary bg-primary-soft text-primary" : "border-border bg-card",
                    !c.available && "opacity-50",
                  )}
                >
                  {c.emoji} {c.name}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <SectionTitle>Preferences</SectionTitle>
          <Toggle
            label="Crop notifications"
            hint="Harvest, watering, stage and disease follow-up alerts"
            checked={profile.notifications}
            onChange={(v) => updateProfile({ notifications: v })}
          />
          <Toggle
            label="Voice guidance"
            hint="Read out diagnosis results and reminders (connects with the voice update)"
            checked={profile.voiceGuidance}
            onChange={(v) => updateProfile({ voiceGuidance: v })}
          />
          <div className="surface flex items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Units</p>
              <p className="text-xs text-muted-foreground">Area, weight and temperature</p>
            </div>
            <div className="flex rounded-xl bg-secondary p-1">
              {(["metric", "imperial"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => updateProfile({ units: u })}
                  className={cn(
                    "min-h-10 rounded-lg px-3 text-xs font-semibold capitalize",
                    profile.units === u ? "bg-card shadow-soft" : "text-muted-foreground",
                  )}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <Link to="/history" className="surface flex items-center gap-3 p-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-secondary">
              <History className="size-5" aria-hidden />
            </span>
            <span className="flex-1 text-sm font-semibold">Diagnosis History</span>
            <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
          </Link>
          <Link to="/crops" className="surface flex items-center gap-3 p-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-secondary">
              <Leaf className="size-5" aria-hidden />
            </span>
            <span className="flex-1 text-sm font-semibold">Crop Database</span>
            <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
          </Link>
        </section>

        <section className="pt-2">
          {user ? (
            <button
              type="button"
              onClick={() => logoutUser()}
              className="w-full min-h-13 rounded-2xl bg-destructive text-destructive-foreground font-semibold font-display shadow-[0_4px_0_oklch(0.42_0.15_27)] active:shadow-none active:translate-y-[4px] active:mb-[4px] transition-all hover:bg-destructive/95 flex items-center justify-center gap-2 cursor-pointer mb-2"
            >
              Sign Out Account
            </button>
          ) : (
            <Link
              to="/login"
              className="w-full min-h-13 rounded-2xl bg-primary text-primary-foreground font-semibold font-display shadow-[0_4px_0_oklch(0.35_0.1_152)] active:shadow-none active:translate-y-[4px] active:mb-[4px] transition-all hover:bg-primary/95 flex items-center justify-center gap-2 cursor-pointer mb-2"
            >
              Sign In / Register
            </Link>
          )}
        </section>

        <NotificationCard
          title="Voice and language support"
          body="This build is in English. Hindi, Tamil, Telugu, Malayalam and Kannada, plus speech-to-text and text-to-speech, are prepared in the architecture and switch on with the backend update."
          tone="accent"
        />

        <p className="flex items-center justify-center gap-1.5 pb-2 text-center text-[11px] text-muted-foreground">
          <Volume2 className="size-3.5" aria-hidden />
          AI Crop Doctor
        </p>
      </div>
    </AppShell>
  );
}
