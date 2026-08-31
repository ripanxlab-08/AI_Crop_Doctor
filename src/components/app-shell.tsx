"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, Home, ScanLine, Sprout, User, ChevronLeft, Cpu } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/diagnose", label: "Scan", icon: ScanLine },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/assistant", label: "AI Coach", icon: Sprout },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNavigation() {
  const pathname = usePathname() || "/home";

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-screen-sm pb-[env(safe-area-inset-bottom)]"
      style={{
        background: "oklch(0.11 0.025 240 / 0.85)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderTop: "1px solid oklch(1 0 0 / 8%)",
        boxShadow: "0 -1px 0 oklch(0.72 0.2 152 / 0.15), 0 -20px 40px oklch(0 0 0 / 0.4)",
      }}
    >
      {/* Top neon line */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, oklch(0.72 0.2 152 / 0.6) 30%, oklch(0.78 0.18 180 / 0.6) 70%, transparent 100%)",
        }}
        aria-hidden
      />

      <ul className="grid grid-cols-5">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(`${to}/`);
          return (
            <li key={to}>
              <Link
                href={to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[4.5rem] flex-col items-center justify-center gap-1 text-[10px] font-semibold tracking-wider uppercase transition-all duration-300",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "relative flex size-10 items-center justify-center rounded-2xl transition-all duration-300",
                    active
                      ? "bg-primary-soft"
                      : "bg-transparent hover:bg-white/5",
                  )}
                  style={
                    active
                      ? {
                          boxShadow:
                            "0 0 12px oklch(0.72 0.2 152 / 0.4), 0 0 24px oklch(0.72 0.2 152 / 0.15), inset 0 1px 0 oklch(1 0 0 / 0.1)",
                        }
                      : {}
                  }
                >
                  {active && (
                    <span
                      className="absolute inset-0 rounded-2xl animate-neon-pulse"
                      aria-hidden
                    />
                  )}
                  <Icon
                    className={cn("size-5 transition-all duration-300", active && "drop-shadow-[0_0_8px_oklch(0.72_0.2_152/0.8)]")}
                    strokeWidth={active ? 2.4 : 1.8}
                    aria-hidden
                  />
                </span>
                <span
                  style={
                    active
                      ? {
                          textShadow: "0 0 8px oklch(0.72 0.2 152 / 0.7)",
                        }
                      : {}
                  }
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AppHeader({
  title,
  subtitle,
  backTo,
  action,
}: {
  title: string;
  subtitle?: string;
  backTo?: string;
  action?: ReactNode;
}) {
  return (
    <header
      className="sticky top-0 z-30 flex items-start gap-3 px-5 py-4"
      style={{
        background: "oklch(0.09 0.018 250 / 0.8)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid oklch(1 0 0 / 6%)",
        boxShadow: "0 1px 0 oklch(0.72 0.2 152 / 0.1)",
      }}
    >
      {backTo ? (
        <Link
          href={backTo}
          aria-label="Go back"
          className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: "oklch(1 0 0 / 6%)",
            border: "1px solid oklch(1 0 0 / 10%)",
            boxShadow: "0 2px 0 oklch(0 0 0 / 0.4)",
          }}
        >
          <ChevronLeft className="size-5" aria-hidden />
        </Link>
      ) : null}
      <div className="min-w-0 flex-1">
        <h1
          className="truncate text-xl font-semibold"
          style={{ letterSpacing: "-0.02em" }}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.72 0.2 152)", fontFamily: "var(--font-mono)" }}
          >
            ◈ {subtitle}
          </p>
        ) : null}
      </div>
      {action}
    </header>
  );
}

export function NotificationBell({ count }: { count: number }) {
  return (
    <Link
      href="/calendar"
      aria-label={`${count} notifications`}
      className="relative flex size-11 items-center justify-center rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
      style={{
        background: "oklch(1 0 0 / 6%)",
        border: "1px solid oklch(1 0 0 / 10%)",
        boxShadow: count > 0 ? "0 0 12px oklch(0.78 0.18 75 / 0.4)" : "none",
      }}
    >
      <Bell
        className="size-5"
        style={{ color: count > 0 ? "oklch(0.78 0.18 75)" : "oklch(0.7 0.04 200)" }}
        aria-hidden
      />
      {count > 0 ? (
        <span
          className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full text-[10px] font-bold"
          style={{
            background: "linear-gradient(135deg, oklch(0.78 0.18 75) 0%, oklch(0.65 0.2 30) 100%)",
            color: "oklch(0.08 0.02 60)",
            boxShadow: "0 0 8px oklch(0.78 0.18 75 / 0.6)",
          }}
        >
          {count}
        </span>
      ) : null}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="mx-auto flex min-h-screen w-full max-w-screen-sm flex-col pb-24 relative"
      style={{ background: "var(--background, oklch(0.09 0.018 250))" }}
    >
      {/* Ambient background glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -5%, oklch(0.72 0.2 152 / 0.08) 0%, transparent 70%)",
        }}
      />
      {/* Cyber grid texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.72 0.2 152 / 2%) 1px, transparent 1px), linear-gradient(90deg, oklch(0.72 0.2 152 / 2%) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative z-10 flex flex-col flex-1">
        {children}
      </div>
      <BottomNavigation />
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2
        className="text-sm font-bold uppercase tracking-widest"
        style={{
          color: "oklch(0.72 0.2 152)",
          fontFamily: "var(--font-mono)",
        }}
      >
        ◈ {children}
      </h2>
      {action}
    </div>
  );
}

export function HoloBadge({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.72 0.2 152 / 0.2) 0%, oklch(0.78 0.18 180 / 0.2) 100%)",
        border: "1px solid oklch(0.72 0.2 152 / 0.4)",
        color: "oklch(0.72 0.2 152)",
        boxShadow: "0 0 8px oklch(0.72 0.2 152 / 0.2), inset 0 1px 0 oklch(1 0 0 / 0.1)",
      }}
    >
      <Cpu className="size-3" aria-hidden />
      {children}
    </span>
  );
}
