import { useCurrentFrame } from "remotion";
import { Chapter, color, FPS, mono, s, sans, serif, Stage, tween, useReveal } from "./theme";

export const APPROVAL_DURATION = s(26);

// Lanes: Draft, Step 1, Step 2, Approved (x centres), and the Returned box below Step 2.
const LANE_Y = 560;
const LANES = [
  { x: 330, title: "Draft", sub: "" },
  { x: 760, title: "Step 1", sub: "Engineering" },
  { x: 1190, title: "Step 2", sub: "Maintenance" },
  { x: 1620, title: "Approved", sub: "" },
];
const RETURNED = { x: 1190, y: 850 };

function Lane({ x, title, sub, glow }: { x: number; title: string; sub: string; glow: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x - 170,
        top: LANE_Y - 130,
        width: 340,
        height: 260,
        borderRadius: 18,
        border: `2px solid ${glow > 0 ? color.accent : color.line}`,
        background: glow > 0 ? color.accentDim : color.surface,
        boxShadow: glow > 0 ? `0 0 ${40 * glow}px rgba(121,201,188,${0.35 * glow})` : "none",
      }}
    >
      <div style={{ position: "absolute", top: 18, width: "100%", textAlign: "center", fontFamily: sans, fontSize: 30, color: color.ink }}>
        {title}
      </div>
      {sub && (
        <div style={{ position: "absolute", top: 58, width: "100%", textAlign: "center", fontFamily: sans, fontSize: 22, color: color.muted }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function Card({ x, y, label, tone, opacity = 1 }: { x: number; y: number; label: string; tone: string; opacity?: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x - 90,
        top: y - 40,
        width: 180,
        height: 80,
        borderRadius: 12,
        background: color.bg,
        border: `3px solid ${tone}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: mono,
        fontSize: 34,
        color: tone,
        opacity,
      }}
    >
      {label}
    </div>
  );
}

/** Position along a path of lane indices, with a move happening between each pair of times. */
function along(f: number, moves: { at: number; to: number }[], start: number) {
  let x = LANES[start].x;
  for (const m of moves) x += (LANES[m.to].x - x) * tween(f, m.at, m.at + 0.9, 0, 1, "inOut");
  return x;
}

export function ApprovalFlow() {
  const f = useCurrentFrame();
  const t = f / FPS;

  // rev-2: draft -> step 1 -> step 2 -> approved
  const rev2x = along(
    f,
    [
      { at: 4, to: 1 },
      { at: 7.2, to: 2 },
      { at: 14.4, to: 3 },
    ],
    0
  );
  const flipped = tween(f, 15.2, 15.8, 0, 1);

  // rev-3: appears at 17.4, goes to step 1, step 2, then is returned (drops down)
  const rev3x = along(
    f,
    [
      { at: 18.2, to: 1 },
      { at: 19.4, to: 2 },
    ],
    0
  );
  const rev3drop = tween(f, 21, 22, 0, 1, "inOut");
  const rev3y = LANE_Y + 30 + (RETURNED.y - LANE_Y - 30) * rev3drop;

  // Race at step 2: three decisions fly in; one sticks, two bounce with 409.
  // Each decision has its own lane above Step 2; the middle one wins, the outer two bounce back with 409.
  const race = (i: number) => {
    const at = 10.8 + i * 0.1;
    const p = tween(f, at, at + 0.7, 0, 1, "inOut");
    const back = i === 1 ? 0 : tween(f, at + 0.9, at + 1.5, 0, 1, "inOut");
    const x = 1190 + (i - 1) * 170;
    return { x, y: 250 + (380 - 250) * p - 90 * back, p, back };
  };
  const raceVisible = t >= 10.6 && t < 14.2;
  const checkStep1 = tween(f, 6.6, 7.1, 0, 1);
  const checkStep2 = tween(f, 13.6, 14.1, 0, 1);

  return (
    <Stage>
      <Chapter
        items={[
          { at: 0.3, text: "01 · The rule" },
          { at: 10.4, text: "02 · Races" },
          { at: 17.2, text: "03 · Returns" },
          { at: 23, text: "Tested in Go" },
        ]}
      />
      <div style={{ position: "absolute", left: 64, top: 100, fontFamily: serif, fontSize: 56, color: color.ink, ...useReveal(0.4, 22.6) }}>
        Readers get the approved revision. Always.
      </div>

      {/* Effective pointer */}
      <div style={{ position: "absolute", right: 64, top: 96, display: "flex", alignItems: "center", gap: 20, ...useReveal(1.2, 22.6) }}>
        <span style={{ fontFamily: sans, fontSize: 26, color: color.muted }}>Readers get</span>
        <div
          style={{
            fontFamily: mono,
            fontSize: 40,
            padding: "10px 26px",
            borderRadius: 12,
            border: `3px solid ${flipped > 0.5 ? color.accent : color.line}`,
            color: flipped > 0.5 ? color.accent : color.ink,
            background: flipped > 0.5 ? color.accentDim : color.surface,
            transform: `scale(${1 + 0.15 * Math.sin(Math.PI * flipped)})`,
          }}
        >
          {flipped > 0.5 ? "rev-2" : "rev-1"}
        </div>
      </div>

      <div style={useReveal(1.6, 22.6, 0)}>
        {LANES.map((l, i) => (
          <Lane key={l.title} {...l} glow={i === 3 ? flipped : 0} />
        ))}
        {/* arrows between lanes */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: LANES[i].x + 175,
              top: LANE_Y - 2,
              width: LANES[i + 1].x - LANES[i].x - 350,
              height: 4,
              background: color.line,
            }}
          />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: LANE_Y + 170,
          fontFamily: sans,
          fontSize: 28,
          color: color.muted,
          textAlign: "center",
          ...useReveal(7.4, 10.6),
        }}
      >
        Step 1 approved, step 2 pending: readers still get rev-1
      </div>

      {/* Step check marks */}
      <div
        style={{ position: "absolute", left: 760 - 22, top: LANE_Y + 70, fontSize: 48, color: color.accent, opacity: checkStep1 * (t < 17 ? 1 : 0) }}
      >
        ✓
      </div>
      <div
        style={{ position: "absolute", left: 1190 - 22, top: LANE_Y + 70, fontSize: 48, color: color.accent, opacity: checkStep2 * (t < 17 ? 1 : 0) }}
      >
        ✓
      </div>

      {/* rev-2 */}
      {t >= 2.4 && t < 17 && (
        <Card x={rev2x} y={LANE_Y + 10} label="rev-2" tone={t > 15.2 ? color.accent : color.ink} opacity={tween(f, 2.4, 3, 0, 1)} />
      )}

      {/* race */}
      {raceVisible &&
        [0, 1, 2].map((i) => {
          const r = race(i);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: r.x - 75,
                top: r.y - 26,
                width: 150,
                height: 52,
                borderRadius: 26,
                background: i === 1 ? color.accent : r.back > 0.3 ? color.warm : color.surface,
                border: `2px solid ${i === 1 ? color.accent : color.warm}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: mono,
                fontSize: 24,
                color: i === 1 || r.back > 0.3 ? color.bg : color.ink,
                opacity: r.p * (1 - tween(f, 13.4, 13.9, 0, 1)),
              }}
            >
              {i === 1 ? "200 ✓" : r.back > 0.3 ? "409" : "approve"}
            </div>
          );
        })}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 790,
          textAlign: "center",
          fontFamily: sans,
          fontSize: 32,
          color: color.ink,
          ...useReveal(12, 14),
        }}
      >
        Three approvals of the same step and version arrive at once: one commits, the others get 409
      </div>

      {/* rev-3 */}
      {t >= 17.4 && t < 22.6 && (
        <Card x={rev3x} y={rev3y} label="rev-3" tone={rev3drop > 0.2 ? color.warm : color.ink} opacity={tween(f, 17.4, 18, 0, 1)} />
      )}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: RETURNED.y + 70,
          textAlign: "center",
          fontFamily: sans,
          fontSize: 30,
          color: color.warm,
          ...useReveal(21.6, 22.6),
        }}
      >
        Returned at step 2 with a reason. Readers still get rev-2.
      </div>

      {/* End card */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", ...useReveal(23.2) }}>
        <div style={{ fontFamily: serif, fontSize: 64, color: color.ink }}>50 concurrent approvals of one step</div>
        <div style={{ fontFamily: mono, fontSize: 52, color: color.accent, marginTop: 28 }}>1 succeeds · 49 get 409</div>
        <div style={{ fontFamily: sans, fontSize: 30, color: color.muted, marginTop: 36 }}>
          Effective pointer moves only on the last approval, in the same transaction
        </div>
      </div>
    </Stage>
  );
}
