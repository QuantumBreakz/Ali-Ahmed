import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

// The site's dark-theme tokens (src/styles/tokens.css) plus a paper tone for documents.
export const color = {
  bg: "#111213",
  surface: "#1b1c1e",
  line: "#2e3033",
  ink: "#f1f1f1",
  muted: "#9b9fa5",
  faint: "#5d6166",
  accent: "#79c9bc",
  accentDim: "rgba(121, 201, 188, 0.14)",
  warm: "#ef9a82",
  warmDim: "rgba(239, 154, 130, 0.16)",
  paper: "#ebe5d6",
  paperLine: "#cfc6b1",
  paperInk: "#24221f",
  paperMuted: "#7a7262",
};
export const serif = '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif';
export const sans = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';
export const mono = '"SF Mono", SFMono-Regular, Menlo, Consolas, monospace';

export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const s = (sec: number) => Math.round(sec * FPS);

const outExpo = Easing.bezier(0.16, 1, 0.3, 1);
const inOut = Easing.bezier(0.65, 0, 0.35, 1);

/** Clamped interpolation with an ease-out curve; times in seconds. */
export function tween(frame: number, from: number, to: number, a: number, b: number, curve: "out" | "inOut" = "out") {
  return interpolate(frame, [s(from), s(to)], [a, b], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: curve === "out" ? outExpo : inOut,
  });
}

/** 0 → 1 fade-and-rise for an element appearing at `at` seconds (and optionally leaving at `out`). */
export function useReveal(at: number, out?: number, rise = 18): CSSProperties {
  const f = useCurrentFrame();
  const inP = tween(f, at, at + 0.7, 0, 1);
  const outP = out === undefined ? 1 : tween(f, out, out + 0.5, 1, 0, "inOut");
  return { opacity: Math.min(inP, outP), transform: `translateY(${(1 - inP) * rise}px)` };
}

export function Stage({ children }: { children: ReactNode }) {
  return (
    <AbsoluteFill style={{ background: color.bg, color: color.ink, fontFamily: sans, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${color.line} 1.2px, transparent 1.2px)`,
          backgroundSize: "48px 48px",
          opacity: 0.55,
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(0,0,0,0.55) 100%)" }} />
      {children}
      <div style={{ position: "absolute", right: 64, bottom: 44, fontFamily: mono, fontSize: 20, color: color.faint, letterSpacing: 1 }}>
        aliahmed.si
      </div>
    </AbsoluteFill>
  );
}

/** Small uppercase chapter marker, e.g. "02 · Weights". Swaps text with a quick fade. */
export function Chapter({ items }: { items: { at: number; text: string }[] }) {
  const f = useCurrentFrame();
  const t = f / FPS;
  const current = [...items].reverse().find((i) => t >= i.at);
  if (!current) return null;
  const p = tween(f, current.at, current.at + 0.5, 0, 1);
  return (
    <div
      style={{
        position: "absolute",
        left: 64,
        top: 52,
        display: "flex",
        alignItems: "center",
        gap: 16,
        fontFamily: mono,
        fontSize: 22,
        letterSpacing: 3,
        textTransform: "uppercase",
        color: color.muted,
        opacity: p,
      }}
    >
      <span style={{ width: 28 * p, height: 2, background: color.accent }} />
      {current.text}
    </div>
  );
}

/** Integer or decimal counter that eases from `from` to `to` between two times. */
export function Count({ from = 0, to, a, b, decimals = 0 }: { from?: number; to: number; a: number; b: number; decimals?: number }) {
  const f = useCurrentFrame();
  return <>{tween(f, a, b, from, to, "inOut").toFixed(decimals)}</>;
}
