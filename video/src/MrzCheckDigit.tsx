import { useCurrentFrame } from "remotion";
import { Caption, color, Frame, Heading, mono, seconds, useEnter } from "./theme";

const FIELD = "L898902C3";
const LINE = "L898902C36UTO7408122F1204159ZE184226B<<<<<10";
const WEIGHTS = [7, 3, 1];
const value = (c: string) => (/\d/.test(c) ? Number(c) : /[A-Z]/.test(c) ? c.charCodeAt(0) - 55 : 0);
const rows = [...FIELD].map((c, i) => ({ c, v: value(c), w: WEIGHTS[i % 3], p: value(c) * WEIGHTS[i % 3] }));
const total = rows.reduce((sum, r) => sum + r.p, 0);
const digit = total % 10;

const T = { line: seconds(1.5), values: seconds(4), weights: seconds(7.5), products: seconds(11), sum: seconds(14.5), result: seconds(17.5) };
export const MRZ_DURATION = seconds(23);

function Row({ label, cells, at, accent }: { label: string; cells: (string | number)[]; at: number; accent?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, ...useEnter(at) }}>
      <div style={{ width: 170, fontSize: 24, color: color.muted }}>{label}</div>
      {cells.map((cell, i) => (
        <div
          key={i}
          style={{
            width: 82,
            height: 54,
            display: "grid",
            placeItems: "center",
            fontFamily: mono,
            fontSize: 30,
            fontWeight: 700,
            borderRadius: 10,
            background: accent ? color.accentWash : "#f6f6f6",
            color: accent ? color.accent : color.ink,
          }}
        >
          {cell}
        </div>
      ))}
    </div>
  );
}

export function MrzCheckDigit() {
  const frame = useCurrentFrame();
  const highlight = frame >= T.values;
  return (
    <Frame>
      <Heading size={54}>How a passport MRZ check digit works</Heading>
      <div style={{ marginTop: 30, fontFamily: mono, fontSize: 31, letterSpacing: 2, ...useEnter(T.line) }}>
        <span style={{ background: highlight ? color.accentWash : "transparent", color: highlight ? color.accent : color.ink, borderRadius: 6 }}>
          {LINE.slice(0, 9)}
        </span>
        <span style={{ background: frame >= T.result ? color.warmWash : "transparent", color: frame >= T.result ? color.warm : color.ink, borderRadius: 6 }}>
          {LINE[9]}
        </span>
        {LINE.slice(10)}
      </div>
      <Row label="Character" cells={rows.map((r) => r.c)} at={T.values} />
      <Row label="Value" cells={rows.map((r) => r.v)} at={T.values + seconds(0.8)} />
      <Row label="× weight" cells={rows.map((r) => r.w)} at={T.weights} accent />
      <Row label="= product" cells={rows.map((r) => r.p)} at={T.products} />
      <div style={{ marginTop: 20, fontSize: 34, fontWeight: 700, ...useEnter(T.sum) }}>
        Sum {total} → {total} mod 10 = <span style={{ color: color.warm }}>{digit}</span>
      </div>
      <Caption at={T.result}>
        Letters count 10–35, {"<"} counts 0, weights repeat 7, 3, 1. The printed digit is {digit}: read correctly.
      </Caption>
    </Frame>
  );
}
