import type { CSSProperties } from "react";
import { color, mono, sans, serif } from "./theme";

// ICAO 9303's own specimen data page (fictional state "Utopia"), drawn at 1040 × 680.
export const CARD = { w: 1040, h: 680 };
export const MRZ1 = "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<";
export const MRZ2 = "L898902C36UTO7408122F1204159ZE184226B<<<<<10";
export const CW = 21.8; // MRZ character cell width: 44 cells across 960 px
export const MRZ_LEFT = 40;
export const MRZ_TOP = [516, 580];
export const MRZ_SIZE = 32;

export const FIELDS = [
  { label: "Type", value: "P", x: 320, y: 96 },
  { label: "Code", value: "UTO", x: 420, y: 96 },
  { label: "Surname", value: "ERIKSSON", x: 320, y: 170 },
  { label: "Given names", value: "ANNA MARIA", x: 320, y: 244 },
  { label: "Passport No.", value: "L898902C3", x: 320, y: 318 },
  { label: "Nationality", value: "UTOPIAN", x: 680, y: 318 },
  { label: "Date of birth", value: "12 AUG 1974", x: 320, y: 392 },
  { label: "Sex", value: "F", x: 580, y: 392 },
  { label: "Date of expiry", value: "15 APR 2012", x: 680, y: 392 },
];
const VALUE_SIZE = 26;
/** Bounding box of a field's value, for OCR boxes drawn over the card. */
export const valueBox = (i: number) => {
  const f = FIELDS[i];
  return { x: f.x - 8, y: f.y + 22, w: f.value.length * VALUE_SIZE * 0.6 + 16, h: 40 };
};

function MrzLine({ text, top }: { text: string; top: number }) {
  return (
    <div style={{ position: "absolute", left: MRZ_LEFT, top, display: "flex", fontFamily: mono, fontSize: MRZ_SIZE, color: color.paperInk }}>
      {[...text].map((c, i) => (
        <span key={i} style={{ width: CW, textAlign: "center" }}>
          {c}
        </span>
      ))}
    </div>
  );
}

export function Passport({ style, mrzDim = 0 }: { style?: CSSProperties; mrzDim?: number }) {
  return (
    <div
      style={{
        position: "absolute",
        width: CARD.w,
        height: CARD.h,
        borderRadius: 22,
        background: `linear-gradient(135deg, ${color.paper}, #e2dbc9)`,
        boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
        overflow: "hidden",
        color: color.paperInk,
        ...style,
      }}
    >
      {/* guilloche-style background lines */}
      <svg width={CARD.w} height={CARD.h} style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
        {Array.from({ length: 14 }, (_, i) => (
          <ellipse key={i} cx={780} cy={180} rx={120 + i * 26} ry={60 + i * 15} fill="none" stroke={color.paperLine} strokeWidth={1} />
        ))}
      </svg>
      <div style={{ position: "absolute", left: 40, top: 30, fontFamily: serif, fontSize: 30, letterSpacing: 6 }}>PASSPORT</div>
      <div style={{ position: "absolute", right: 40, top: 34, fontFamily: sans, fontSize: 20, letterSpacing: 4, color: color.paperMuted }}>
        UTOPIA · SPECIMEN
      </div>
      <div style={{ position: "absolute", left: 40, top: 96, width: 240, height: 300, borderRadius: 10, background: "#d6cdb8", overflow: "hidden" }}>
        <svg width={240} height={300}>
          <circle cx={120} cy={118} r={56} fill="#b4a990" />
          <path d="M20 300 C 30 210, 80 186, 120 186 C 160 186, 210 210, 220 300 Z" fill="#b4a990" />
        </svg>
      </div>
      {FIELDS.map((f) => (
        <div key={f.label} style={{ position: "absolute", left: f.x, top: f.y }}>
          <div style={{ fontFamily: sans, fontSize: 15, letterSpacing: 1.5, textTransform: "uppercase", color: color.paperMuted }}>{f.label}</div>
          <div style={{ fontFamily: mono, fontSize: VALUE_SIZE, marginTop: 4 }}>{f.value}</div>
        </div>
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 488, bottom: 0, background: "rgba(255,255,255,0.35)", borderTop: `1px solid ${color.paperLine}` }} />
      <div style={{ opacity: 1 - mrzDim }}>
        <MrzLine text={MRZ1} top={MRZ_TOP[0]} />
        <MrzLine text={MRZ2} top={MRZ_TOP[1]} />
      </div>
    </div>
  );
}
