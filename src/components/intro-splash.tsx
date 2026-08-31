"use client";

import { useEffect, useRef, useState } from "react";
import leaf3d from "@/assets/leaf-3d.png";

interface IntroSplashProps {
  onComplete: () => void;
}

const TAGLINES = [
  "Scanning neural networks...",
  "Loading crop intelligence...",
  "Calibrating AI vision...",
  "Connecting to cloud...",
];

export default function IntroSplash({ onComplete }: IntroSplashProps) {
  const [phase, setPhase] = useState<
    "boot" | "logo" | "tagline" | "scan" | "exit"
  >("boot");
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [scanLine, setScanLine] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Boot → Logo
  useEffect(() => {
    const t = setTimeout(() => setPhase("logo"), 350);
    return () => clearTimeout(t);
  }, []);

  // Logo → Tagline
  useEffect(() => {
    if (phase !== "logo") return;
    const t = setTimeout(() => setPhase("tagline"), 1000);
    return () => clearTimeout(t);
  }, [phase]);

  // Tagline cycling
  useEffect(() => {
    if (phase !== "tagline") return;
    const interval = setInterval(() => {
      setTaglineIndex((i) => {
        if (i >= TAGLINES.length - 1) {
          clearInterval(interval);
          setTimeout(() => setPhase("scan"), 300);
          return i;
        }
        return i + 1;
      });
    }, 480);
    return () => clearInterval(interval);
  }, [phase]);

  // Progress bar + scan line animation
  useEffect(() => {
    if (phase !== "scan") return;
    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const dur = 1600; // ms total
      const t = Math.min(elapsed / dur, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.round(eased * 100));
      setScanLine(Math.round(eased * 100));

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setProgress(100);
        setScanLine(100);
        setTimeout(() => setPhase("exit"), 400);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  // Exit → complete
  useEffect(() => {
    if (phase !== "exit") return;
    const t = setTimeout(onComplete, 600);
    return () => clearTimeout(t);
  }, [phase, onComplete]);

  const leafSrc = typeof leaf3d === "string" ? leaf3d : leaf3d.src;

  return (
    <div
      aria-label="Loading AI Crop Doctor"
      role="status"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "oklch(0.07 0.018 250)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        opacity: phase === "exit" ? 0 : 1,
        transition: "opacity 0.6s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* ── Animated cyber grid background ── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(oklch(0.72 0.2 152 / 3%) 1px, transparent 1px), linear-gradient(90deg, oklch(0.72 0.2 152 / 3%) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          animation: "grid-scroll 3s linear infinite",
        }}
      />

      {/* ── Top-left corner bracket ── */}
      <Corner pos="tl" />
      {/* ── Top-right corner bracket ── */}
      <Corner pos="tr" />
      {/* ── Bottom-left corner bracket ── */}
      <Corner pos="bl" />
      {/* ── Bottom-right corner bracket ── */}
      <Corner pos="br" />

      {/* ── Radial hero glow ── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 55% at 50% 50%, oklch(0.72 0.2 152 / 0.12) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Floating particles ── */}
      {PARTICLES.map((p) => (
        <Particle key={p.id} {...p} />
      ))}

      {/* ── Horizontal scan line that sweeps during scan phase ── */}
      {phase === "scan" && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${scanLine}%`,
            height: "2px",
            background:
              "linear-gradient(90deg, transparent, oklch(0.72 0.2 152 / 0.8), oklch(0.78 0.18 180), oklch(0.72 0.2 152 / 0.8), transparent)",
            boxShadow: "0 0 20px oklch(0.72 0.2 152 / 0.6)",
            transition: "top 0.016s linear",
            pointerEvents: "none",
          }}
        />
      )}

      {/* ── Main content container ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0",
          opacity: phase === "boot" ? 0 : 1,
          transform: phase === "boot" ? "scale(0.85) translateY(20px)" : "scale(1) translateY(0)",
          transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Logo icon */}
        <div
          style={{
            position: "relative",
            width: 120,
            height: 120,
            borderRadius: "2.4rem",
            background: "oklch(0.72 0.2 152 / 0.12)",
            border: "1px solid oklch(0.72 0.2 152 / 0.4)",
            boxShadow:
              "0 0 40px oklch(0.72 0.2 152 / 0.35), 0 0 80px oklch(0.72 0.2 152 / 0.12), inset 0 1px 0 oklch(1 0 0 / 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "logo-pulse 3s ease-in-out infinite",
          }}
        >
          {/* Rotating ring */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: -8,
              borderRadius: "2.8rem",
              border: "1px solid oklch(0.72 0.2 152 / 0.25)",
              animation: "spin-slow 8s linear infinite",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: -16,
              borderRadius: "3.2rem",
              border: "1px dashed oklch(0.78 0.18 180 / 0.15)",
              animation: "spin-slow 12s linear infinite reverse",
            }}
          />

          <img
            src={leafSrc}
            alt="AI Crop Doctor leaf logo"
            style={{
              width: 80,
              height: 80,
              objectFit: "contain",
              filter: "drop-shadow(0 0 16px oklch(0.72 0.2 152 / 0.8))",
              animation: "leaf-bob 4s ease-in-out infinite",
              position: "relative",
              zIndex: 2,
            }}
          />

          {/* Badge */}
          <span
            style={{
              position: "absolute",
              bottom: -6,
              right: -6,
              width: 32,
              height: 32,
              borderRadius: "0.75rem",
              background: "oklch(0.78 0.18 75)",
              boxShadow: "0 0 12px oklch(0.78 0.18 75 / 0.6), 0 2px 0 oklch(0.45 0.12 55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              zIndex: 3,
            }}
          >
            🌾
          </span>
        </div>

        {/* App title */}
        <h1
          style={{
            marginTop: 28,
            fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(1.75rem, 6vw, 2.5rem)",
            letterSpacing: "-0.03em",
            color: "oklch(0.95 0.015 180)",
            textShadow: "0 0 30px oklch(0.72 0.2 152 / 0.3)",
            lineHeight: 1.1,
            textAlign: "center",
            margin: "28px 0 0",
          }}
        >
          AI Crop Doctor
        </h1>

        {/* Subtitle badge */}
        <div
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 14px",
            borderRadius: 999,
            background: "oklch(0.72 0.2 152 / 0.1)",
            border: "1px solid oklch(0.72 0.2 152 / 0.3)",
            boxShadow: "0 0 12px oklch(0.72 0.2 152 / 0.15)",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "oklch(0.72 0.2 152)",
              boxShadow: "0 0 6px oklch(0.72 0.2 152)",
              animation: "blink 1.4s ease-in-out infinite",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "JetBrains Mono, Fira Code, ui-monospace, monospace",
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "oklch(0.72 0.2 152)",
            }}
          >
            Smart Agronomy · AI Precision
          </span>
        </div>

        {/* Tagline cycling text */}
        <div
          style={{
            marginTop: 32,
            height: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p
            key={taglineIndex}
            style={{
              fontFamily: "JetBrains Mono, ui-monospace, monospace",
              fontSize: 11,
              color: "oklch(0.6 0.04 200)",
              letterSpacing: "0.08em",
              animation: "fadeInUp 0.35s ease both",
              margin: 0,
            }}
          >
            {phase === "scan" ? `Initializing... ${progress}%` : TAGLINES[taglineIndex]}
          </p>
        </div>

        {/* Progress bar */}
        <div
          style={{
            marginTop: 24,
            width: "min(280px, 70vw)",
            height: 3,
            borderRadius: 999,
            background: "oklch(1 0 0 / 7%)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, oklch(0.72 0.2 152), oklch(0.78 0.18 180))",
              borderRadius: 999,
              boxShadow: "0 0 8px oklch(0.72 0.2 152 / 0.7)",
              transition: "width 0.08s linear",
            }}
          />
          {/* Shimmer sweep */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              width: "40%",
              background:
                "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.4), transparent)",
              animation: progress < 100 ? "shimmer 1.2s ease-in-out infinite" : "none",
            }}
          />
        </div>

        {/* Version tag */}
        <p
          style={{
            marginTop: 36,
            fontFamily: "JetBrains Mono, ui-monospace, monospace",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "oklch(0.3 0.03 200)",
          }}
        >
          ◈ v2.0 · Futuristic Biopunk Edition
        </p>
      </div>

      {/* ── Inline keyframes via style tag ── */}
      <style>{`
        @keyframes grid-scroll {
          0%   { background-position: 0 0; }
          100% { background-position: 44px 44px; }
        }
        @keyframes logo-pulse {
          0%, 100% { box-shadow: 0 0 40px oklch(0.72 0.2 152 / 0.35), 0 0 80px oklch(0.72 0.2 152 / 0.12), inset 0 1px 0 oklch(1 0 0 / 0.1); }
          50%       { box-shadow: 0 0 60px oklch(0.72 0.2 152 / 0.55), 0 0 100px oklch(0.72 0.2 152 / 0.2), inset 0 1px 0 oklch(1 0 0 / 0.1); }
        }
        @keyframes spin-slow {
          to { transform: rotate(360deg); }
        }
        @keyframes leaf-bob {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50%       { transform: translateY(-8px) rotate(2deg); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
        @keyframes particle-drift {
          0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0.5; }
          33%  { transform: translateY(-28px) translateX(12px) scale(1.15); opacity: 0.9; }
          66%  { transform: translateY(-14px) translateX(-10px) scale(0.85); opacity: 0.6; }
          100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.5; }
        }
        @keyframes corner-glow {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ── Corner bracket decorations ── */
type CornerPos = "tl" | "tr" | "bl" | "br";

function Corner({ pos }: { pos: CornerPos }) {
  const size = 28;
  const thickness = 2;
  const color = "oklch(0.72 0.2 152 / 0.6)";

  const style: React.CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    animation: "corner-glow 2.5s ease-in-out infinite",
    ...(pos === "tl" ? { top: 20, left: 20, borderTop: `${thickness}px solid ${color}`, borderLeft: `${thickness}px solid ${color}` } : {}),
    ...(pos === "tr" ? { top: 20, right: 20, borderTop: `${thickness}px solid ${color}`, borderRight: `${thickness}px solid ${color}` } : {}),
    ...(pos === "bl" ? { bottom: 20, left: 20, borderBottom: `${thickness}px solid ${color}`, borderLeft: `${thickness}px solid ${color}` } : {}),
    ...(pos === "br" ? { bottom: 20, right: 20, borderBottom: `${thickness}px solid ${color}`, borderRight: `${thickness}px solid ${color}` } : {}),
  };

  return <div aria-hidden style={style} />;
}

/* ── Floating ambient particles ── */
const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  top: `${8 + Math.round(Math.random() * 84)}%`,
  left: `${4 + Math.round(Math.random() * 92)}%`,
  size: 2 + Math.round(Math.random() * 3),
  color: i % 3 === 0 ? "oklch(0.72 0.2 152)" : i % 3 === 1 ? "oklch(0.78 0.18 180)" : "oklch(0.78 0.18 75)",
  delay: `${(Math.round(Math.random() * 40) / 10).toFixed(1)}s`,
  duration: `${4 + Math.round(Math.random() * 4)}s`,
}));

function Particle({
  top,
  left,
  size,
  color,
  delay,
  duration,
}: (typeof PARTICLES)[0]) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        top,
        left,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 ${size * 3}px ${color}`,
        animation: `particle-drift ${duration} ease-in-out infinite`,
        animationDelay: delay,
        pointerEvents: "none",
        opacity: 0.6,
      }}
    />
  );
}
