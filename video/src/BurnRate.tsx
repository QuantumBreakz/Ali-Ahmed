import { interpolate, useCurrentFrame } from "remotion";
import { Caption, color, Frame, Heading, seconds, useEnter } from "./theme";

const T = { budget: seconds(1.5), normal: seconds(5), fast: seconds(10.5), maths: seconds(15.5) };
export const BURN_DURATION = seconds(22);

function Bar({ label, spent, at, tone }: { label: string; spent: number; at: number; tone: string }) {
  const frame = useCurrentFrame();
  const width = interpolate(frame, [at, at + seconds(3)], [0, spent], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ marginTop: 26, ...useEnter(at) }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28 }}>
        <span style={{ fontWeight: 700 }}>{label}</span>
        <span style={{ color: tone, fontWeight: 700 }}>{width.toFixed(1)}% of budget used</span>
      </div>
      <div style={{ height: 34, marginTop: 12, borderRadius: 10, background: "#f1f1f1", overflow: "hidden" }}>
        <div style={{ width: `${width}%`, height: 34, background: tone }} />
      </div>
    </div>
  );
}

export function BurnRate() {
  return (
    <Frame>
      <Heading>Error budgets and burn rate</Heading>
      <Caption at={T.budget}>A 99.9% target over 30 days allows 0.1% failure: 43.2 minutes of error budget.</Caption>
      <div style={{ marginTop: 30, fontSize: 24, color: color.muted, ...useEnter(T.normal) }}>Each full bar is the whole 30-day budget.</div>
      <Bar label="One bad hour at burn rate 1" spent={(1 / 720) * 100} at={T.normal} tone={color.accent} />
      <Bar label="One bad hour at burn rate 14.4" spent={(14.4 / 720) * 100} at={T.fast} tone={color.warm} />
      <div style={{ marginTop: 40, fontSize: 34, fontWeight: 700, ...useEnter(T.maths) }}>14.4 × (1 hour ÷ 720 hours) = 2% of the month's budget</div>
      <Caption at={T.maths + seconds(1.5)}>That is the usual threshold for paging someone. Slower burns raise a ticket instead.</Caption>
    </Frame>
  );
}
