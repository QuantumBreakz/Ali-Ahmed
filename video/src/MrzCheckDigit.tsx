import { useCurrentFrame } from "remotion";
import { CARD, CW, MRZ2, MRZ_LEFT, MRZ_SIZE, MRZ_TOP, Passport } from "./Passport";
import { Chapter, color, FPS, H, mono, s, sans, serif, Stage, tween, useReveal, W } from "./theme";

export const MRZ_DURATION = s(27);

const WEIGHTS = [7, 3, 1];
const value = (c: string) => (/\d/.test(c) ? Number(c) : /[A-Z]/.test(c) ? c.charCodeAt(0) - 55 : 0);
const cols = [...MRZ2.slice(0, 9)].map((c, i) => ({ c, v: value(c), w: WEIGHTS[i % 3], p: value(c) * WEIGHTS[i % 3], letter: /[A-Z]/.test(c) }));
const cumulative = cols.map((_, i) => cols.slice(0, i + 1).reduce((sum, col) => sum + col.p, 0));
const total = cumulative[8]; // 316
const digit = total % 10; // 6

// Card and camera
const CX = (W - CARD.w) / 2;
const CY = (H - CARD.h) / 2;
const ZOOM = 2.3;
const FOCUS = { x: CX + 840 / ZOOM, y: CY + MRZ_TOP[1] + 20 };
// Column grid for the calculation
const colX = (i: number) => 344 + i * 154 + 70;
const ROW = { char: 300, value: 440, weight: 565, product: 690 };

const centered = (x: number, y: number) => ({ position: "absolute" as const, left: x, top: y, transform: "translate(-50%, -50%)" });

function RowLabel({ y, text, at }: { y: number; text: string; at: number }) {
  return (
    <div style={{ position: "absolute", left: 64, top: y - 14, fontFamily: mono, fontSize: 20, letterSpacing: 2, color: color.muted, ...useReveal(at, 18.3, 0) }}>
      {text}
    </div>
  );
}

function Cell({ i, y, at, children, tint }: { i: number; y: number; at: number; children: React.ReactNode; tint?: string }) {
  const f = useCurrentFrame();
  const p = tween(f, at + i * 0.08, at + i * 0.08 + 0.6, 0, 1);
  const out = tween(f, 18.3, 18.8, 1, 0, "inOut");
  return (
    <div style={{ ...centered(colX(i), y), fontFamily: mono, fontSize: 60, color: tint ?? color.ink, opacity: p * out, marginTop: (1 - p) * 20 }}>
      {children}
    </div>
  );
}

export function MrzCheckDigit() {
  const f = useCurrentFrame();
  const t = f / FPS;

  // Act 1: the card arrives, gets scanned, and the camera pushes in on line two.
  const cardIn = tween(f, 0, 1.1, 0, 1);
  const zoom = tween(f, 3, 4.8, 1, ZOOM, "inOut");
  const zp = (zoom - 1) / (ZOOM - 1);
  const fx = W / 2 + (FOCUS.x - W / 2) * zp;
  const fy = H / 2 + (FOCUS.y - H / 2) * zp;
  const scan = tween(f, 1.3, 2.9, 0, 1, "inOut");
  const docHi = tween(f, 4.9, 5.7, 0, 1);
  const checkHi = tween(f, 5.8, 6.4, 0, 1);
  const cardFade = tween(f, 7, 8, 1, 0, "inOut");
  const lineY = CY + MRZ_TOP[1];

  // Act 2: characters fly from the MRZ into columns.
  const fly = (i: number) => tween(f, 7 + i * 0.05, 8.3 + i * 0.05, 0, 1, "inOut");
  const glyphFrom = (i: number) => ({
    x: W / 2 + ZOOM * (CX + MRZ_LEFT + (i + 0.5) * CW - FOCUS.x),
    y: H / 2 + ZOOM * (lineY + 19 - FOCUS.y),
  });

  // Act 3: running sum, one column at a time.
  const sumStep = Math.floor(tween(f, 14.6, 16.6, 0, 9));
  const sumShown = sumStep === 0 ? 0 : cumulative[Math.min(sumStep, 9) - 1];
  const modIn = tween(f, 17, 17.6, 0, 1);

  // Act 4: the computed digit lands on the printed one.
  const land = tween(f, 19.6, 20.6, 0, 1, "inOut");
  const sixX = 1100 + (1248 - 1100) * land;
  const sixY = 860 + (480 - 860) * land;
  const matched = t >= 20.6;

  return (
    <Stage>
      <Chapter
        items={[
          { at: 0.5, text: "ICAO 9303 · specimen passport" },
          { at: 3.2, text: "01 · The machine-readable zone" },
          { at: 7.4, text: "02 · Characters become numbers" },
          { at: 10.4, text: "03 · Weights repeat 7, 3, 1" },
          { at: 12.9, text: "04 · Multiply and add" },
          { at: 18.8, text: "05 · Compare with the printed digit" },
        ]}
      />

      {/* camera */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "0 0",
          transform: `translate(${W / 2}px, ${H / 2}px) scale(${zoom}) translate(${-fx}px, ${-fy}px)`,
          opacity: cardFade,
        }}
      >
        <div style={{ position: "absolute", left: CX, top: CY, width: CARD.w, height: CARD.h, perspective: 1600 }}>
          <Passport
            style={{
              transform: `translateY(${(1 - cardIn) * 80}px) rotateX(${(1 - cardIn) * 24}deg)`,
              opacity: cardIn,
            }}
          />
          {/* scan line */}
          <div
            style={{
              position: "absolute",
              left: -20,
              right: -20,
              top: scan * CARD.h,
              height: 3,
              background: color.accent,
              boxShadow: `0 0 24px 6px ${color.accentDim}, 0 -60px 60px -20px ${color.accentDim}`,
              opacity: scan > 0 && scan < 1 ? 1 : 0,
            }}
          />
          {/* highlights on line two */}
          <div
            style={{
              position: "absolute",
              left: MRZ_LEFT - 2,
              top: MRZ_TOP[1] - 4,
              width: 9 * CW * docHi + 4,
              height: 46,
              border: `2px solid ${color.accent}`,
              background: "rgba(8,127,117,0.12)",
              borderRadius: 6,
              opacity: docHi > 0 ? 1 : 0,
            }}
          />
          <div style={{ position: "absolute", left: MRZ_LEFT, top: MRZ_TOP[1] - 30, fontFamily: sans, fontSize: 13, letterSpacing: 1, color: "#087f75", fontWeight: 600, opacity: docHi }}>
            DOCUMENT NUMBER
          </div>
          <div
            style={{
              position: "absolute",
              left: MRZ_LEFT + 9 * CW,
              top: MRZ_TOP[1] - 4,
              width: CW,
              height: 46,
              border: `2px solid #b5492f`,
              background: "rgba(161,63,42,0.12)",
              borderRadius: 6,
              opacity: checkHi,
              transform: `scale(${1.4 - 0.4 * checkHi})`,
            }}
          />
          <div style={{ position: "absolute", left: MRZ_LEFT + 9 * CW - 20, top: MRZ_TOP[1] + 50, fontFamily: sans, fontSize: 13, letterSpacing: 1, color: "#a13f2a", fontWeight: 600, opacity: checkHi }}>
            CHECK DIGIT
          </div>
        </div>
      </div>

      {/* flying characters → char row */}
      {t >= 7 &&
        cols.map((col, i) => {
          const p = fly(i);
          const from = glyphFrom(i);
          const out = tween(f, 18.3, 18.8, 1, 0, "inOut");
          return (
            <div
              key={i}
              style={{
                ...centered(from.x + (colX(i) - from.x) * p, from.y + (ROW.char - from.y) * p),
                fontFamily: mono,
                fontSize: MRZ_SIZE * ZOOM + (88 - MRZ_SIZE * ZOOM) * p,
                color: p < 0.05 ? color.paperInk : color.ink,
                opacity: out,
              }}
            >
              {col.c}
            </div>
          );
        })}

      <RowLabel y={ROW.char} text="CHAR" at={8.2} />
      <RowLabel y={ROW.value} text="VALUE" at={8.6} />
      <RowLabel y={ROW.weight} text="WEIGHT" at={10.6} />
      <RowLabel y={ROW.product} text="PRODUCT" at={13} />
      {cols.map((col, i) => (
        <Cell key={`v${i}`} i={i} y={ROW.value} at={8.6} tint={col.letter ? color.accent : undefined}>
          {col.v}
        </Cell>
      ))}
      {cols.map((col, i) => (
        <Cell key={`w${i}`} i={i} y={ROW.weight} at={10.6} tint={color.accent}>
          <span style={{ fontSize: 44 }}>×{col.w}</span>
        </Cell>
      ))}
      {/* triple brackets under the weights */}
      {[0, 3, 6].map((start, g) => {
        const p = tween(f, 11.6 + g * 0.15, 12.3 + g * 0.15, 0, 1);
        const left = colX(start) - 60;
        const width = colX(start + 2) - colX(start) + 120;
        return (
          <div
            key={g}
            style={{
              position: "absolute",
              left,
              top: ROW.weight + 44,
              width: width * p,
              height: 12,
              borderLeft: `2px solid ${color.accent}`,
              borderRight: p > 0.98 ? `2px solid ${color.accent}` : "none",
              borderBottom: `2px solid ${color.accent}`,
              opacity: (p > 0 ? 0.7 : 0) * tween(f, 18.3, 18.8, 1, 0),
            }}
          />
        );
      })}
      {cols.map((col, i) => (
        <Cell key={`p${i}`} i={i} y={ROW.product} at={13} tint={sumStep > i ? color.warm : undefined}>
          {col.p}
        </Cell>
      ))}

      {/* sum and mod */}
      <div
        style={{
          position: "absolute",
          right: W - 1040,
          top: 860 - 40,
          fontFamily: mono,
          fontSize: 64,
          color: color.ink,
          whiteSpace: "nowrap",
          ...useReveal(14.4, 18.3, 10),
        }}
      >
        <span style={{ color: color.muted }}>Σ </span>
        {sumShown}
        <span style={{ color: color.muted, opacity: modIn }}> mod 10 =</span>
      </div>
      <div
        style={{
          ...centered(sixX, sixY),
          fontFamily: mono,
          fontSize: 120 - 24 * land,
          fontWeight: 600,
          color: matched ? color.accent : color.warm,
          opacity: modIn * (t > 23.4 ? tween(f, 23.4, 23.9, 1, 0) : 1),
        }}
      >
        {digit}
      </div>

      {/* Act 4: printed line */}
      <div style={{ position: "absolute", left: 640, top: 480 - 60, display: "flex", fontFamily: mono, fontSize: 96, ...useReveal(18.9, 23.4, 0) }}>
        {[...MRZ2.slice(0, 10)].map((c, i) => (
          <span key={i} style={{ width: 64, textAlign: "center", color: i === 9 ? (matched ? color.accent : color.muted) : color.ink, opacity: i === 9 && land > 0.7 ? 0 : 1 }}>
            {c}
          </span>
        ))}
        <div
          style={{
            position: "absolute",
            left: 9 * 64 - 6,
            top: -6,
            width: 76,
            height: 132,
            border: `3px solid ${matched ? color.accent : color.warm}`,
            borderRadius: 10,
          }}
        />
        <div style={{ position: "absolute", left: 9 * 64 - 20, top: -52, fontFamily: sans, fontSize: 22, letterSpacing: 2, color: color.muted }}>PRINTED</div>
      </div>
      <div style={{ ...centered(1248, 640), fontFamily: sans, fontSize: 30, color: color.accent, whiteSpace: "nowrap", ...useReveal(20.7, 23.4, 8) }}>
        ✓ match
      </div>

      {/* closing line */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", ...useReveal(23.8) }}>
        <div style={{ fontFamily: serif, fontSize: 68, lineHeight: 1.2 }}>Misread one character,</div>
        <div style={{ fontFamily: serif, fontSize: 68, lineHeight: 1.2, color: color.warm, fontStyle: "italic" }}>and the digit stops matching.</div>
      </div>
    </Stage>
  );
}
