"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  Check,
  Loader2,
  Eye,
  EyeOff,
  ChevronLeft,
} from "lucide-react";
import leaf3d from "@/assets/leaf-3d.png";
import { loginUser } from "@/lib/store";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Animation and status states
  const [isShaking, setIsShaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loaderStep, setLoaderStep] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 3D Card tilt states
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Simulated login progress messages
  const loadingSteps = [
    "Establishing secure agricultural cloud sync...",
    "Verifying credentials & encryption keys...",
    "Restoring your custom crop calendars & history...",
  ];

  // Mouse move handler for 3D tilt effect (desktop only)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();

    // Position of mouse relative to card center
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Convert to rotation values (max 8 degrees tilt)
    const rotateX = -(y / (rect.height / 2)) * 8;
    const rotateY = (x / (rect.width / 2)) * 8;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Validation
  const validateForm = () => {
    if (!email) {
      setValidationError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError("Please enter a valid email address");
      return false;
    }
    if (!password || password.length < 6) {
      setValidationError("Password must be at least 6 characters long");
      return false;
    }
    if (activeTab === "signup" && !name) {
      setValidationError("Name is required to sign up");
      return false;
    }
    setValidationError("");
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300); // Reset shake animation
      return;
    }

    setIsLoading(true);
    setLoaderStep(0);
    setValidationError("");
    setSuccessMessage("");

    try {
      if (activeTab === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setIsLoading(false);
          setValidationError(error.message);
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 300);
          return;
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setIsLoading(false);
          setValidationError(error.message);
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 300);
          return;
        }

        // If auto-logged in, immediately log them out locally to require manual sign in
        if (data.session) {
          await supabase.auth.signOut({ scope: "local" });
        }

        setIsLoading(false);
        setActiveTab("login");
        setValidationError("");

        if (data.user && !data.session) {
          setSuccessMessage(
            "Registration successful! Please check your email for a confirmation link.",
          );
        } else {
          setSuccessMessage("Account created successfully! Please sign in with your credentials.");
        }
        return;
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred";
      setIsLoading(false);
      setValidationError(errorMsg);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
    }
  };

  // Multi-stage loader steps simulation
  useEffect(() => {
    if (!isLoading) return;

    let timer: ReturnType<typeof setTimeout> | undefined;

    if (loaderStep < loadingSteps.length) {
      timer = setTimeout(() => {
        setLoaderStep((prev) => prev + 1);
      }, 900);
    } else {
      // Completed all steps: show success checkmark!
      setIsLoading(false);
      setIsSuccess(true);

      // Update global application store
      const displayName = activeTab === "signup" ? name : email.split("@")[0] || "";
      loginUser(email, displayName);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, loaderStep, activeTab, name, email]);

  // Redirect to home when login succeeds
  useEffect(() => {
    if (!isSuccess) return;
    const redirectTimer = setTimeout(() => {
      router.push("/home");
    }, 1500);
    return () => clearTimeout(redirectTimer);
  }, [isSuccess, router]);

  // Social log in helper
  const handleSocialLogin = async (platform: "Google" | "Apple") => {
    setIsLoading(true);
    setLoaderStep(0);
    setValidationError("");
    try {
      const provider = platform === "Google" ? "google" : "apple";
      const redirectTo = typeof window !== "undefined" ? window.location.origin + "/home" : "";
      const { error } = await supabase.auth.signInWithOAuth(
        redirectTo ? { provider, options: { redirectTo } } : { provider },
      );
      if (error) {
        setIsLoading(false);
        setValidationError(error.message);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "OAuth login failed";
      setIsLoading(false);
      setValidationError(errorMsg);
    }
  };

  // Quick fill helper for easy testing
  const handleQuickFill = () => {
    setEmail("farmer@cropdoctor.com");
    setPassword("admin123");
    if (activeTab === "signup") {
      setName("Ripan Samui");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-background overflow-x-hidden pb-10">
      {/* Dynamic colorful mesh background */}
      <div
        className="pointer-events-none absolute -left-1/4 top-0 -z-10 size-[150%] opacity-40 blur-3xl bg-[radial-gradient(ellipse_at_top,_var(--color-primary-soft)_0%,_transparent_55%),_radial-gradient(ellipse_at_bottom,_var(--color-accent-soft)_0%,_transparent_60%)]"
        aria-hidden
      />

      {/* Header bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 backdrop-blur-md">
        <button
          onClick={() => router.push("/")}
          className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground shadow-[0_3px_0_var(--color-border)] active:shadow-none active:translate-y-[3px] transition-all"
          aria-label="Go Back"
        >
          <ChevronLeft className="size-5" />
        </button>
        <span className="font-display text-sm font-bold text-muted-foreground uppercase tracking-widest">
          Auth Portal
        </span>
        <div className="w-10" aria-hidden />
      </header>

      {/* Main card viewport */}
      <main className="flex flex-1 items-center justify-center px-6 py-4">
        {isSuccess ? (
          /* SUCCESS STATE */
          <div className="surface-lift animate-rise flex w-full max-w-md flex-col items-center justify-center p-8 text-center bg-card/90 backdrop-blur">
            <div className="relative flex size-24 items-center justify-center rounded-full bg-success shadow-[0_4px_0_oklch(0.45_0.13_150)] animate-bounce">
              <Check className="size-10 text-success-foreground" strokeWidth={3} />
            </div>
            <h2 className="mt-6 font-display text-2xl font-bold">Welcome Back!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You are signed in successfully. Syncing your profile and starting diagnosis...
            </p>
          </div>
        ) : isLoading ? (
          /* LOADING STATE */
          <div className="surface-lift animate-rise flex w-full max-w-md flex-col items-center justify-center p-8 text-center bg-card/90 backdrop-blur">
            <div className="relative flex size-20 items-center justify-center">
              <span className="absolute inset-0 animate-ring rounded-full bg-primary/20" />
              <Loader2 className="relative size-10 animate-spin text-primary" />
            </div>
            <h2 className="mt-6 font-display text-lg font-bold">Synchronizing...</h2>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-700"
                style={{ width: `${((loaderStep + 1) / (loadingSteps.length + 1)) * 100}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground animate-pulse leading-relaxed">
              {loadingSteps[loaderStep] || "Finishing sync setup..."}
            </p>
          </div>
        ) : (
          /* LOGIN / SIGNUP FORM STATE */
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.01, 1.01, 1.01)`,
              transition:
                tilt.x === 0 && tilt.y === 0
                  ? "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
                  : "transform 0.05s ease-out",
            }}
            className={`surface-lift flex w-full max-w-md flex-col p-6 backdrop-blur bg-card/85 transition-shadow duration-300 hover:shadow-2xl border border-white/20 dark:border-white/10 ${isShaking ? "animate-shake" : ""}`}
          >
            {/* Swaying logo */}
            <div className="mx-auto flex size-24 items-center justify-center rounded-[2rem] bg-primary-soft shadow-lift relative">
              <img
                src={typeof leaf3d === "string" ? leaf3d : leaf3d.src}
                alt="AI Crop Doctor 3D Logo"
                className="size-16 animate-leaf"
              />
              <span className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-lg bg-card shadow-soft text-xs">
                🌾
              </span>
            </div>

            <h1 className="mt-4 text-center font-display text-2xl font-bold">AI Crop Doctor</h1>
            <p className="text-center text-xs text-muted-foreground mt-0.5">
              Secure Cloud Backup & Smart Agronomy
            </p>

            {/* Sliding Tabs */}
            <div className="relative mt-6 flex rounded-2xl bg-secondary/80 p-1.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]">
              <div
                className={`absolute bottom-1.5 top-1.5 rounded-xl bg-card shadow-soft transition-all duration-300`}
                style={{
                  width: "calc(50% - 6px)",
                  left: activeTab === "login" ? "6px" : "calc(50%)",
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setValidationError("");
                  setSuccessMessage("");
                }}
                className={`relative z-10 flex-1 py-2 text-center text-xs font-bold transition-colors ${activeTab === "login" ? "text-primary" : "text-muted-foreground"}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("signup");
                  setValidationError("");
                  setSuccessMessage("");
                }}
                className={`relative z-10 flex-1 py-2 text-center text-xs font-bold transition-colors ${activeTab === "signup" ? "text-primary" : "text-muted-foreground"}`}
              >
                Create Account
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {validationError && (
                <p className="text-xs font-medium text-destructive animate-fade-in text-center bg-destructive-soft py-2 px-3 rounded-xl border border-destructive/20">
                  ⚠️ {validationError}
                </p>
              )}

              {successMessage && (
                <p className="text-xs font-medium text-success animate-fade-in text-center bg-success-soft py-2 px-3 rounded-xl border border-success/20">
                  ✅ {successMessage}
                </p>
              )}

              {activeTab === "signup" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground pl-1">Full Name</label>
                  <div className="relative flex items-center">
                    <UserIcon className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. Ripan Samui"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="min-h-12 w-full rounded-2xl border border-input bg-background/55 pl-10 pr-4 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground pl-1">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="email"
                    placeholder="farmer@cropdoctor.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="min-h-12 w-full rounded-2xl border border-input bg-background/55 pl-10 pr-4 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center pl-1 pr-1">
                  <label className="text-xs font-bold text-muted-foreground">Password</label>
                  {activeTab === "login" && (
                    <span className="text-[11px] font-semibold text-primary hover:underline cursor-pointer">
                      Forgot Password?
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="min-h-12 w-full rounded-2xl border border-input bg-background/55 pl-10 pr-11 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Fill Button */}
              <div className="flex justify-end pr-1">
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  ⚡ Auto-fill Demo
                </button>
              </div>

              {/* Main Submit 3D Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="relative w-full py-3.5 px-5 rounded-2xl bg-primary text-primary-foreground font-semibold font-display shadow-[0_5px_0_oklch(0.35_0.1_152)] hover:shadow-[0_6px_0_oklch(0.35_0.1_152)] active:shadow-[0_1px_0_oklch(0.35_0.1_152)] active:translate-y-[4px] transition-all hover:bg-primary/95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{activeTab === "login" ? "Sign In" : "Register"}</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </form>

            {/* Separator */}
            <div className="my-5 flex items-center gap-3 text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Or Sync With</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            {/* Social 3D Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin("Google")}
                className="relative py-2.5 px-4 rounded-xl border border-border bg-card text-foreground text-xs font-semibold shadow-[0_3px_0_oklch(0.9_0.015_110)] active:shadow-[0_1px_0_oklch(0.9_0.015_110)] active:translate-y-[2px] transition-all hover:bg-muted flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin("Apple")}
                className="relative py-2.5 px-4 rounded-xl border border-border bg-card text-foreground text-xs font-semibold shadow-[0_3px_0_oklch(0.9_0.015_110)] active:shadow-[0_1px_0_oklch(0.9_0.015_110)] active:translate-y-[2px] transition-all hover:bg-muted flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-4 fill-current text-foreground shrink-0"
                  aria-hidden="true"
                >
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.93.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.72 1.09zm3.844-3.58c.844-1.024 1.403-2.44 1.247-3.85-1.208.052-2.678.805-3.538 1.83-1.247 1.48-1.169 2.899-.987 3.81 1.35.104 2.72-.78 3.278-1.79z" />
                </svg>
                <span>Apple ID</span>
              </button>
            </div>

            {/* Guest Entry Link */}
            <button
              onClick={() => router.push("/home")}
              className="mt-6 text-center text-xs font-semibold text-muted-foreground hover:text-primary transition-colors underline cursor-pointer"
            >
              Skip and Enter as Guest
            </button>
          </div>
        )}
      </main>

      {/* Footer copyright */}
      <footer className="text-center text-[10px] text-muted-foreground">AI Crop Doctor</footer>
    </div>
  );
}
