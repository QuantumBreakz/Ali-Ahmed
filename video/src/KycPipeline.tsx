import type { ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { CARD, CW, MRZ_LEFT, MRZ_TOP, Passport, valueBox } from "./Passport";
import { Chapter, color, FPS, mono, s, sans, serif, Stage, tween, useReveal } from "./theme";

const STAGES = [
  { name: "Capture", q: "Is the photo usable?", at: 1.5 },
  { name: "Classify", q: "Which document is it?", at: 5 },
  { name: "Read", q: "OCR plus MRZ check digits", at: 8.5 },
  { name: "Authenticity", q: "Is the document genuine?", at: 12.5 },
  { name: "Face match", q: "Same person as the photo?", at: 16 },
  { name: "Liveness", q: "A live person, not a replay?", at: 20 },
  { name: "Decision", q: "Approve, review or reject", at: 23.5 },
];
export const KYC_DURATION = s(30);

const STAGE_CX = 620; // centre of the visual area (left side)
const STAGE_CY = 560;
const OCR_FIELDS = [2, 3, 4, 6, 8]; // surname, given names, number, birth, expiry

function Chip({ at, out, children, tone = color.accent }: { at: number; out?: number; children: ReactNode; tone?: string }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 18px",
        border: `1.5px solid ${tone}`,
        borderRadius: 999,
        fontFamily: mono,
        fontSize: 22,
        color: tone,
        background: "rgba(0,0,0,0.25)",
        ...useReveal(at, out, 10),
      }}
    >
      {children}
    </div>
  );
}

function Silhouette({ size, fill }: { size: number; fill: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 240 240">
      <circle cx={120} cy={96} r={46} fill={fill} />
      <path d="M36 240 C 44 170, 86 150, 120 150 C 154 150, 196 170, 204 240 Z" fill={fill} />
    </svg>
  );
}

function StageList() {
  const t = useCurrentFrame() / FPS;
  const active = STAGES.filter((st) => t >= st.at).length - 1;
  const railP = tween(useCurrentFrame(), 1.5, 23.5, 0, 1, "inOut");
  return (
    <div style={{ position: "absolute", left: 1290, top: 190, width: 560, ...useReveal(0.6) }}>
      <div style={{ position: "absolute", left: 13, top: 16, width: 2, height: 6 * 104, background: color.line }} />
      <div style={{ position: "absolute", left: 13, top: 16, width: 2, height: 6 * 104 * railP, background: color.accent }} />
      {STAGES.map((st, i) => {
        const isActive = i === active;
        const done = i < active;
        return (
          <div key={st.name} style={{ position: "relative", height: 104, paddingLeft: 56 }}>
            <div
              style={{
                position: "absolute",
                left: 4,
                top: 8,
                width: 20,
                height: 20,
                borderRadius: 999,
                background: isActive || done ? color.accent : color.bg,
                border: `2px solid ${isActive || done ? color.accent : color.faint}`,
                boxShadow: isActive ? `0 0 0 8px ${color.accentDim}` : "none",
              }}
            />
            <div style={{ fontFamily: serif, fontSize: 40, lineHeight: 1, color: isActive ? color.ink : done ? color.muted : color.faint }}>{st.name}</div>
            <div style={{ fontFamily: sans, fontSize: 22, marginTop: 10, color: color.muted, opacity: isActive ? 1 : 0 }}>{st.q}</div>
          </div>
        );
      })}
    </div>
  );
}

export function KycPipeline() {
  const f = useCurrentFrame();
  const t = f / FPS;

  // The passport: tilted and soft at capture, flattened by classification, then moved aside for the face match.
  const flat = tween(f, 5.2, 6.4, 0, 1, "inOut");
  const blur = tween(f, 1.6, 3, 7, 0);
  const sc = tween(f, 16, 16.8, 0.6, 0.42, "inOut");
  const cx = tween(f, 16, 16.8, STAGE_CX, 330, "inOut");
  const cardOpacity = Math.min(tween(f, 0.3, 1.3, 0, 1), tween(f, 20, 20.6, 1, 0, "inOut"));
  const shimmer = tween(f, 12.8, 14.4, -0.4, 1.4, "inOut");

  // Selfie: appears for the face match, then centres for liveness.
  const selfieIn = tween(f, 16.4, 17.2, 0, 1);
  const selfieX = tween(f, 20, 20.8, 900, STAGE_CX, "inOut");
  const selfieR = tween(f, 20, 20.8, 140, 190, "inOut");
  const selfieOut = tween(f, 23.3, 23.8, 1, 0, "inOut");
  const score = tween(f, 17.4, 18.8, 0, 0.91, "inOut");

  return (
    <Stage>
      <Chapter items={[{ at: 0.4, text: "How online KYC verification works" }]} />
      <StageList />

      {/* viewfinder guide during capture */}
      <div style={{ position: "absolute", left: STAGE_CX - 370, top: STAGE_CY - 250, width: 740, height: 500, ...useReveal(1.4, 5.2, 0) }}>
        {[
          { left: 0, top: 0, bl: 1, bt: 1 },
          { right: 0, top: 0, br: 1, bt: 1 },
          { left: 0, bottom: 0, bl: 1, bb: 1 },
          { right: 0, bottom: 0, br: 1, bb: 1 },
        ].map((c, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 56,
              height: 56,
              left: c.left,
              right: c.right,
              top: c.top,
              bottom: c.bottom,
              borderLeft: c.bl ? `4px solid ${t > 3.8 ? color.accent : color.ink}` : undefined,
              borderRight: c.br ? `4px solid ${t > 3.8 ? color.accent : color.ink}` : undefined,
              borderTop: c.bt ? `4px solid ${t > 3.8 ? color.accent : color.ink}` : undefined,
              borderBottom: c.bb ? `4px solid ${t > 3.8 ? color.accent : color.ink}` : undefined,
            }}
          />
        ))}
      </div>

      {/* the passport, with its overlays in card coordinates */}
      <div
        style={{
          position: "absolute",
          left: cx - (CARD.w * sc) / 2,
          top: STAGE_CY - (CARD.h * sc) / 2,
          width: CARD.w,
          height: CARD.h,
          transformOrigin: "0 0",
          transform: `scale(${sc})`,
          opacity: cardOpacity,
          perspective: 1800,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `rotateX(${28 * (1 - flat)}deg) rotateY(${-18 * (1 - flat)}deg) rotateZ(${5 * (1 - flat)}deg)`,
            filter: `blur(${blur}px)`,
          }}
        >
          <Passport />
          {/* authenticity sweep */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 22,
              background: `linear-gradient(105deg, transparent ${shimmer * 100 - 12}%, rgba(121,201,188,0.45) ${shimmer * 100}%, transparent ${shimmer * 100 + 12}%)`,
              mixBlendMode: "multiply",
            }}
          />
          {/* OCR boxes */}
          {OCR_FIELDS.map((fi, k) => {
            const b = valueBox(fi);
            const p = tween(f, 8.7 + k * 0.35, 9.2 + k * 0.35, 0, 1);
            return (
              <div
                key={fi}
                style={{
                  position: "absolute",
                  left: b.x,
                  top: b.y,
                  width: b.w,
                  height: b.h,
                  border: "3px solid #087f75",
                  background: "rgba(8,127,117,0.10)",
                  borderRadius: 6,
                  opacity: p * tween(f, 12.4, 12.8, 1, 0),
                  transform: `scale(${1.15 - 0.15 * p})`,
                }}
              />
            );
          })}
          {[0, 1].map((line) => {
            const p = tween(f, 10.6 + line * 0.3, 11.3 + line * 0.3, 0, 1);
            return (
              <div
                key={line}
                style={{
                  position: "absolute",
                  left: MRZ_LEFT - 4,
                  top: MRZ_TOP[line] - 4,
                  width: (44 * CW + 8) * p,
                  height: 46,
                  border: "3px solid #087f75",
                  background: "rgba(8,127,117,0.10)",
                  borderRadius: 6,
                  opacity: tween(f, 12.4, 12.8, 1, 0) * (p > 0 ? 1 : 0),
                }}
              />
            );
          })}
        </div>
      </div>

      {/* stage readouts under the card */}
      <div style={{ position: "absolute", left: 0, width: STAGE_CX * 2, top: STAGE_CY + 250, display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
        {t < 5.2 && (
          <>
            <Chip at={2.9} out={4.9}>✓ in focus</Chip>
            <Chip at={3.3} out={4.9}>✓ no glare</Chip>
            <Chip at={3.7} out={4.9}>✓ all corners</Chip>
          </>
        )}
        {t >= 5.2 && t < 8.6 && (
          <>
            <Chip at={6.4} out={8.3} tone={color.muted}>perspective corrected</Chip>
            <Chip at={6.9} out={8.3}>passport · TD3 · 0.98</Chip>
          </>
        )}
        {t >= 8.6 && t < 12.6 && (
          <>
            <Chip at={9.4} out={12.3} tone={color.muted}>5 fields read</Chip>
            <Chip at={11.6} out={12.3}>✓ MRZ check digits 4/4</Chip>
          </>
        )}
        {t >= 12.6 && t < 16 && (
          <>
            <Chip at={13.2} out={15.7}>✓ fonts match template</Chip>
            <Chip at={13.7} out={15.7}>✓ portrait untouched</Chip>
            <Chip at={14.2} out={15.7}>✓ not a screen</Chip>
          </>
        )}
      </div>

      {/* selfie */}
      <div
        style={{
          position: "absolute",
          left: selfieX - selfieR,
          top: STAGE_CY - selfieR,
          width: selfieR * 2,
          height: selfieR * 2,
          borderRadius: 999,
          overflow: "hidden",
          background: "radial-gradient(circle at 40% 35%, #3a3d41, #232527)",
          border: `3px solid ${t > 18.8 ? color.accent : color.line}`,
          opacity: selfieIn * selfieOut,
          transform: `scale(${0.85 + 0.15 * selfieIn})`,
        }}
      >
        <div style={{ position: "absolute", left: "50%", top: "56%", transform: "translate(-50%, -50%)" }}>
          <Silhouette size={selfieR * 2} fill="#6c7076" />
        </div>
      </div>
      {/* liveness pulses */}
      {t > 20.8 &&
        t < 23.8 &&
        [0, 1, 2].map((k) => {
          const phase = ((t - 20.8 + k * 0.5) % 1.5) / 1.5;
          return (
            <div
              key={k}
              style={{
                position: "absolute",
                left: STAGE_CX - 190 - phase * 120,
                top: STAGE_CY - 190 - phase * 120,
                width: 380 + phase * 240,
                height: 380 + phase * 240,
                borderRadius: 999,
                border: `2px solid ${color.accent}`,
                opacity: (1 - phase) * 0.6 * selfieOut,
              }}
            />
          );
        })}

      {/* face match meter */}
      <div style={{ position: "absolute", left: 470, top: STAGE_CY + 210, width: 560, ...useReveal(17.2, 19.8, 10) }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: mono, fontSize: 22, color: color.muted }}>
          <span>similarity</span>
          <span style={{ color: score >= 0.8 ? color.accent : color.ink, fontSize: 34 }}>{score.toFixed(2)}</span>
        </div>
        <div style={{ position: "relative", marginTop: 14, height: 10, borderRadius: 99, background: color.line }}>
          <div style={{ width: `${score * 100}%`, height: "100%", borderRadius: 99, background: score >= 0.8 ? color.accent : color.muted }} />
          <div style={{ position: "absolute", left: "80%", top: -10, width: 2, height: 30, background: color.warm }} />
          <div style={{ position: "absolute", left: "80%", top: 28, transform: "translateX(-50%)", fontFamily: mono, fontSize: 18, color: color.warm }}>threshold 0.80</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, width: STAGE_CX * 2, top: STAGE_CY + 250, display: "flex", justifyContent: "center", gap: 16 }}>
        {t > 20.6 && t < 23.6 && (
          <>
            <Chip at={21.2} out={23.2}>✓ no replay</Chip>
            <Chip at={21.6} out={23.2}>✓ no mask</Chip>
            <Chip at={22} out={23.2}>✓ no injected video</Chip>
          </>
        )}
      </div>

      {/* decision */}
      <div style={{ position: "absolute", left: 110, top: 330, width: 1020, display: "flex", gap: 24 }}>
        {[
          { label: "Approve", note: "all checks passed", tone: color.accent, lit: true, at: 23.9 },
          { label: "Human review", note: "a check is unsure", tone: color.muted, lit: false, at: 24.1 },
          { label: "Reject", note: "with a reason", tone: color.warm, lit: false, at: 24.3 },
        ].map((d) => (
          <div
            key={d.label}
            style={{
              flex: 1,
              padding: "34px 30px",
              borderRadius: 18,
              border: `2px solid ${d.lit ? d.tone : color.line}`,
              background: d.lit ? color.accentDim : color.surface,
              ...useReveal(d.at),
            }}
          >
            <div style={{ fontFamily: serif, fontSize: 40, whiteSpace: "nowrap", color: d.lit ? d.tone : color.ink }}>{d.label}</div>
            <div style={{ fontFamily: sans, fontSize: 24, marginTop: 10, color: color.muted }}>{d.note}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 110, top: 610, width: 1040, ...useReveal(25.6) }}>
        <div style={{ fontFamily: serif, fontSize: 56, lineHeight: 1.2 }}>Every rejection carries a reason</div>
        <div style={{ fontFamily: serif, fontSize: 56, lineHeight: 1.2, fontStyle: "italic", color: color.warm }}>someone can act on.</div>
        <div style={{ fontFamily: mono, fontSize: 24, marginTop: 28, color: color.muted, ...useReveal(26.8) }}>
          “document expired” · “face mismatch” · “photo too blurry”
        </div>
      </div>
    </Stage>
  );
}
