import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// The site's light-theme tokens (src/styles/tokens.css), so videos match the pages they sit in.
export const color = {
  canvas: "#ffffff",
  ink: "#262626",
  muted: "#5f6368",
  line: "#dedede",
  accent: "#087f75",
  accentWash: "#edf7f5",
  warm: "#a13f2a",
  warmWash: "#f9efec",
};
export const sans = 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
export const mono = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

export const FPS = 30;
export const seconds = (s: number) => Math.round(s * FPS);

export function Frame({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <AbsoluteFill style={{ background: color.canvas, color: color.ink, fontFamily: sans, padding: "56px 72px", ...style }}>
      {children}
      <div style={{ position: "absolute", right: 72, top: 24, fontSize: 22, color: color.muted }}>aliahmed.si</div>
    </AbsoluteFill>
  );
}

/** Fades and slides in from `at` (frames), for elements that appear in sequence. */
export function useEnter(at: number) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - at, fps, config: { damping: 200 } });
  return { opacity: progress, transform: `translateY(${interpolate(progress, [0, 1], [24, 0])}px)` };
}

export function Heading({ children, at = 0, size = 60 }: { children: ReactNode; at?: number; size?: number }) {
  return <h1 style={{ margin: 0, fontSize: size, lineHeight: 1.15, fontWeight: 700, letterSpacing: -1, ...useEnter(at) }}>{children}</h1>;
}

export function Caption({ children, at = 0 }: { children: ReactNode; at?: number }) {
  return <p style={{ margin: "20px 0 0", fontSize: 32, lineHeight: 1.4, color: color.muted, maxWidth: 1050, ...useEnter(at) }}>{children}</p>;
}
