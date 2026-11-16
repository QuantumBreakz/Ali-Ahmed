import { useCurrentFrame } from "remotion";
import { Chapter, color, Count, FPS, mono, s, sans, serif, Stage, tween, useReveal } from "./theme";

export const BURN_DURATION = s(26);

const HOURS = 720; // 30 days
const CH = { x: 220, y: 230, w: 1440, h: 560 }; // chart box

function Line({ rate, xMax, drawn, tone, width = 4 }: { rate: number; xMax: number; drawn: number; tone: string; width?: number }) {
  const end = Math.min(drawn * xMax, xMax);
  const zero = HOURS / rate;
  const hs = Array.from({ length: 160 }, (_, i) => (end * i) / 159);
  if (zero < end) hs.push(zero);
  hs.sort((a, b) => a - b);
  const pts = hs.map((h) => `${CH.x + (h / xMax) * CH.w},${CH.y + (1 - Math.max(0, 1 - (rate * h) / HOURS)) * CH.h}`).join(" ");
  return <polyline points={pts} fill="none" stroke={tone} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" />;
}

export function BurnRate() {
  const f = useCurrentFrame();
  const t = f / FPS;

  // Act 1: the budget
  const budgetBar = tween(f, 3.2, 4.4, 0, 1, "inOut");
  // Act 2–3: the chart, then a zoom into the first hours
  const xMax = tween(f, 13, 14.8, HOURS, 60, "inOut");
  const slow = tween(f, 6.4, 8.4, 0, 1, "inOut");
  const fast = tween(f, 9.2, 10.2, 0, 1, "inOut");
  const chart = Math.min(tween(f, 5.6, 6.3, 0, 1), tween(f, 19.4, 19.9, 1, 0, "inOut"));
  const step = xMax > 200 ? 120 : 10;
  const ticks = Array.from({ length: Math.floor(xMax / step) + 1 }, (_, i) => i * step);
  const hourBand = tween(f, 15.2, 15.8, 0, 1);
  const xOf = (h: number) => CH.x + (h / xMax) * CH.w;
  const yOf = (frac: number) => CH.y + (1 - frac) * CH.h;
  const pager = tween(f, 16.9, 17.6, 0, 1);

  return (
    <Stage>
      <Chapter
        items={[
          { at: 0.4, text: "01 · The error budget" },
          { at: 5.8, text: "02 · Burn rate is speed" },
          { at: 13, text: "03 · Why 14.4 pages someone" },
          { at: 19.8, text: "04 · Fast burns page, slow burns ticket" },
        ]}
      />

      {/* Act 1 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", ...useReveal(0.3, 5.2) }}>
        <div style={{ fontFamily: serif, fontSize: 168, lineHeight: 1 }}>99.9%</div>
        <div style={{ fontFamily: sans, fontSize: 34, color: color.muted, marginTop: 18 }}>availability target over 30 days</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 580, textAlign: "center", fontFamily: mono, fontSize: 44, ...useReveal(1.8, 5.2) }}>
        <span style={{ color: color.muted }}>30 days × 0.1% = </span>
        <span style={{ color: color.accent }}>
          <Count to={43.2} a={2.2} b={3.4} decimals={1} /> minutes
        </span>
      </div>
      <div style={{ position: "absolute", left: 360, width: 1200, top: 700, ...useReveal(3, 5.2, 0) }}>
        <div style={{ height: 28, borderRadius: 6, background: color.line, overflow: "hidden" }}>
          <div style={{ width: `${budgetBar * 100}%`, height: "100%", background: color.accent }} />
        </div>
        <div style={{ fontFamily: mono, fontSize: 22, color: color.muted, marginTop: 14 }}>the whole month's error budget</div>
      </div>

      {/* Act 2–3: chart */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: chart }}>
        {[0, 0.5, 1].map((g) => (
          <g key={g}>
            <line x1={CH.x} x2={CH.x + CH.w} y1={yOf(g)} y2={yOf(g)} stroke={color.line} strokeWidth={1.5} />
            <text x={CH.x - 24} y={yOf(g) + 8} textAnchor="end" fontFamily={mono} fontSize={22} fill={color.muted}>
              {g * 100}%
            </text>
          </g>
        ))}
        <text x={CH.x} y={CH.y - 30} fontFamily={mono} fontSize={20} fill={color.muted} letterSpacing={2}>
          BUDGET REMAINING
        </text>
        {ticks.map((h) => (
          <text key={h} x={xOf(h)} y={CH.y + CH.h + 44} textAnchor="middle" fontFamily={mono} fontSize={22} fill={color.muted}>
            {step === 120 ? `day ${h / 24}` : `${h}h`}
          </text>
        ))}
        {/* first-hour band */}
        <rect x={xOf(0)} y={CH.y} width={(xOf(1) - xOf(0)) * hourBand} height={CH.h} fill={color.warmDim} />
        <Line rate={1} xMax={xMax} drawn={slow * (HOURS / xMax)} tone={color.accent} />
        <Line rate={14.4} xMax={xMax} drawn={fast * (HOURS / xMax)} tone={color.warm} width={5} />
        {/* the 98% reading after one hour */}
        <g opacity={tween(f, 15.6, 16.2, 0, 1)}>
          <circle cx={xOf(1)} cy={yOf(0.98)} r={9} fill={color.warm} />
          <line x1={xOf(1)} x2={xOf(1) + 90} y1={yOf(0.98)} y2={yOf(0.98) + 70} stroke={color.warm} strokeWidth={2} />
        </g>
      </svg>
      <div style={{ position: "absolute", left: 980, top: 300, fontFamily: sans, fontSize: 28, color: color.accent, ...useReveal(8.2, 12.8) }}>
        burn rate 1 · lasts exactly 30 days
      </div>
      <div style={{ position: "absolute", left: 340, top: 560, fontFamily: sans, fontSize: 28, color: color.warm, ...useReveal(10, 12.8) }}>
        burn rate 14.4 · empty after 50 hours
      </div>
      <div style={{ position: "absolute", left: 1000, top: 300, width: 640, ...useReveal(16, 19.4) }}>
        <div style={{ fontFamily: serif, fontSize: 46, lineHeight: 1.25 }}>
          One hour at 14.4× spends <span style={{ color: color.warm }}>2%</span> of the month's budget.
        </div>
        <div style={{ fontFamily: mono, fontSize: 26, color: color.muted, marginTop: 18 }}>14.4 × 1 h ÷ 720 h = 0.02</div>
      </div>
      {/* pager */}
      <div
        style={{
          position: "absolute",
          right: 80,
          top: 96,
          width: 520,
          padding: "22px 26px",
          borderRadius: 16,
          background: color.surface,
          border: `1px solid ${color.line}`,
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          opacity: pager * tween(f, 19.4, 19.9, 1, 0),
          transform: `translateY(${(1 - pager) * -40}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: mono, fontSize: 18, letterSpacing: 2, color: color.warm }}>
          <span style={{ width: 12, height: 12, borderRadius: 99, background: color.warm, opacity: Math.round(t * 2) % 2 ? 1 : 0.35 }} />
          PAGE · CHECKOUT-API
        </div>
        <div style={{ fontFamily: sans, fontSize: 26, marginTop: 10 }}>Burn rate 14.4 over the last hour</div>
        <div style={{ fontFamily: sans, fontSize: 22, marginTop: 6, color: color.muted }}>2% of the 30-day error budget used</div>
      </div>

      {/* Act 4: the rules */}
      <div style={{ position: "absolute", left: 260, top: 260, width: 1400 }}>
        {[
          { rate: "14.4×", window: "over 1 hour", used: "2%", action: "Page", tone: color.warm, at: 20.2 },
          { rate: "6×", window: "over 6 hours", used: "5%", action: "Page", tone: color.warm, at: 20.6 },
          { rate: "1×", window: "over 3 days", used: "10%", action: "Ticket", tone: color.accent, at: 21 },
        ].map((r) => (
          <Rule key={r.rate} {...r} />
        ))}
        <div style={{ fontFamily: serif, fontSize: 44, fontStyle: "italic", color: color.muted, marginTop: 56, ...useReveal(22.4) }}>
          The short window catches outages. The long one catches slow leaks.
        </div>
      </div>
    </Stage>
  );
}

function Rule({ rate, window, used, action, tone, at }: { rate: string; window: string; used: string; action: string; tone: string; at: number }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", padding: "26px 0", borderBottom: `1px solid ${color.line}`, ...useReveal(at) }}>
      <div style={{ width: 260, fontFamily: serif, fontSize: 72, color: tone }}>{rate}</div>
      <div style={{ width: 420, fontFamily: sans, fontSize: 34, color: color.ink }}>{window}</div>
      <div style={{ width: 420, fontFamily: mono, fontSize: 30, color: color.muted }}>{used} of budget</div>
      <div style={{ fontFamily: mono, fontSize: 30, letterSpacing: 3, color: tone }}>{action.toUpperCase()}</div>
    </div>
  );
}
