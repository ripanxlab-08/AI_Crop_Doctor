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
import { supabase } from "@/lib/supabase";
import { upsertProfile } from "@/lib/supabase-service";

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
      setTimeout(() => setIsShaking(false), 300);
      return;
    }

    setIsLoading(true);
    setLoaderStep(0);
    setValidationError("");
    setSuccessMessage("");

    try {
      if (activeTab === "login") {
        const { data: signData, error } = await supabase.auth.signInWithPassword({
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

        if (signData.user) {
          await upsertProfile({
            id: signData.user.id,
            full_name: (signData.user.user_metadata?.["name"] as string) || email.split("@")[0] || "Farmer",
            location: "Nadia, West Bengal",
          }).catch(console.error);
        }

        setIsLoading(false);
        setIsSuccess(true);
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

        if (data.user) {
          await upsertProfile({
            id: data.user.id,
            full_name: name || email.split("@")[0] || "Farmer",
            location: "Nadia, West Bengal",
          }).catch(console.error);
        }

        // If Supabase auto-logged the new user in, sign them out locally so
        // they must explicitly sign in (cleaner UX + email verification flow).
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
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred";
      setIsLoading(false);
      setValidationError(errorMsg);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
    }
  };

  // Animate loader steps while waiting for Supabase (visual feedback only)
  useEffect(() => {
    if (!isLoading) return;
    if (loaderStep < loadingSteps.length) {
      const timer = setTimeout(() => setLoaderStep((prev) => prev + 1), 900);
      return () => clearTimeout(timer);
    }
  }, [isLoading, loaderStep]);

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

  const fieldStyle = {
    background: "oklch(1 0 0 / 5%)",
    border: "1px solid oklch(1 0 0 / 10%)",
    color: "oklch(0.95 0.015 180)",
    outline: "none",
  } as const;

  return (
    <div
      className="relative flex min-h-screen flex-col justify-between overflow-x-hidden pb-10"
      style={{ background: "oklch(0.09 0.018 250)" }}
    >
      {/* Cyber grid bg */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.72 0.2 152 / 2%) 1px, transparent 1px), linear-gradient(90deg, oklch(0.72 0.2 152 / 2%) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Radial top glow */}
      <div
        className="pointer-events-none absolute -left-1/4 top-0 -z-10 opacity-60"
        aria-hidden
        style={{
          width: "150%",
          height: "60%",
          background:
            "radial-gradient(ellipse at 50% 0%, oklch(0.72 0.2 152 / 0.12) 0%, transparent 65%)",
        }}
      />
      {/* Bottom cyan glow */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 -z-10 opacity-40"
        aria-hidden
        style={{
          width: "60%",
          height: "40%",
          background:
            "radial-gradient(ellipse at 100% 100%, oklch(0.78 0.18 180 / 0.15) 0%, transparent 65%)",
        }}
      />

      {/* Header bar */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-5 py-4"
        style={{
          background: "oklch(0.09 0.018 250 / 0.8)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid oklch(1 0 0 / 6%)",
        }}
      >
        <button
          onClick={() => router.push("/")}
          className="flex size-10 items-center justify-center rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label="Go Back"
          style={{
            background: "oklch(1 0 0 / 6%)",
            border: "1px solid oklch(1 0 0 / 10%)",
            color: "oklch(0.8 0.04 200)",
          }}
        >
          <ChevronLeft className="size-5" />
        </button>
        <span
          className="text-[10px] font-bold uppercase tracking-[0.3em]"
          style={{ color: "oklch(0.72 0.2 152)", fontFamily: "var(--font-mono)" }}
        >
          ◈ Auth Portal
        </span>
        <div className="w-10" aria-hidden />
      </header>

      {/* Main card viewport */}
      <main className="flex flex-1 items-center justify-center px-6 py-4">
        {isSuccess ? (
          /* SUCCESS STATE */
          <div
            className="animate-rise flex w-full max-w-md flex-col items-center justify-center p-8 text-center rounded-3xl"
            style={{
              background: "oklch(1 0 0 / 5%)",
              border: "1px solid oklch(0.72 0.2 152 / 0.4)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow: "0 0 40px oklch(0.72 0.2 152 / 0.2)",
            }}
          >
            <div
              className="relative flex size-24 items-center justify-center rounded-full animate-bounce"
              style={{
                background: "linear-gradient(135deg, oklch(0.72 0.2 152) 0%, oklch(0.65 0.18 165) 100%)",
                boxShadow: "0 0 30px oklch(0.72 0.2 152 / 0.6), 0 4px 0 oklch(0.35 0.12 152)",
              }}
            >
              <Check className="size-10" style={{ color: "oklch(0.08 0.02 152)" }} strokeWidth={3} />
            </div>
            <h2
              className="mt-6 font-display text-2xl font-bold"
              style={{ color: "oklch(0.95 0.015 180)" }}
            >
              Welcome Back!
            </h2>
            <p className="mt-2 text-sm" style={{ color: "oklch(0.6 0.04 200)" }}>
              You are signed in successfully. Syncing your profile and starting diagnosis...
            </p>
          </div>
        ) : isLoading ? (
          /* LOADING STATE */
          <div
            className="animate-rise flex w-full max-w-md flex-col items-center justify-center p-8 text-center rounded-3xl"
            style={{
              background: "oklch(1 0 0 / 5%)",
              border: "1px solid oklch(0.72 0.2 152 / 0.3)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            <div className="relative flex size-20 items-center justify-center">
              <span
                className="absolute inset-0 animate-ring rounded-full"
                style={{ background: "oklch(0.72 0.2 152 / 0.25)" }}
              />
              <Loader2
                className="relative size-10 animate-spin"
                style={{ color: "oklch(0.72 0.2 152)", filter: "drop-shadow(0 0 8px oklch(0.72 0.2 152 / 0.6))" }}
              />
            </div>
            <h2
              className="mt-6 font-display text-lg font-bold"
              style={{ color: "oklch(0.95 0.015 180)" }}
            >
              Synchronizing...
            </h2>
            <div
              className="mt-4 h-1.5 w-full overflow-hidden rounded-full"
              style={{ background: "oklch(1 0 0 / 8%)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${((loaderStep + 1) / (loadingSteps.length + 1)) * 100}%`,
                  background: "linear-gradient(90deg, oklch(0.72 0.2 152), oklch(0.78 0.18 180))",
                  boxShadow: "0 0 8px oklch(0.72 0.2 152 / 0.6)",
                }}
              />
            </div>
            <p
              className="mt-3 text-xs animate-pulse leading-relaxed"
              style={{ color: "oklch(0.6 0.04 200)", fontFamily: "var(--font-mono)" }}
            >
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
              background: "oklch(1 0 0 / 5%)",
              border: "1px solid oklch(1 0 0 / 12%)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              boxShadow:
                "0 0 60px oklch(0.72 0.2 152 / 0.1), 0 8px 32px oklch(0 0 0 / 0.5), inset 0 1px 0 oklch(1 0 0 / 0.08)",
            }}
            className={`flex w-full max-w-md flex-col p-6 rounded-3xl ${isShaking ? "animate-shake" : ""}`}
          >
            {/* Holographic shimmer overlay */}
            <div
              className="pointer-events-none absolute inset-0 rounded-3xl opacity-30 animate-holo"
              aria-hidden
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.2 152 / 0.06) 0%, oklch(0.78 0.18 180 / 0.06) 33%, oklch(0.78 0.18 75 / 0.04) 66%, oklch(0.72 0.2 152 / 0.06) 100%)",
                backgroundSize: "300% 300%",
              }}
            />

            {/* Swaying logo */}
            <div
              className="relative mx-auto flex size-24 items-center justify-center rounded-[2rem]"
              style={{
                background: "oklch(0.72 0.2 152 / 0.12)",
                border: "1px solid oklch(0.72 0.2 152 / 0.4)",
                boxShadow: "0 0 24px oklch(0.72 0.2 152 / 0.3), inset 0 1px 0 oklch(1 0 0 / 0.1)",
              }}
            >
              <img
                src={typeof leaf3d === "string" ? leaf3d : leaf3d.src}
                alt="AI Crop Doctor 3D Logo"
                className="size-16 animate-leaf relative z-10"
                style={{ filter: "drop-shadow(0 0 12px oklch(0.72 0.2 152 / 0.7))" }}
              />
              <span
                className="absolute -bottom-1.5 -right-1.5 flex size-8 items-center justify-center rounded-xl text-sm"
                style={{
                  background: "oklch(0.78 0.18 75)",
                  boxShadow: "0 0 10px oklch(0.78 0.18 75 / 0.5), 0 2px 0 oklch(0.5 0.15 45)",
                }}
              >
                🌾
              </span>
            </div>

            <h1
              className="mt-5 text-center font-display text-2xl font-bold"
              style={{ color: "oklch(0.95 0.015 180)", letterSpacing: "-0.02em" }}
            >
              AI Crop Doctor
            </h1>
            <p
              className="text-center text-[10px] mt-1 uppercase tracking-widest"
              style={{ color: "oklch(0.72 0.2 152)", fontFamily: "var(--font-mono)" }}
            >
              ◈ Secure Cloud Sync · Smart Agronomy
            </p>

            {/* Sliding Tabs */}
            <div
              className="relative mt-6 flex rounded-2xl p-1.5"
              style={{
                background: "oklch(1 0 0 / 5%)",
                border: "1px solid oklch(1 0 0 / 8%)",
              }}
            >
              <div
                className="absolute bottom-1.5 top-1.5 rounded-xl transition-all duration-300"
                style={{
                  width: "calc(50% - 6px)",
                  left: activeTab === "login" ? "6px" : "calc(50%)",
                  background: "linear-gradient(135deg, oklch(0.72 0.2 152 / 0.2) 0%, oklch(0.78 0.18 180 / 0.2) 100%)",
                  border: "1px solid oklch(0.72 0.2 152 / 0.4)",
                  boxShadow: "0 0 12px oklch(0.72 0.2 152 / 0.2)",
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setValidationError("");
                  setSuccessMessage("");
                }}
                className="relative z-10 flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider transition-all"
                style={{
                  color: activeTab === "login" ? "oklch(0.72 0.2 152)" : "oklch(0.5 0.04 200)",
                  fontFamily: "var(--font-mono)",
                }}
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
                className="relative z-10 flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider transition-all"
                style={{
                  color: activeTab === "signup" ? "oklch(0.72 0.2 152)" : "oklch(0.5 0.04 200)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Register
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {validationError && (
                <p
                  className="text-xs font-medium text-center py-2 px-3 rounded-xl"
                  style={{
                    background: "oklch(0.65 0.22 27 / 0.1)",
                    border: "1px solid oklch(0.65 0.22 27 / 0.3)",
                    color: "oklch(0.65 0.22 27)",
                  }}
                >
                  ⚠ {validationError}
                </p>
              )}

              {successMessage && (
                <p
                  className="text-xs font-medium text-center py-2 px-3 rounded-xl"
                  style={{
                    background: "oklch(0.72 0.2 152 / 0.1)",
                    border: "1px solid oklch(0.72 0.2 152 / 0.3)",
                    color: "oklch(0.72 0.2 152)",
                  }}
                >
                  ✓ {successMessage}
                </p>
              )}

              {activeTab === "signup" && (
                <div className="space-y-1.5">
                  <label
                    className="text-[10px] font-bold pl-1 uppercase tracking-widest"
                    style={{ color: "oklch(0.6 0.04 200)", fontFamily: "var(--font-mono)" }}
                  >
                    Full Name
                  </label>
                  <div className="relative flex items-center">
                    <UserIcon
                      className="absolute left-3.5 size-4 pointer-events-none"
                      style={{ color: "oklch(0.72 0.2 152)" }}
                    />
                    <input
                      type="text"
                      placeholder="e.g. Ripan Samui"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="min-h-12 w-full rounded-2xl pl-10 pr-4 text-sm transition-all"
                      style={{
                        ...fieldStyle,
                        boxShadow: "inset 0 1px 3px oklch(0 0 0 / 0.3)",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.border = "1px solid oklch(0.72 0.2 152 / 0.6)";
                        e.currentTarget.style.boxShadow = "0 0 0 3px oklch(0.72 0.2 152 / 0.15), inset 0 1px 3px oklch(0 0 0 / 0.3)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.border = "1px solid oklch(1 0 0 / 10%)";
                        e.currentTarget.style.boxShadow = "inset 0 1px 3px oklch(0 0 0 / 0.3)";
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  className="text-[10px] font-bold pl-1 uppercase tracking-widest"
                  style={{ color: "oklch(0.6 0.04 200)", fontFamily: "var(--font-mono)" }}
                >
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail
                    className="absolute left-3.5 size-4 pointer-events-none"
                    style={{ color: "oklch(0.78 0.18 180)" }}
                  />
                  <input
                    type="email"
                    placeholder="farmer@cropdoctor.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="min-h-12 w-full rounded-2xl pl-10 pr-4 text-sm transition-all"
                    style={{
                      ...fieldStyle,
                      boxShadow: "inset 0 1px 3px oklch(0 0 0 / 0.3)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = "1px solid oklch(0.78 0.18 180 / 0.6)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px oklch(0.78 0.18 180 / 0.15), inset 0 1px 3px oklch(0 0 0 / 0.3)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = "1px solid oklch(1 0 0 / 10%)";
                      e.currentTarget.style.boxShadow = "inset 0 1px 3px oklch(0 0 0 / 0.3)";
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center pl-1 pr-1">
                  <label
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: "oklch(0.6 0.04 200)", fontFamily: "var(--font-mono)" }}
                  >
                    Password
                  </label>
                  {activeTab === "login" && (
                    <span
                      className="text-[10px] font-bold cursor-pointer hover:opacity-80 transition-opacity uppercase tracking-wider"
                      style={{ color: "oklch(0.72 0.2 152)" }}
                    >
                      Forgot?
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <Lock
                    className="absolute left-3.5 size-4 pointer-events-none"
                    style={{ color: "oklch(0.72 0.2 152)" }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="min-h-12 w-full rounded-2xl pl-10 pr-11 text-sm transition-all"
                    style={{
                      ...fieldStyle,
                      boxShadow: "inset 0 1px 3px oklch(0 0 0 / 0.3)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = "1px solid oklch(0.72 0.2 152 / 0.6)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px oklch(0.72 0.2 152 / 0.15), inset 0 1px 3px oklch(0 0 0 / 0.3)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = "1px solid oklch(1 0 0 / 10%)";
                      e.currentTarget.style.boxShadow = "inset 0 1px 3px oklch(0 0 0 / 0.3)";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 flex items-center justify-center transition-colors hover:opacity-80"
                    style={{ color: "oklch(0.6 0.04 200)" }}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="relative w-full py-3.5 px-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-95"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.72 0.2 152) 0%, oklch(0.65 0.18 165) 100%)",
                    color: "oklch(0.08 0.02 152)",
                    boxShadow:
                      "0 0 20px oklch(0.72 0.2 152 / 0.5), 0 5px 0 oklch(0.35 0.12 152), inset 0 1px 0 oklch(1 0 0 / 0.3)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  <span>{activeTab === "login" ? "Sign In" : "Register"}</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </form>

            {/* Separator */}
            <div className="my-5 flex items-center gap-3">
              <span
                className="h-px flex-1"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, oklch(1 0 0 / 12%), transparent)",
                }}
              />
              <span
                className="text-[9px] font-bold uppercase tracking-[0.2em]"
                style={{ color: "oklch(0.5 0.04 200)", fontFamily: "var(--font-mono)" }}
              >
                Or Sync With
              </span>
              <span
                className="h-px flex-1"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, oklch(1 0 0 / 12%), transparent)",
                }}
              />
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin("Google")}
                className="relative py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-95"
                style={{
                  background: "oklch(1 0 0 / 5%)",
                  border: "1px solid oklch(1 0 0 / 10%)",
                  color: "oklch(0.9 0.015 180)",
                  backdropFilter: "blur(8px)",
                }}
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
                className="relative py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-95"
                style={{
                  background: "oklch(1 0 0 / 5%)",
                  border: "1px solid oklch(1 0 0 / 10%)",
                  color: "oklch(0.9 0.015 180)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-4 fill-current shrink-0"
                  aria-hidden="true"
                  style={{ color: "oklch(0.9 0.015 180)" }}
                >
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.93.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.72 1.09zm3.844-3.58c.844-1.024 1.403-2.44 1.247-3.85-1.208.052-2.678.805-3.538 1.83-1.247 1.48-1.169 2.899-.987 3.81 1.35.104 2.72-.78 3.278-1.79z" />
                </svg>
                <span>Apple ID</span>
              </button>
            </div>


          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="text-center text-[9px] font-bold uppercase tracking-[0.3em]"
        style={{ color: "oklch(0.35 0.04 200)", fontFamily: "var(--font-mono)" }}
      >
        AI CROP DOCTOR © 2025
      </footer>
    </div>
  );
}
