import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, CalendarDays, Home, ScanLine, Sprout, User, ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/diagnose", label: "Diagnose", icon: ScanLine },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/assistant", label: "Assistant", icon: Sprout },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNavigation() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-screen-sm border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="grid grid-cols-5">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(`${to}/`);
          return (
            <li key={to}>
              <Link
                to={to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-xl transition-all",
                    active ? "bg-primary-soft shadow-soft" : "bg-transparent",
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.4 : 1.9} aria-hidden />
                </span>
                {label}
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
    <header className="sticky top-0 z-30 flex items-start gap-3 border-b border-border/70 bg-background/90 px-5 py-4 backdrop-blur">
      {backTo ? (
        <Link
          to={backTo}
          aria-label="Go back"
          className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </Link>
      ) : null}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-semibold">{title}</h1>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}

export function NotificationBell({ count }: { count: number }) {
  return (
    <Link
      to="/calendar"
      aria-label={`${count} notifications`}
      className="relative flex size-11 items-center justify-center rounded-xl bg-card shadow-soft"
    >
      <Bell className="size-5 text-foreground" aria-hidden />
      {count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-screen-sm flex-col bg-background pb-24">
      {children}
      <BottomNavigation />
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-base font-semibold">{children}</h2>
      {action}
    </div>
  );
}
