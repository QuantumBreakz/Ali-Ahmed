import { useCurrentFrame, interpolate } from "remotion";
import { Caption, color, Frame, Heading, seconds, useEnter } from "./theme";

const STAGES = [
  { name: "Capture", question: "Is the photo usable?" },
  { name: "Classify", question: "Which document is it?" },
  { name: "OCR + MRZ", question: "What does it say?" },
  { name: "Authenticity", question: "Is it genuine?" },
  { name: "Face match", question: "Same person?" },
  { name: "Liveness", question: "A live person?" },
];
const FIRST = seconds(2.5);
const STEP = seconds(2.2);
export const KYC_DURATION = FIRST + STEP * STAGES.length + seconds(5.5);

function Stage({ index }: { index: number }) {
  const frame = useCurrentFrame();
  const at = FIRST + index * STEP;
  const active = frame >= at && frame < at + STEP;
  const done = frame >= at + STEP;
  return (
    <div
      style={{
        flex: 1,
        borderRadius: 16,
        padding: "26px 18px",
        border: `3px solid ${active || done ? color.accent : color.line}`,
        background: active ? color.accentWash : color.canvas,
        ...useEnter(at),
      }}
    >
      <div style={{ fontSize: 20, color: color.muted, fontWeight: 600 }}>{index + 1}</div>
      <div style={{ fontSize: 29, fontWeight: 700, marginTop: 8 }}>{STAGES[index].name}</div>
      <div style={{ fontSize: 22, color: color.muted, marginTop: 10, lineHeight: 1.3 }}>{STAGES[index].question}</div>
    </div>
  );
}

export function KycPipeline() {
  const frame = useCurrentFrame();
  const decisionAt = FIRST + STEP * STAGES.length;
  const progress = interpolate(frame, [FIRST, decisionAt], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Frame>
      <Heading>How KYC identity verification works</Heading>
      <Caption at={seconds(0.6)}>Six checks on every ID photo and selfie, then one decision.</Caption>
      <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
        {STAGES.map((_, i) => (
          <Stage key={i} index={i} />
        ))}
      </div>
      <div style={{ height: 8, background: color.line, borderRadius: 4, marginTop: 28 }}>
        <div style={{ width: `${progress}%`, height: 8, background: color.accent, borderRadius: 4 }} />
      </div>
      <div style={{ display: "flex", gap: 20, marginTop: 32, fontSize: 30, fontWeight: 700, ...useEnter(decisionAt) }}>
        <span style={{ padding: "14px 26px", borderRadius: 12, background: color.accentWash, color: color.accent }}>Approve</span>
        <span style={{ padding: "14px 26px", borderRadius: 12, background: "#f3f3f3" }}>Human review</span>
        <span style={{ padding: "14px 26px", borderRadius: 12, background: color.warmWash, color: color.warm }}>Reject, with a reason</span>
      </div>
      <Caption at={decisionAt + seconds(1.2)}>Every rejection carries a reason someone can act on.</Caption>
    </Frame>
  );
}
