// Still figures for blog posts, rendered with `npm run figures`. Each one shows the article's central result,
// using the numbers from that article's tested code. 1600x900, the site's dark theme.
import type { ReactNode } from "react";
import { Stage, color, mono, serif, sans } from "./theme";

export const FIG_W = 1600;
export const FIG_H = 900;

function Frame({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
  return (
    <Stage>
      <div style={{ position: "absolute", left: 72, top: 56, right: 72 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: mono,
            fontSize: 20,
            letterSpacing: 3,
            color: color.muted,
            textTransform: "uppercase",
          }}
        >
          <span style={{ width: 28, height: 2, background: color.accent }} />
          {kicker}
        </div>
        <div style={{ marginTop: 14, fontFamily: serif, fontSize: 50, lineHeight: 1.12, color: color.ink }}>{title}</div>
      </div>
      <div style={{ position: "absolute", left: 72, right: 72, top: 230, bottom: 90 }}>{children}</div>
    </Stage>
  );
}

const Tick = () => <span style={{ color: color.accent, fontWeight: 700 }}>✓</span>;
const Cross = () => <span style={{ color: color.warm, fontWeight: 700 }}>✗</span>;
const Partial = () => <span style={{ color: color.muted, fontWeight: 700 }}>~</span>;

/* 1. OCR vs NFC ----------------------------------------------------------------------------------------- */
export function FigOcrVsNfc() {
  const rows: [string, ReactNode, ReactNode][] = [
    ["Catches typos and OCR misreads", <Tick />, <Tick />],
    ["Detects an edited data page", <Partial />, <Tick />],
    ["Detects a swapped photo", <Partial />, <Tick />],
    ["Proves the issuing country signed it", <Cross />, <Tick />],
    ["Detects a cloned chip", <Cross />, <Tick />],
    ["Works on every document and phone", <Tick />, <Cross />],
  ];
  const cell = { display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38 } as const;
  return (
    <Frame kicker="Passport verification" title="What OCR proves, and what only the chip can">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px 260px", fontFamily: sans }}>
        <div />
        <div style={{ ...cell, fontSize: 24, color: color.muted, paddingBottom: 18 }}>OCR of the page</div>
        <div style={{ ...cell, fontSize: 24, color: color.accent, paddingBottom: 18 }}>NFC chip read</div>
        {rows.map(([label, a, b]) => (
          <div key={label} style={{ display: "contents" }}>
            <div style={{ fontSize: 30, color: color.ink, padding: "17px 0", borderTop: `1px solid ${color.line}` }}>{label}</div>
            <div style={{ ...cell, borderTop: `1px solid ${color.line}` }}>{a}</div>
            <div style={{ ...cell, borderTop: `1px solid ${color.line}`, background: color.accentDim }}>{b}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 18, fontSize: 21, color: color.faint, fontFamily: sans }}>
        ~ only by image forensics, imperfectly · cloned chips need active or chip authentication
      </div>
    </Frame>
  );
}

/* 2. KYC data retention ---------------------------------------------------------------------------------- */
export function FigKycRetention() {
  const x = (yr: number) => 40 + yr * 150; // years from application
  const bar = (from: number, to: number, y: number, fill: string, label: string, sub: string) => (
    <g>
      <rect x={x(from)} y={y} width={x(to) - x(from)} height={56} rx={8} fill={fill} />
      <text x={x(from) + 18} y={y + 36} fill={color.bg} fontSize={24} fontFamily={sans} fontWeight={600}>
        {label}
      </text>
      <text x={x(to) + 16} y={y + 36} fill={color.muted} fontSize={22} fontFamily={sans}>
        {sub}
      </text>
    </g>
  );
  const marks: [number, string][] = [
    [0, "Sign-up"],
    [3, "Account closed"],
    [8, "Closed + 5 years"],
  ];
  return (
    <Frame kicker="KYC data retention (example policy)" title="Photos go early; identity records stay for years">
      <svg width={1456} height={560} viewBox="0 0 1456 560">
        {bar(0, 0.25, 60, color.warm, "", "Selfie, ID photos, video: deleted ~30 days after the decision")}
        {bar(0, 8, 190, color.accent, "Identity record and decision log", "")}
        <rect x={x(3)} y={190} width={x(8) - x(3)} height={56} rx={0} fill="rgba(17,18,19,0.35)" />
        {bar(0, 0.25, 320, color.faint, "", "Abandoned application: deleted after ~30 days")}
        <line x1={x(0)} x2={x(9.2)} y1={440} y2={440} stroke={color.line} strokeWidth={2} />
        {marks.map(([yr, label]) => (
          <g key={label}>
            <line x1={x(yr)} x2={x(yr)} y1={40} y2={450} stroke={color.line} strokeDasharray="6 8" />
            <text x={x(yr)} y={485} fill={color.ink} fontSize={24} fontFamily={sans} textAnchor={yr === 0 ? "start" : "middle"}>
              {label}
            </text>
          </g>
        ))}
        <text x={x(5.5)} y={226} fill={color.ink} fontSize={22} fontFamily={sans} textAnchor="middle">
          kept while a customer, then 5 years (FATF minimum)
        </text>
        <text x={x(0)} y={530} fill={color.faint} fontSize={20} fontFamily={sans}>
          Legal holds pause every deletion. Real periods vary by country and regulator.
        </text>
      </svg>
    </Frame>
  );
}

/* 3. Liveness certification (APCER per species) ------------------------------------------------------ */
export function FigLivenessApcer() {
  const bars: [string, number][] = [
    ["Printed photo", 0],
    ["Screen replay", 2],
    ["Paper mask", 0],
  ];
  const y = (pct: number) => 420 - pct * 150;
  return (
    <Frame kicker="Liveness testing · ISO/IEC 30107-3" title="Pooling attacks hides the one that gets through">
      <svg width={1456} height={560} viewBox="0 0 1456 560">
        {[0, 1, 2].map((p) => (
          <g key={p}>
            <line x1={120} x2={1000} y1={y(p)} y2={y(p)} stroke={color.line} />
            <text x={100} y={y(p) + 8} fill={color.muted} fontSize={22} fontFamily={mono} textAnchor="end">
              {p}%
            </text>
          </g>
        ))}
        {bars.map(([label, pct], i) => {
          const cx = 250 + i * 290;
          return (
            <g key={label}>
              <rect
                x={cx - 70}
                y={y(pct) - (pct ? 0 : 4)}
                width={140}
                height={pct ? 420 - y(pct) : 4}
                rx={6}
                fill={pct ? color.warm : color.accent}
              />
              <text x={cx} y={y(pct) - 22} fill={pct ? color.warm : color.ink} fontSize={30} fontFamily={mono} textAnchor="middle">
                {pct}%
              </text>
              <text x={cx} y={466} fill={color.ink} fontSize={24} fontFamily={sans} textAnchor="middle">
                {label}
              </text>
            </g>
          );
        })}
        <line x1={120} x2={1000} y1={y(0.67)} y2={y(0.67)} stroke={color.ink} strokeWidth={3} strokeDasharray="10 10" />
        <text x={790} y={y(0.67) - 14} fill={color.ink} fontSize={22} fontFamily={sans}>
          all attacks pooled: 0.67%
        </text>
        <text x={1080} y={150} fill={color.ink} fontSize={30} fontFamily={sans}>
          Report the worst species:
        </text>
        <text x={1080} y={200} fill={color.warm} fontSize={44} fontFamily={mono}>
          APCER 2%
        </text>
        <text x={1080} y={270} fill={color.ink} fontSize={30} fontFamily={sans}>
          with genuine users rejected
        </text>
        <text x={1080} y={320} fill={color.accent} fontSize={44} fontFamily={mono}>
          BPCER 5%
        </text>
        <text x={1080} y={380} fill={color.muted} fontSize={22} fontFamily={sans}>
          at the same threshold
        </text>
        <text x={120} y={530} fill={color.faint} fontSize={20} fontFamily={sans}>
          Attack acceptance per species, 150 attacks each, 300 genuine attempts.
        </text>
      </svg>
    </Frame>
  );
}

/* 4. HNSW vs cosine: recall vs share scanned ------------------------------------------------------------ */
export function FigAnnRecall() {
  const pts: [number, number, string][] = [
    [0.5, 0.69, "1 probe"],
    [1.6, 0.81, "4"],
    [6.3, 0.89, "16"],
    [25, 0.97, "64"],
    [100, 1, "exact"],
  ];
  const X0 = 140,
    X1 = 1120,
    Y0 = 460,
    Y1 = 40;
  const lx = (p: number) => X0 + ((Math.log10(p) - Math.log10(0.4)) / (Math.log10(100) - Math.log10(0.4))) * (X1 - X0);
  const ly = (r: number) => Y0 - ((r - 0.6) / 0.4) * (Y0 - Y1);
  const path = pts.map(([p, r], i) => `${i ? "L" : "M"}${lx(p)},${ly(r)}`).join(" ");
  return (
    <Frame kicker="Exact vs approximate vector search" title="Scan less of the index, miss some true neighbours">
      <svg width={1456} height={560} viewBox="0 0 1456 560">
        {[0.6, 0.7, 0.8, 0.9, 1].map((r) => (
          <g key={r}>
            <line x1={X0} x2={X1} y1={ly(r)} y2={ly(r)} stroke={color.line} />
            <text x={X0 - 16} y={ly(r) + 8} fill={color.muted} fontSize={22} fontFamily={mono} textAnchor="end">
              {r.toFixed(1)}
            </text>
          </g>
        ))}
        {[0.5, 1, 5, 25, 100].map((p) => (
          <text key={p} x={lx(p)} y={Y0 + 40} fill={color.muted} fontSize={22} fontFamily={mono} textAnchor="middle">
            {p}%
          </text>
        ))}
        <text x={(X0 + X1) / 2} y={Y0 + 82} fill={color.ink} fontSize={24} fontFamily={sans} textAnchor="middle">
          share of vectors scored per query (log scale)
        </text>
        <text x={40} y={ly(0.8)} fill={color.ink} fontSize={24} fontFamily={sans} transform={`rotate(-90 40 ${ly(0.8)})`} textAnchor="middle">
          recall@10
        </text>
        <path d={path} fill="none" stroke={color.accent} strokeWidth={5} />
        {pts.map(([p, r, label]) => (
          <g key={label}>
            <circle cx={lx(p)} cy={ly(r)} r={10} fill={label === "exact" ? color.ink : color.accent} />
            <text x={lx(p) + 16} y={ly(r) + 36} fill={color.ink} fontSize={22} fontFamily={mono}>
              {r.toFixed(2)}
            </text>
          </g>
        ))}
        <text x={1170} y={170} fill={color.ink} fontSize={28} fontFamily={sans}>
          Cosine is the metric.
        </text>
        <text x={1170} y={210} fill={color.ink} fontSize={28} fontFamily={sans}>
          The index decides
        </text>
        <text x={1170} y={250} fill={color.ink} fontSize={28} fontFamily={sans}>
          how many vectors
        </text>
        <text x={1170} y={290} fill={color.ink} fontSize={28} fontFamily={sans}>
          get scored at all.
        </text>
        <text x={1170} y={360} fill={color.muted} fontSize={22} fontFamily={sans}>
          50,000 vectors, 128 dims,
        </text>
        <text x={1170} y={392} fill={color.muted} fontSize={22} fontFamily={sans}>
          IVF index, 200 queries
        </text>
      </svg>
    </Frame>
  );
}

/* 5. p50 / p90 / p99 ------------------------------------------------------------------------------------- */
export function FigLatencyPercentiles() {
  const X0 = 100,
    X1 = 900,
    base = 430;
  const lx = (ms: number) => X0 + ((Math.log10(ms) - Math.log10(50)) / (Math.log10(8000) - Math.log10(50))) * (X1 - X0);
  // Shape of the test data: a tall lognormal around 120 ms and a small one around 2,500 ms (2% of requests).
  const curve = (mu: number, sigma: number, peak: number) =>
    Array.from({ length: 120 }, (_, i) => {
      const ms = 50 * Math.pow(8000 / 50, i / 119);
      const z = (Math.log(ms) - Math.log(mu)) / sigma;
      return [lx(ms), base - peak * Math.exp(-0.5 * z * z)] as const;
    });
  const area = (pts: readonly (readonly [number, number])[]) =>
    `M${pts[0][0]},${base} ` + pts.map(([x, y]) => `L${x},${y}`).join(" ") + ` L${pts[pts.length - 1][0]},${base} Z`;
  const markers: [string, number, string][] = [
    ["p50", 121, color.accent],
    ["mean", 179, color.muted],
    ["p90", 193, color.ink],
    ["p99", 2485, color.warm],
  ];
  return (
    <Frame kicker="Latency percentiles" title="p50 is the typical request; p99 is a different world">
      <svg width={1456} height={560} viewBox="0 0 1456 560">
        <path d={area(curve(120, 0.35, 330))} fill={color.accentDim} stroke={color.accent} strokeWidth={3} />
        <path d={area(curve(2500, 0.4, 40))} fill={color.warmDim} stroke={color.warm} strokeWidth={3} />
        <line x1={X0} x2={X1} y1={base} y2={base} stroke={color.line} strokeWidth={2} />
        {[50, 100, 500, 1000, 5000].map((ms) => (
          <text key={ms} x={lx(ms)} y={base + 36} fill={color.muted} fontSize={20} fontFamily={mono} textAnchor="middle">
            {ms >= 1000 ? `${ms / 1000}s` : `${ms}ms`}
          </text>
        ))}
        {markers.map(([label, ms, c], i) => (
          <g key={label}>
            <line
              x1={lx(ms)}
              x2={lx(ms)}
              y1={60 + i * 34}
              y2={base}
              stroke={c}
              strokeWidth={2}
              strokeDasharray={label === "mean" ? "6 6" : undefined}
            />
            <text
              x={lx(ms) + (label === "p50" ? -10 : 10)}
              y={56 + i * 34}
              fill={c}
              fontSize={22}
              fontFamily={mono}
              textAnchor={label === "p50" ? "end" : "start"}
            >{`${label} ${ms.toLocaleString("en")} ms`}</text>
          </g>
        ))}
        <text x={X0} y={base + 90} fill={color.faint} fontSize={20} fontFamily={sans}>
          10,000 requests; 2% hit a slow path (cold cache, retries, GC)
        </text>
        <text x={990} y={80} fill={color.ink} fontSize={28} fontFamily={sans}>
          One action, many calls:
        </text>
        {[
          [1, "1.0%"],
          [5, "4.9%"],
          [20, "18.2%"],
          [100, "63.4%"],
        ].map(([n, pct], i) => (
          <g key={String(n)}>
            <text x={990} y={140 + i * 60} fill={color.muted} fontSize={24} fontFamily={mono}>{`${n} call${n === 1 ? "" : "s"}`}</text>
            <rect x={1130} y={118 + i * 60} width={(parseFloat(String(pct)) / 63.4) * 220} height={28} rx={4} fill={color.warm} />
            <text x={1130 + (parseFloat(String(pct)) / 63.4) * 220 + 10} y={140 + i * 60} fill={color.ink} fontSize={22} fontFamily={mono}>
              {pct}
            </text>
          </g>
        ))}
        <text x={990} y={400} fill={color.muted} fontSize={20} fontFamily={sans}>
          of actions hit a call slower than p99
        </text>
      </svg>
    </Frame>
  );
}

/* 6. EXIF orientation ------------------------------------------------------------------------------------- */
function IdCard({ rotate, dim }: { rotate: number; dim?: boolean }) {
  return (
    <div
      style={{
        width: 300,
        height: 190,
        transform: `rotate(${rotate}deg)`,
        background: color.paper,
        borderRadius: 14,
        position: "relative",
        opacity: dim ? 0.85 : 1,
      }}
    >
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 34, background: "#2f6e5e", borderRadius: "14px 14px 0 0" }} />
      <div style={{ position: "absolute", left: 18, top: 50, width: 74, height: 96, background: "#b9ae97", borderRadius: 6 }} />
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{ position: "absolute", left: 110, top: 56 + i * 24, width: 160 - i * 22, height: 10, background: color.paperLine, borderRadius: 3 }}
        />
      ))}
      <div
        style={{ position: "absolute", left: 18, right: 18, bottom: 14, height: 10, background: color.paperMuted, borderRadius: 3, opacity: 0.6 }}
      />
    </div>
  );
}
export function FigExifOrientation() {
  const panel = (title: string, sub: string, card: ReactNode, tone: string) => (
    <div style={{ width: 420, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
      <div
        style={{
          height: 330,
          width: 420,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1px solid ${color.line}`,
          borderRadius: 16,
          background: color.surface,
        }}
      >
        {card}
      </div>
      <div style={{ fontFamily: sans, fontSize: 28, color: tone }}>{title}</div>
      <div style={{ fontFamily: mono, fontSize: 20, color: color.muted, textAlign: "center" }}>{sub}</div>
    </div>
  );
  const arrow = <div style={{ fontSize: 56, color: color.faint, marginTop: 140 }}>→</div>;
  return (
    <Frame kicker="Phone photos and OCR" title="The viewer rotates the photo. OCR doesn't.">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        {panel("Stored by the phone", "sensor pixels + Orientation: 6", <IdCard rotate={-90} />, color.ink)}
        {arrow}
        {panel("What a photo viewer shows", "applies the tag: upright", <IdCard rotate={0} />, color.accent)}
        {arrow}
        {panel("What OCR reads", "ignores the tag: sideways text", <IdCard rotate={-90} dim />, color.warm)}
      </div>
      <div style={{ marginTop: 40, fontFamily: sans, fontSize: 26, color: color.ink }}>
        Fix: <span style={{ fontFamily: mono, color: color.accent }}>ImageOps.exif_transpose(img)</span> before anything else reads the pixels.
      </div>
    </Frame>
  );
}

/* 7. asyncio: timeout inside vs outside the semaphore ---------------------------------------------------- */
export function FigAsyncioTimeout() {
  const ms = (t: number) => 230 + t * 7.2; // 1 ms = 7.2 px
  const lane = (y: number, label: string, wait: number, work: number, timeout: number, insideFirst: boolean) => {
    const killed = insideFirst ? false : wait + work > timeout;
    return (
      <g key={label}>
        <text x={210} y={y + 30} fill={color.muted} fontSize={22} fontFamily={mono} textAnchor="end">
          {label}
        </text>
        {wait > 0 && <rect x={ms(0)} y={y} width={wait * 7.2} height={44} rx={6} fill={color.surface} stroke={color.line} />}
        {wait > 0 && wait * 7.2 > 110 && (
          <text x={ms(wait / 2)} y={y + 30} fill={color.faint} fontSize={20} fontFamily={sans} textAnchor="middle">
            waiting for a slot
          </text>
        )}
        {!killed && <rect x={ms(wait)} y={y} width={work * 7.2} height={44} rx={6} fill={color.accent} />}
        {killed && wait < timeout && (
          <rect x={ms(wait)} y={y} width={(timeout - wait) * 7.2} height={44} rx={6} fill={color.warmDim} stroke={color.warm} />
        )}
        {killed && (
          <text x={ms(timeout) + 14} y={y + 30} fill={color.warm} fontSize={22} fontFamily={sans}>
            {wait >= timeout ? "TimeoutError before it started" : "TimeoutError mid-work"}
          </text>
        )}
        <line
          x1={ms((insideFirst ? wait : 0) + timeout)}
          x2={ms((insideFirst ? wait : 0) + timeout)}
          y1={y - 6}
          y2={y + 50}
          stroke={color.warm}
          strokeWidth={3}
        />
      </g>
    );
  };
  return (
    <Frame kicker="Python asyncio · Semaphore(2), 30 ms of work, 50 ms timeout" title="Start the timeout after the slot, not before">
      <svg width={1456} height={560} viewBox="0 0 1456 560">
        <text x={230} y={30} fill={color.warm} fontSize={26} fontFamily={sans}>
          Timeout outside the semaphore: 8 of 10 time out
        </text>
        {[0, 30, 60].map((w, i) => lane(55 + i * 62, `task ${i + 1}`, w, 30, 50, false))}
        <text x={230} y={290} fill={color.accent} fontSize={26} fontFamily={sans}>
          Timeout inside the semaphore: all 10 finish
        </text>
        {[0, 30, 60].map((w, i) => lane(315 + i * 62, `task ${i + 1}`, w, 30, 50, true))}
        {[0, 50, 100, 150].map((t) => (
          <text key={t} x={ms(t)} y={530} fill={color.faint} fontSize={20} fontFamily={mono} textAnchor="middle">
            {t} ms
          </text>
        ))}
        <line x1={1180} x2={1180} y1={12} y2={40} stroke={color.warm} strokeWidth={3} />
        <text x={1194} y={34} fill={color.warm} fontSize={20} fontFamily={sans}>
          timeout deadline
        </text>
      </svg>
    </Frame>
  );
}

/* 8. Idempotency keys ----------------------------------------------------------------------------------- */
export function FigIdempotencyKeys() {
  const rows: [string, string, string, string][] = [
    ["First request", "key k1, amount 500", "runs the charge, stores the response", "201"],
    ["Retry after a timeout", "key k1, amount 500", "replays the stored response, no new charge", "201"],
    ["Same key, new body", "key k1, amount 900", "rejected: a client bug, not a retry", "422"],
    ["Double-click", "key k2, twice at once", "one runs; the other is told to wait", "409"],
    ["Provider down", "key k3", "key released so the retry can really run", "503"],
  ];
  const tone = (code: string) => (code === "201" ? color.accent : code === "503" ? color.muted : color.warm);
  return (
    <Frame kicker="POST /charges with an Idempotency-Key" title="Retry as often as you like; charge once">
      <div style={{ display: "grid", gridTemplateColumns: "300px 330px 1fr 110px", fontFamily: sans, rowGap: 0 }}>
        {rows.map(([what, req, result, code]) => (
          <div key={what} style={{ display: "contents" }}>
            <div style={{ fontSize: 27, color: color.ink, padding: "20px 0", borderTop: `1px solid ${color.line}` }}>{what}</div>
            <div style={{ fontSize: 22, color: color.muted, fontFamily: mono, padding: "24px 0", borderTop: `1px solid ${color.line}` }}>{req}</div>
            <div style={{ fontSize: 25, color: color.ink, padding: "21px 0", borderTop: `1px solid ${color.line}` }}>{result}</div>
            <div
              style={{
                fontSize: 30,
                color: tone(code),
                fontFamily: mono,
                padding: "18px 0",
                borderTop: `1px solid ${color.line}`,
                textAlign: "right",
              }}
            >
              {code}
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* 9. Calibration ----------------------------------------------------------------------------------------- */
export function FigCalibration() {
  const before: [number, number][] = [
    [0.05, 0.2],
    [0.3, 0.41],
    [0.5, 0.51],
    [0.71, 0.61],
    [0.95, 0.81],
  ];
  const after: [number, number][] = [
    [0.11, 0.13],
    [0.3, 0.3],
    [0.5, 0.51],
    [0.7, 0.71],
    [0.89, 0.88],
  ];
  const plot = (x0: number, title: string, pts: [number, number][], ece: string, c: string) => {
    const S = 380,
      Y0 = 500;
    const px = (v: number) => x0 + v * S,
      py = (v: number) => Y0 - v * S;
    return (
      <g>
        <text x={x0} y={30} fill={c} fontSize={28} fontFamily={sans}>
          {title}
        </text>
        <text x={x0} y={70} fill={c} fontSize={26} fontFamily={mono}>
          {ece}
        </text>
        <rect x={x0} y={Y0 - S} width={S} height={S} fill="none" stroke={color.line} />
        <line x1={px(0)} y1={py(0)} x2={px(1)} y2={py(1)} stroke={color.faint} strokeWidth={2} strokeDasharray="8 8" />
        {pts.map(([pred, actual]) => (
          <g key={pred}>
            <line x1={px(pred)} y1={py(pred)} x2={px(pred)} y2={py(actual)} stroke={c} strokeWidth={2} opacity={0.6} />
            <circle cx={px(pred)} cy={py(actual)} r={11} fill={c} />
          </g>
        ))}
        <text x={x0 + S / 2} y={Y0 + 38} fill={color.muted} fontSize={20} fontFamily={sans} textAnchor="middle">
          predicted probability
        </text>
        {[0, 0.5, 1].map((v) => (
          <text key={v} x={x0 - 12} y={py(v) + 7} fill={color.muted} fontSize={18} fontFamily={mono} textAnchor="end">
            {v}
          </text>
        ))}
      </g>
    );
  };
  return (
    <Frame kicker="Model calibration" title="A score of 0.95 should be right 95% of the time">
      <svg width={1456} height={560} viewBox="0 0 1456 560">
        {plot(90, "Overconfident model", before, "ECE 0.126", color.warm)}
        {plot(620, "Temperature scaled (T = 2.44)", after, "ECE 0.011", color.accent)}
        <text x={1110} y={150} fill={color.ink} fontSize={26} fontFamily={sans}>
          Dots: how often each
        </text>
        <text x={1110} y={186} fill={color.ink} fontSize={26} fontFamily={sans}>
          score bin was right.
        </text>
        <text x={1110} y={240} fill={color.ink} fontSize={26} fontFamily={sans}>
          Dashed line: perfect
        </text>
        <text x={1110} y={276} fill={color.ink} fontSize={26} fontFamily={sans}>
          calibration.
        </text>
        <text x={1110} y={340} fill={color.muted} fontSize={22} fontFamily={sans}>
          The ranking is identical
        </text>
        <text x={1110} y={372} fill={color.muted} fontSize={22} fontFamily={sans}>
          in both, so AUC never
        </text>
        <text x={1110} y={404} fill={color.muted} fontSize={22} fontFamily={sans}>
          showed the problem.
        </text>
      </svg>
    </Frame>
  );
}

/* 10. Cancel on disconnect ------------------------------------------------------------------------------ */
export function FigCancelOnDisconnect() {
  const cut = 5 * 13.4 - 2;
  const tokens = (y: number, count: number, label: string, note: string) => (
    <g>
      <text x={0} y={y - 22} fill={color.ink} fontSize={26} fontFamily={sans}>
        {label}
      </text>
      {Array.from({ length: 100 }, (_, i) => (
        <rect key={i} x={i * 13.4} y={y} width={10} height={60} rx={2} fill={i < 5 ? color.accent : i < count ? color.warm : color.surface} />
      ))}
      <line x1={cut} x2={cut} y1={y - 8} y2={y + 68} stroke={color.ink} strokeWidth={3} />
      <text x={0} y={y + 104} fill={color.muted} fontSize={22} fontFamily={sans}>
        {note}
      </text>
    </g>
  );
  return (
    <Frame kicker="Streaming LLM proxy · user closes the tab after ~200 ms" title="Without an abort, the model keeps generating for nobody">
      <svg width={1456} height={560} viewBox="0 0 1456 560">
        {tokens(70, 100, "Without AbortController", "User leaves after 5 tokens (white line); 95 more are generated and billed for nobody")}
        {tokens(330, 5, "With res.on('close') → controller.abort()", "The upstream request is cancelled: generation stops after 5 of 100 tokens")}
      </svg>
    </Frame>
  );
}

/* 11. SQLite FTS5 --------------------------------------------------------------------------------------- */
export function FigFts5Stemming() {
  const col = (x: number, head: string, sub: string, tone: string, rows: [string, string][]) => (
    <g>
      <text x={x} y={30} fill={tone} fontSize={30} fontFamily={mono}>
        {head}
      </text>
      <text x={x} y={66} fill={color.muted} fontSize={21} fontFamily={sans}>
        {sub}
      </text>
      {rows.map(([title, score], i) => (
        <g key={title + i}>
          <rect
            x={x}
            y={100 + i * 76}
            width={560}
            height={60}
            rx={10}
            fill={title.startsWith("(") ? "transparent" : color.surface}
            stroke={color.line}
            strokeDasharray={title.startsWith("(") ? "6 8" : undefined}
          />
          <text x={x + 22} y={139 + i * 76} fill={title.startsWith("(") ? color.faint : color.ink} fontSize={25} fontFamily={sans}>
            {title}
          </text>
          <text x={x + 538} y={139 + i * 76} fill={tone} fontSize={23} fontFamily={mono} textAnchor="end">
            {score}
          </text>
        </g>
      ))}
    </g>
  );
  return (
    <Frame kicker='SQLite FTS5 · query "refund"' title="Without stemming, refund doesn't find Refunds">
      <svg width={1456} height={560} viewBox="0 0 1456 560">
        {col(0, "unicode61", "default tokenizer, 4 documents", color.warm, [
          ["Refund policy (title only)", "-0.0"],
          ["(missed: “…can’t process refunds”)", ""],
        ])}
        {col(720, "porter unicode61", "with stemming, 10 documents", color.accent, [
          ["Refund policy", "-2.156"],
          ["Café opening hours", "-1.041"],
        ])}
        <text x={0} y={330} fill={color.ink} fontSize={26} fontFamily={sans}>
          Two fixes the tests showed:
        </text>
        <text x={0} y={380} fill={color.muted} fontSize={24} fontFamily={sans}>
          1. Add the porter tokenizer, so refund, refunds and refunded match.
        </text>
        <text x={0} y={424} fill={color.muted} fontSize={24} fontFamily={sans}>
          2. Judge ranking on a realistic index: in 4 documents, common words score 0 and the order is arbitrary.
        </text>
        <text x={0} y={490} fill={color.faint} fontSize={21} fontFamily={sans}>
          bm25() scores: lower is better
        </text>
      </svg>
    </Frame>
  );
}

/* 12. Upload magic bytes --------------------------------------------------------------------------------- */
export function FigMagicBytes() {
  const rows: [string, string, string, string, boolean][] = [
    ["passport.jpg", "image/jpeg", "FF D8 FF E0", "JPEG: accepted", true],
    ["selfie.png", "image/png", "89 50 4E 47 0D 0A 1A 0A", "PNG: accepted", true],
    ["statement.pdf", "application/pdf", "25 50 44 46 2D", "%PDF-: accepted", true],
    ["passport.jpg", "image/jpeg", "3C 68 74 6D 6C 3E", "<html>: rejected", false],
    ["photo.png", "image/jpeg", "89 50 4E 47 0D 0A 1A 0A", "PNG declared as JPEG: rejected", false],
  ];
  return (
    <Frame kicker="Validating uploads" title="Trust the first bytes, not the name or Content-Type">
      <div style={{ display: "grid", gridTemplateColumns: "240px 290px 400px 1fr", fontFamily: sans }}>
        {["File name", "Content-Type sent", "First bytes", "Verdict"].map((h) => (
          <div key={h} style={{ fontSize: 21, color: color.muted, paddingBottom: 14, fontFamily: mono, letterSpacing: 1 }}>
            {h}
          </div>
        ))}
        {rows.map(([name, type, bytes, verdict, ok], i) => (
          <div key={i} style={{ display: "contents" }}>
            <div style={{ fontSize: 26, color: color.ink, padding: "20px 0", borderTop: `1px solid ${color.line}` }}>{name}</div>
            <div style={{ fontSize: 22, color: color.muted, fontFamily: mono, padding: "23px 0", borderTop: `1px solid ${color.line}` }}>{type}</div>
            <div
              style={{
                fontSize: 22,
                color: ok ? color.accent : color.warm,
                fontFamily: mono,
                padding: "23px 0",
                borderTop: `1px solid ${color.line}`,
              }}
            >
              {bytes}
            </div>
            <div style={{ fontSize: 25, color: ok ? color.ink : color.warm, padding: "20px 0", borderTop: `1px solid ${color.line}` }}>{verdict}</div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* 13. DST scheduling --------------------------------------------------------------------------------------- */
export function FigDstSchedule() {
  const days = ["Fri 6 Mar", "Sat 7 Mar", "Sun 8 Mar", "Mon 9 Mar"];
  const naive = [9, 9, 10, 10];
  const X = (i: number) => 330 + i * 260;
  const Y = (h: number) => 120 + (h - 8.5) * 150;
  return (
    <Frame kicker="Daily job at 09:00 New York time · DST starts Sun 8 Mar 2026" title="Adding 24 hours in UTC drifts an hour with daylight saving">
      <svg width={1456} height={560} viewBox="0 0 1456 560">
        {[9, 10].map((h) => (
          <g key={h}>
            <line x1={300} x2={1180} y1={Y(h)} y2={Y(h)} stroke={color.line} />
            <text
              x={280}
              y={Y(h) + 8}
              fill={color.muted}
              fontSize={24}
              fontFamily={mono}
              textAnchor="end"
            >{`${String(h).padStart(2, "0")}:00 local`}</text>
          </g>
        ))}
        <line x1={X(1.5)} x2={X(1.5)} y1={40} y2={360} stroke={color.faint} strokeDasharray="6 8" />
        <text x={X(1.5) + 10} y={52} fill={color.faint} fontSize={20} fontFamily={sans}>
          clocks spring forward
        </text>
        {days.map((d, i) => (
          <g key={d}>
            <text x={X(i)} y={400} fill={color.ink} fontSize={23} fontFamily={sans} textAnchor="middle">
              {d}
            </text>
            <circle cx={X(i)} cy={Y(naive[i])} r={14} fill={color.warm} />
            <circle cx={X(i)} cy={Y(9)} r={9} fill={color.accent} />
          </g>
        ))}
        <polyline points={days.map((_, i) => `${X(i)},${Y(naive[i])}`).join(" ")} fill="none" stroke={color.warm} strokeWidth={3} />
        <polyline points={days.map((_, i) => `${X(i)},${Y(9)}`).join(" ")} fill="none" stroke={color.accent} strokeWidth={3} />
        <circle cx={1230} cy={90} r={12} fill={color.warm} />
        <text x={1252} y={98} fill={color.ink} fontSize={22} fontFamily={sans}>
          first run + 24 h
        </text>
        <circle cx={1230} cy={140} r={9} fill={color.accent} />
        <text x={1252} y={148} fill={color.ink} fontSize={22} fontFamily={sans}>
          next local 09:00
        </text>
        <text x={0} y={470} fill={color.muted} fontSize={22} fontFamily={sans}>
          Edge cases: 02:30 doesn't exist on 8 Mar, so it runs at 03:30. 01:30 happens twice on 1 Nov; it runs once.
        </text>
        <text x={0} y={510} fill={color.faint} fontSize={20} fontFamily={sans}>
          Asia/Karachi has no DST, so a team in Lahore rarely sees this until it has customers abroad.
        </text>
      </svg>
    </Frame>
  );
}

/* 14. PII redaction ------------------------------------------------------------------------------------- */
export function FigPiiRedaction() {
  const rows: [string, string, "hit" | "kept"][] = [
    ["Customer ali@example.com uploaded CNIC 35202-1234567-1", "Customer [EMAIL] uploaded CNIC [CNIC]", "hit"],
    ["Card 4111 1111 1111 1111 declined", "Card [CARD] declined", "hit"],
    ["Payout to GB82 WEST 1234 5698 7654 32 failed", "Payout to [IBAN] failed", "hit"],
    ["Call +92 300 1234567 after 5pm", "Call [PHONE] after 5pm", "hit"],
    ["Order 1234567812345678 shipped", "kept: fails Luhn, so not a card", "kept"],
    ["Request 7f9c2a10-55e1-4c3b-9d1a… ok", "kept: request IDs stay usable", "kept"],
  ];
  const mark = (text: string) =>
    text.split(/(\[[A-Z]+\])/).map((part, i) =>
      /^\[[A-Z]+\]$/.test(part) ? (
        <span key={i} style={{ color: color.accent, background: color.accentDim, borderRadius: 6, padding: "1px 6px" }}>
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  return (
    <Frame kicker="Before logs and LLM prompts" title="Typed placeholders keep the text readable">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", fontFamily: mono, alignItems: "center" }}>
        {rows.map(([input, output, kind], i) => (
          <div key={i} style={{ display: "contents" }}>
            <div style={{ fontSize: 21, color: color.muted, padding: "17px 0", borderTop: `1px solid ${color.line}` }}>{input}</div>
            <div style={{ fontSize: 24, color: color.faint, borderTop: `1px solid ${color.line}`, padding: "15px 0", textAlign: "center" }}>→</div>
            <div
              style={{
                fontSize: kind === "kept" ? 20 : 21,
                color: kind === "kept" ? color.faint : color.ink,
                fontFamily: kind === "kept" ? sans : mono,
                padding: "17px 0",
                borderTop: `1px solid ${color.line}`,
              }}
            >
              {kind === "kept" ? output : mark(output)}
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* 15. LLM judge agreement ---------------------------------------------------------------------------------- */
export function FigJudgeKappa() {
  const bar = (y: number, label: string, raw: number, kappa: number) => (
    <g>
      <text x={0} y={y - 16} fill={color.ink} fontSize={25} fontFamily={sans}>
        {label}
      </text>
      <rect x={0} y={y} width={raw * 500} height={30} rx={4} fill={color.faint} />
      <text x={raw * 500 + 12} y={y + 24} fill={color.muted} fontSize={22} fontFamily={mono}>{`agreement ${raw.toFixed(2)}`}</text>
      <rect x={0} y={y + 40} width={Math.max(kappa * 500, 4)} height={30} rx={4} fill={kappa ? color.accent : color.warm} />
      <text
        x={Math.max(kappa * 500, 4) + 12}
        y={y + 64}
        fill={kappa ? color.accent : color.warm}
        fontSize={22}
        fontFamily={mono}
      >{`kappa ${kappa.toFixed(2)}`}</text>
    </g>
  );
  const cell = (x: number, y: number, n: number, good: boolean) => (
    <g>
      <rect x={x} y={y} width={150} height={110} rx={10} fill={good ? color.accentDim : color.warmDim} />
      <text x={x + 75} y={y + 70} fill={good ? color.accent : color.warm} fontSize={44} fontFamily={mono} textAnchor="middle">
        {n}
      </text>
    </g>
  );
  return (
    <Frame kicker="LLM-as-judge vs human grades · 100 answers, 90 pass" title="90% agreement can mean the judge is useless">
      <svg width={1456} height={560} viewBox="0 0 1456 560">
        {bar(60, "Judge that passes everything", 0.9, 0)}
        {bar(230, "Judge with 94 of 100 right", 0.94, 0.69)}
        <text x={0} y={410} fill={color.muted} fontSize={22} fontFamily={sans}>
          Cohen's kappa removes the agreement you'd get by chance.
        </text>
        <text x={0} y={446} fill={color.muted} fontSize={22} fontFamily={sans}>
          0 = chance level, 1 = perfect.
        </text>
        <text x={1110} y={30} fill={color.ink} fontSize={24} fontFamily={sans} textAnchor="middle">
          The 0.69 judge's mistakes
        </text>
        <text x={1110} y={70} fill={color.muted} fontSize={20} fontFamily={mono} textAnchor="middle">
          judge: pass · fail
        </text>
        <text x={940} y={155} fill={color.muted} fontSize={20} fontFamily={mono} textAnchor="end">
          human pass
        </text>
        <text x={940} y={275} fill={color.muted} fontSize={20} fontFamily={mono} textAnchor="end">
          human fail
        </text>
        {cell(960, 90, 86, true)}
        {cell(1120, 90, 4, false)}
        {cell(960, 210, 2, false)}
        {cell(1120, 210, 8, true)}
        <text x={960} y={370} fill={color.warm} fontSize={21} fontFamily={sans}>
          2 of 10 real failures missed
        </text>
        <text x={960} y={402} fill={color.muted} fontSize={21} fontFamily={sans}>
          4 good answers flagged for review
        </text>
      </svg>
    </Frame>
  );
}

/* 16. Active liveness challenge-response ------------------------------------------------------------- */
export function FigActiveLiveness() {
  const rows: [string, string, string, boolean][] = [
    ["Live person", "turn left → look up → blink, ~1 s apart", "pass", true],
    ["Same request sent again", "nonce already used", "replay rejected", false],
    ["Pre-recorded video", "look up → turn left → blink", "wrong order", false],
    ["Synthetic stream", "all three actions within 150 ms", "faster than a person", false],
    ["Answer after 40 s", "challenge issued 40 s ago", "expired", false],
  ];
  return (
    <Frame
      kicker="Active liveness · challenge: turn left → look up → blink + one-time nonce"
      title="A random challenge stops replays, not a library of clips"
    >
      <div style={{ display: "grid", gridTemplateColumns: "330px 1fr 300px", fontFamily: sans }}>
        {rows.map(([who, what, verdict, ok]) => (
          <div key={who} style={{ display: "contents" }}>
            <div style={{ fontSize: 27, color: color.ink, padding: "18px 0", borderTop: `1px solid ${color.line}` }}>{who}</div>
            <div style={{ fontSize: 22, color: color.muted, fontFamily: mono, padding: "22px 0", borderTop: `1px solid ${color.line}` }}>{what}</div>
            <div
              style={{
                fontSize: 26,
                color: ok ? color.accent : color.warm,
                padding: "18px 0",
                borderTop: `1px solid ${color.line}`,
                textAlign: "right",
              }}
            >
              {ok ? "✓ " : "✗ "}
              {verdict}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 26, fontSize: 24, fontFamily: sans, color: color.ink }}>
        But 3 of 4 actions in order is only <span style={{ fontFamily: mono, color: color.warm }}>24</span> possible sequences: pair it with passive
        and injection checks.
      </div>
    </Frame>
  );
}

/* 17. AML structuring ------------------------------------------------------------------------------------ */
export function FigAmlStructuring() {
  const T = 10000;
  const y = (amt: number) => 330 - (amt / 16000) * 300;
  const panel = (x0: number, title: string, deps: [number, number][], flagged: string, tone: string) => (
    <g>
      <text x={x0} y={20} fill={tone} fontSize={26} fontFamily={sans}>
        {title}
      </text>
      <line x1={x0} x2={x0 + 400} y1={y(T)} y2={y(T)} stroke={color.ink} strokeWidth={2} strokeDasharray="8 8" />
      <line x1={x0} x2={x0 + 400} y1={330} y2={330} stroke={color.line} strokeWidth={2} />
      {deps.map(([day, amt], i) => (
        <g key={i}>
          <rect x={x0 + 10 + day * 12 + i * 50} y={y(amt)} width={26} height={330 - y(amt)} rx={4} fill={amt >= T ? color.faint : tone} />
          <text x={x0 + 23 + day * 12 + i * 50} y={360} fill={color.muted} fontSize={16} fontFamily={mono} textAnchor="middle">{`day ${day}`}</text>
        </g>
      ))}
      <text x={x0} y={410} fill={tone} fontSize={22} fontFamily={sans}>
        {flagged}
      </text>
    </g>
  );
  return (
    <Frame
      kicker="AML transaction monitoring · cash deposits vs a $10,000 reporting threshold"
      title="Structuring: deposits that stay just under the line"
    >
      <svg width={1456} height={560} viewBox="0 0 1456 560">
        {panel(
          0,
          "Customer A",
          [
            [0, 9500],
            [2, 9800],
            [5, 9200],
          ],
          "Alert: 3 in 5 days, $28,500",
          color.warm
        )}
        {panel(
          500,
          "Customer B",
          [
            [0, 9500],
            [10, 9800],
            [20, 9200],
          ],
          "No alert: spread over 20 days",
          color.accent
        )}
        {panel(
          1000,
          "Customer C",
          [
            [0, 12000],
            [1, 15000],
          ],
          "No alert: reported anyway",
          color.muted
        )}
        <text x={0} y={480} fill={color.ink} fontSize={22} fontFamily={sans}>
          Dashed line: the reporting threshold. The rule looks for 3+ cash deposits at 80–100% of it within 7 days.
        </text>
        <text x={0} y={520} fill={color.faint} fontSize={20} fontFamily={sans}>
          KYC knows who the customer is; monitoring like this is the rest of AML.
        </text>
      </svg>
    </Frame>
  );
}

/* 18. KYB ownership chain ----------------------------------------------------------------------------- */
export function FigKybOwnership() {
  const node = (x: number, y: number, label: string, kind: "company" | "person", note?: string, hot?: boolean) => (
    <g>
      <rect
        x={x - 110}
        y={y - 34}
        width={220}
        height={68}
        rx={kind === "company" ? 8 : 34}
        fill={hot ? color.warmDim : color.surface}
        stroke={hot ? color.warm : kind === "company" ? color.line : color.accent}
        strokeWidth={2}
      />
      <text x={x} y={y + 9} fill={color.ink} fontSize={25} fontFamily={sans} textAnchor="middle">
        {label}
      </text>
      {note && (
        <text x={x} y={y + 64} fill={hot ? color.warm : color.accent} fontSize={22} fontFamily={mono} textAnchor="middle">
          {note}
        </text>
      )}
    </g>
  );
  const edge = (x1: number, y1: number, x2: number, y2: number, pct: string) => (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color.faint} strokeWidth={2} />
      <text x={(x1 + x2) / 2 + 10} y={(y1 + y2) / 2} fill={color.muted} fontSize={21} fontFamily={mono}>
        {pct}
      </text>
    </g>
  );
  return (
    <Frame kicker="KYB · ultimate beneficial owners" title="15% on the register, 36% through the chain">
      <svg width={1456} height={560} viewBox="0 0 1456 560">
        {edge(700, 74, 330, 166, "60%")}
        {edge(700, 74, 1140, 166, "25%")}
        {edge(760, 74, 900, 446, "")}
        <text x={796} y={170} fill={color.muted} fontSize={21} fontFamily={mono}>
          15% direct
        </text>
        {edge(330, 234, 150, 316, "50%")}
        {edge(330, 234, 520, 316, "50%")}
        {edge(520, 384, 300, 446, "30%")}
        {edge(560, 384, 820, 446, "70%")}
        {node(700, 40, "Target Ltd", "company")}
        {node(330, 200, "Holding A", "company")}
        {node(1140, 200, "Bilal", "person", "25%: a UBO in the US, not UK/EU")}
        {node(150, 350, "Omar", "person", "30%")}
        {node(520, 350, "Holding B", "company")}
        {node(300, 480, "Zainab", "person", "9%")}
        {node(900, 480, "Sara", "person", "", true)}
        <text x={1030} y={472} fill={color.warm} fontSize={24} fontFamily={mono}>
          15% + 60%×50%×70%
        </text>
        <text x={1030} y={506} fill={color.warm} fontSize={24} fontFamily={mono}>
          = 36%, the largest owner
        </text>
      </svg>
    </Frame>
  );
}

/* 19. KYC selfie match ------------------------------------------------------------------------------------ */
export function FigKycSelfieMatch() {
  const steps = ["Face found", "Face size", "Sharpness", "Brightness", "Similarity ≥ 0.80"];
  const outcomes: [string, string, string][] = [
    ["Same person", "similarity 0.951", "match"],
    ["Different person", "similarity −0.02", "human review"],
    ["Blurry selfie", "fails sharpness", "retry: “hold still”"],
    ["Face too small", "fails face size", "retry: “move closer”"],
  ];
  return (
    <Frame kicker="KYC selfie vs ID photo" title="Check the photo first, then compare the faces">
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: sans }}>
        {steps.map((st, i) => (
          <div key={st} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                padding: "18px 22px",
                border: `1px solid ${i === 4 ? color.accent : color.line}`,
                borderRadius: 12,
                background: color.surface,
                fontSize: 24,
                color: color.ink,
              }}
            >
              {st}
            </div>
            {i < steps.length - 1 && <div style={{ fontSize: 30, color: color.faint }}>→</div>}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, fontSize: 21, color: color.muted, fontFamily: sans }}>
        Quality gates (first four) send the user back with a reason; only good images reach the comparison.
      </div>
      <div style={{ marginTop: 30, display: "grid", gridTemplateColumns: "320px 320px 1fr", fontFamily: sans }}>
        {outcomes.map(([who, why, out]) => (
          <div key={who} style={{ display: "contents" }}>
            <div style={{ fontSize: 26, color: color.ink, padding: "16px 0", borderTop: `1px solid ${color.line}` }}>{who}</div>
            <div style={{ fontSize: 22, color: color.muted, fontFamily: mono, padding: "19px 0", borderTop: `1px solid ${color.line}` }}>{why}</div>
            <div
              style={{
                fontSize: 26,
                color: out === "match" ? color.accent : out.startsWith("retry") ? color.ink : color.warm,
                padding: "16px 0",
                borderTop: `1px solid ${color.line}`,
              }}
            >
              {out}
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* 20. CDD vs EDD ----------------------------------------------------------------------------------------- */
export function FigCddEdd() {
  const rows: [string, string, string, string][] = [
    ["Local salary account, branch", "0", "SDD", "no risk factors"],
    ["Remote, international transfers", "30", "CDD", "country +10 · transfers +15 · remote +5"],
    ["Crypto, high-risk country", "70", "EDD", "4 factors · source of funds missing"],
    ["Foreign minister's relative", "0", "EDD", "foreign PEP: mandatory, whatever the score"],
    ["Domestic official", "20", "CDD", "domestic PEP is a factor, not automatic"],
    ["Confirmed sanctions match", "–", "stop", "do not onboard; escalate"],
  ];
  const tone = (l: string) => (l === "SDD" ? color.accent : l === "CDD" ? color.ink : color.warm);
  return (
    <Frame kicker="Risk-based due diligence · SDD under 6 · CDD 6–39 · EDD 40+" title="The score picks the level; some facts override it">
      <div style={{ display: "grid", gridTemplateColumns: "460px 90px 110px 1fr", fontFamily: sans }}>
        {rows.map(([who, score, level, why]) => (
          <div key={who} style={{ display: "contents" }}>
            <div style={{ fontSize: 25, color: color.ink, padding: "15px 0", borderTop: `1px solid ${color.line}` }}>{who}</div>
            <div style={{ fontSize: 24, color: color.muted, fontFamily: mono, padding: "16px 0", borderTop: `1px solid ${color.line}` }}>{score}</div>
            <div style={{ fontSize: 25, color: tone(level), fontFamily: mono, padding: "15px 0", borderTop: `1px solid ${color.line}` }}>{level}</div>
            <div style={{ fontSize: 22, color: color.muted, padding: "17px 0", borderTop: `1px solid ${color.line}` }}>{why}</div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* 21. Voice agent tool calls ------------------------------------------------------------------------------ */
export function FigVoiceToolCalls() {
  const ms = (t: number) => 260 + t * 0.26; // 1 ms = 0.26 px, 0–4000 ms
  const lane = (y: number, label: string, children: ReactNode) => (
    <g>
      <text x={240} y={y + 30} fill={color.ink} fontSize={23} fontFamily={sans} textAnchor="end">
        {label}
      </text>
      {children}
    </g>
  );
  return (
    <Frame kicker="Voice agent tool calls · 1.5 s budget per turn" title="Never leave the caller in silence">
      <svg width={1456} height={560} viewBox="0 0 1456 560">
        <line x1={ms(1500)} x2={ms(1500)} y1={20} y2={420} stroke={color.warm} strokeWidth={3} strokeDasharray="8 8" />
        <text x={ms(1500) + 10} y={36} fill={color.warm} fontSize={20} fontFamily={sans}>
          budget
        </text>
        {lane(
          70,
          "Fast tool (50 ms)",
          <>
            <rect x={ms(0)} y={70} width={50 * 0.26 + 6} height={44} rx={6} fill={color.accent} />
            <text x={ms(60) + 16} y={100} fill={color.ink} fontSize={21} fontFamily={sans}>
              answer in the same turn
            </text>
          </>
        )}
        {lane(
          170,
          "Slow tool (3 s)",
          <>
            <rect x={ms(0)} y={170} width={3000 * 0.26} height={44} rx={6} fill={color.surface} stroke={color.line} />
            <rect x={ms(1500) - 4} y={166} width={8} height={52} rx={2} fill={color.warm} />
            <text x={ms(1500) + 16} y={200} fill={color.ink} fontSize={20} fontFamily={sans}>
              holding line at 1.5 s
            </text>
            <text x={ms(3000) + 12} y={200} fill={color.accent} fontSize={20} fontFamily={sans}>
              result next turn
            </text>
          </>
        )}
        {lane(
          270,
          "Retry, same call ID",
          <>
            <rect x={ms(1800)} y={270} width={120} height={44} rx={6} fill={color.surface} stroke={color.line} />
            <text x={ms(1800) + 140} y={300} fill={color.ink} fontSize={20} fontFamily={sans}>
              "still checking": no second booking
            </text>
          </>
        )}
        {lane(
          370,
          "Bad signature",
          <>
            <rect x={ms(0)} y={370} width={40} height={44} rx={6} fill={color.warmDim} stroke={color.warm} />
            <text x={ms(0) + 60} y={400} fill={color.warm} fontSize={20} fontFamily={sans}>
              rejected before any tool runs
            </text>
          </>
        )}
        {[0, 1000, 2000, 3000, 4000].map((t) => (
          <text key={t} x={ms(t)} y={470} fill={color.faint} fontSize={20} fontFamily={mono} textAnchor="middle">
            {t / 1000} s
          </text>
        ))}
        <text x={260} y={530} fill={color.muted} fontSize={21} fontFamily={sans}>
          Tested: holding line returned at 1,501 ms; the booking ran once across three requests.
        </text>
      </svg>
    </Frame>
  );
}

/* 22. OCR metrics -------------------------------------------------------------------------------------------- */
export function FigOcrMetrics() {
  const bar = (y: number, label: string, value: number, text: string, tone: string, note: string) => (
    <g>
      <text x={0} y={y + 28} fill={color.ink} fontSize={25} fontFamily={sans}>
        {label}
      </text>
      <rect x={330} y={y} width={value * 700} height={40} rx={6} fill={tone} />
      <text x={330 + value * 700 + 14} y={y + 29} fill={tone} fontSize={25} fontFamily={mono}>
        {text}
      </text>
      <text x={330} y={y + 70} fill={color.muted} fontSize={19} fontFamily={sans}>
        {note}
      </text>
    </g>
  );
  return (
    <Frame kicker="One passport read, two misread characters (I→1, 0→O)" title="Same read, three very different scores">
      <svg width={1456} height={560} viewBox="0 0 1456 560">
        {bar(10, "Character error rate", 0.05, "5%", color.accent, "2 wrong characters out of 40: looks excellent")}
        {bar(120, "Word error rate", 0.4, "40%", color.warm, "2 wrong words out of 5: looks terrible")}
        {bar(230, "Field accuracy", 0.8, "80%", color.ink, "4 of 5 fields right, but the wrong one is the document number")}
        <line x1={0} x2={1400} y1={350} y2={350} stroke={color.line} />
        <text x={0} y={400} fill={color.ink} fontSize={24} fontFamily={sans}>
          Normalise first: "Anna Maria" vs "ANNA MARIA" with a double space (case and spacing only)
        </text>
        <text x={0} y={442} fill={color.warm} fontSize={24} fontFamily={mono}>
          unnormalised CER 80%
        </text>
        <text x={360} y={442} fill={color.accent} fontSize={24} fontFamily={mono}>
          normalised CER 0%
        </text>
        <text x={0} y={496} fill={color.muted} fontSize={21} fontFamily={sans}>
          Urdu digits need explicit mapping: NFKC leaves "۳۵۲۰۲" ≠ "35202" (CER 100%).
        </text>
      </svg>
    </Frame>
  );
}

/* 23. MRZ fields ---------------------------------------------------------------------------------------------- */
export function FigMrzFields() {
  const CW = 30; // px per character at fontSize 50 mono
  const line = (y: number, segs: [string, string, string][]) => {
    let x = 0;
    return segs.map(([text, label, tone], i) => {
      const left = x;
      x += text.length * CW;
      return (
        <div key={y + "-" + i} style={{ position: "absolute", left, top: y, width: text.length * CW }}>
          <div style={{ fontFamily: mono, fontSize: 50, color: tone, letterSpacing: 0, width: text.length * CW, whiteSpace: "pre" }}>{text}</div>
          <div style={{ height: 4, margin: "4px 3px 0", background: tone, opacity: 0.8 }} />
          <div style={{ fontFamily: sans, fontSize: 18, color: color.muted, marginTop: 8, textAlign: "center", whiteSpace: "nowrap" }}>{label}</div>
        </div>
      );
    });
  };
  const A = color.accent,
    I = color.ink,
    W = color.warm,
    F = color.faint;
  return (
    <Frame kicker="ICAO 9303 TD3 specimen · 2 lines × 44 characters" title="Every passport MRZ field sits at a fixed position">
      <div style={{ position: "relative", height: 560, marginLeft: 40 }}>
        {line(10, [
          ["P<", "type", I],
          ["UTO", "issuer", A],
          ["ERIKSSON", "surname", I],
          ["<<", "", F],
          ["ANNA<MARIA", "given names", A],
          ["<".repeat(19), "filler", F],
        ])}
        {line(190, [
          ["L898902C3", "document no.", I],
          ["6", "✓", W],
          ["UTO", "nation", A],
          ["740812", "birth", I],
          ["2", "✓", W],
          ["F", "sex", A],
          ["120415", "expiry", I],
          ["9", "✓", W],
          ["ZE184226B<<<<<", "optional data", A],
          ["1", "✓", W],
          ["0", "all", W],
        ])}
        <div style={{ position: "absolute", top: 400, fontFamily: sans, fontSize: 25, color: color.ink }}>
          <span style={{ color: W }}>Orange</span> digits are check digits; the last one covers the document number, dates and optional data together.
        </div>
        <div style={{ position: "absolute", top: 450, fontFamily: sans, fontSize: 25, color: color.muted }}>
          Tested: both ICAO specimens pass every check; one misread (74O812) fails its own check and the composite.
        </div>
      </div>
    </Frame>
  );
}

/* 24. Webhook signatures ------------------------------------------------------------------------------------- */
export function FigWebhookSignatures() {
  const rows: [string, boolean, string][] = [
    ["Signed with the current secret", true, "accepted"],
    ["Signed with the old secret, during rotation", true, "accepted: both secrets configured"],
    ["Same request replayed 10 minutes later", false, "timestamp outside 300 s window"],
    ["Amount changed in transit", false, "signature mismatch"],
    ["Timestamp forged to look fresh", false, "signature mismatch: it covers the timestamp"],
    ["Body re-serialised, 10.50 → 10.5", false, "signature mismatch: verify the raw bytes"],
  ];
  return (
    <Frame kicker="HMAC-SHA256 over “timestamp.raw body” · 5-minute window" title="What a correct webhook verifier accepts">
      <div style={{ display: "grid", gridTemplateColumns: "640px 70px 1fr", fontFamily: sans }}>
        {rows.map(([req, ok, why]) => (
          <div key={req} style={{ display: "contents" }}>
            <div style={{ fontSize: 27, color: color.ink, padding: "17px 0", borderTop: `1px solid ${color.line}` }}>{req}</div>
            <div style={{ fontSize: 34, padding: "12px 0", borderTop: `1px solid ${color.line}` }}>{ok ? <Tick /> : <Cross />}</div>
            <div style={{ fontSize: 23, color: ok ? color.accent : color.warm, padding: "19px 0", borderTop: `1px solid ${color.line}` }}>{why}</div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* 25. Partial JSON --------------------------------------------------------------------------------------------- */
export function FigPartialJson() {
  const rows: [string, string, string][] = [
    ["15", '{"title":"Refun', '{ title: "Refun" }'],
    ["30", '…"Refund policy","step', '{ title: "Refund policy" }'],
    ["60", '…["Open the order","Choose \\', '{ title, steps: ["Open the order", "Choose "] }'],
    ["119", '…"eligible":true,"notes":null}', "{ title, steps (2), days: 14, eligible: true, notes: null }"],
  ];
  return (
    <Frame kicker="Streaming structured output · 119-character response" title="Usable JSON at every point in the stream">
      <div style={{ display: "grid", gridTemplateColumns: "110px 560px 1fr", fontFamily: mono }}>
        <div style={{ fontFamily: sans, fontSize: 21, color: color.muted, paddingBottom: 12 }}>chars</div>
        <div style={{ fontFamily: sans, fontSize: 21, color: color.muted, paddingBottom: 12 }}>stream so far (invalid JSON)</div>
        <div style={{ fontFamily: sans, fontSize: 21, color: color.accent, paddingBottom: 12 }}>parsePartialJson returns</div>
        {rows.map(([n, raw, out]) => (
          <div key={n} style={{ display: "contents" }}>
            <div style={{ fontSize: 26, color: color.muted, padding: "22px 0", borderTop: `1px solid ${color.line}` }}>{n}</div>
            <div style={{ fontSize: 24, color: color.warm, padding: "23px 0", borderTop: `1px solid ${color.line}` }}>{raw}</div>
            <div style={{ fontSize: 24, color: color.ink, padding: "23px 16px", borderTop: `1px solid ${color.line}`, background: color.accentDim }}>
              {out}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 34, fontFamily: sans, fontSize: 24, color: color.muted }}>
        Tested: all 119 prefixes parse, and no key ever disappears once it has appeared.
      </div>
    </Frame>
  );
}

/* 26. Passport BAC keys ------------------------------------------------------------------------------------- */
export function FigPassportBacKeys() {
  const box = (label: string, value: string, tone: string) => (
    <div style={{ border: `1px solid ${color.line}`, borderRadius: 10, padding: "14px 20px", background: color.surface }}>
      <div style={{ fontFamily: sans, fontSize: 19, color: color.muted }}>{label}</div>
      <div style={{ fontFamily: mono, fontSize: 27, color: tone, marginTop: 6 }}>{value}</div>
    </div>
  );
  const arrow = (text: string) => <div style={{ fontFamily: sans, fontSize: 19, color: color.faint, padding: "6px 0 6px 24px" }}>↓ {text}</div>;
  return (
    <Frame kicker="Basic Access Control · ICAO Doc 9303 Part 11 worked example" title="From three MRZ fields to the keys that unlock the chip">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        <div>
          {box("Document no. + check · birth date + check · expiry + check", "L898902C<3 6908061 9406236", color.ink)}
          {arrow("SHA-1, first 16 bytes")}
          {box("K_seed", "239AB9CB282DAF66231DC5A4DF6BFBAE", color.ink)}
          {arrow("SHA-1(K_seed ‖ counter), 16 bytes, odd parity")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
            {box("K_enc (counter 1)", "AB94FDECF2674FDFB9B391F85D7F76F2", color.accent)}
            {box("K_mac (counter 2)", "7962D9ECE03D1ACD4C76089DCE131543", color.accent)}
          </div>
        </div>
        <div style={{ fontFamily: sans, fontSize: 24, color: color.ink, lineHeight: 1.45 }}>
          <div style={{ color: color.accent, fontSize: 22, marginBottom: 10 }}>Matches ICAO's test values byte for byte</div>
          <div>The reader proves it holds the keys with EXTERNAL AUTHENTICATE; the keys are never sent.</div>
          <div style={{ marginTop: 22, color: color.warm }}>One misread character, C → O:</div>
          <div style={{ fontFamily: mono, fontSize: 24, color: color.warm, marginTop: 6 }}>K_enc E6A410DA4F438AFD…</div>
          <div style={{ marginTop: 10, color: color.muted, fontSize: 22 }}>
            Completely different key: the chip refuses, with no hint which field was wrong.
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* 27. Similarity metrics ------------------------------------------------------------------------------------ */
export function FigSimilarityMetrics() {
  const bar = (y: number, label: string, value: number, tone: string) => (
    <g>
      <text x={0} y={y + 28} fill={color.ink} fontSize={24} fontFamily={sans}>
        {label}
      </text>
      <rect x={300} y={y} width={value * 700} height={40} rx={6} fill={tone} />
      <text x={300 + value * 700 + 14} y={y + 29} fill={tone} fontSize={24} fontFamily={mono}>
        {Math.round(value * 10)} of 10
      </text>
    </g>
  );
  return (
    <Frame kicker="10,000 vectors · 384 dimensions · overlap with cosine's top 10" title="Metrics only agree once vectors are normalised">
      <svg width={1456} height={560} viewBox="0 0 1456 560">
        <text x={0} y={20} fill={color.muted} fontSize={21} fontFamily={sans}>
          Unnormalised vectors (lengths vary 6×)
        </text>
        {bar(40, "Dot product", 0.5, color.warm)}
        {bar(100, "Euclidean distance", 0.1, color.warm)}
        <text x={0} y={210} fill={color.muted} fontSize={21} fontFamily={sans}>
          Normalised to length 1
        </text>
        {bar(230, "Dot product", 1, color.accent)}
        {bar(290, "Euclidean distance", 1, color.accent)}
        <line x1={0} x2={1400} y1={370} y2={370} stroke={color.line} />
        <text x={0} y={415} fill={color.ink} fontSize={23} fontFamily={sans}>
          Dot product favours long vectors: its top 10 average length 53.7, against 34.1 for all vectors.
        </text>
        <text x={0} y={460} fill={color.muted} fontSize={22} fontFamily={mono}>
          On unit vectors: ‖a − b‖² = 2 − 2·cos(a, b) (max error 1.3e-15)
        </text>
      </svg>
    </Frame>
  );
}

/* 28. Passive authentication ------------------------------------------------------------------------------ */
export function FigPassiveAuth() {
  const rows: [string, string, boolean][] = [
    ["Genuine passport", "all four checks pass", true],
    ["Name edited in DG1", "DG1 hash", false],
    ["…and the hash list rewritten", "messageDigest", false],
    ["…and the signed attributes rebuilt", "SOD signature", false],
    ["…and signed with a self-made DS certificate", "DS certificate chain", false],
    ["Genuine, but signature checked over the [0] tag", "SOD signature", false],
  ];
  return (
    <Frame kicker="Passive authentication · tested on a synthetic passport" title="Every forgery step is caught by a different check">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", fontFamily: sans }}>
        <div style={{ fontSize: 21, color: color.muted, paddingBottom: 12 }}>What the chip data looks like</div>
        <div style={{ fontSize: 21, color: color.muted, paddingBottom: 12 }}>Check that fails</div>
        {rows.map(([what, check, ok]) => (
          <div key={what} style={{ display: "contents" }}>
            <div style={{ fontSize: 28, color: color.ink, padding: "17px 0", borderTop: `1px solid ${color.line}` }}>{what}</div>
            <div
              style={{
                fontFamily: mono,
                fontSize: 25,
                color: ok ? color.accent : color.warm,
                padding: "19px 16px",
                borderTop: `1px solid ${color.line}`,
                background: ok ? color.accentDim : "transparent",
              }}
            >
              {ok ? "✓ " : "✗ "}
              {check}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 28, fontFamily: sans, fontSize: 23, color: color.muted }}>
        The last row is a verifier bug: the signature covers the attributes re-tagged as a SET (0x31), not as stored (0xA0).
      </div>
    </Frame>
  );
}

/* 29. Vapi HMAC -------------------------------------------------------------------------------------------- */
export function FigVapiHmac() {
  const line = (label: string, text: string, tone: string) => (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontFamily: sans, fontSize: 20, color: color.muted }}>{label}</div>
      <div style={{ fontFamily: mono, fontSize: 23, color: tone, marginTop: 6 }}>{text}</div>
    </div>
  );
  const rows: [string, boolean][] = [
    ["Valid signature, timestamp in seconds or ms", true],
    ["One byte of the body changed", false],
    ["Body re-serialised with JSON.stringify", false],
    ["Timestamp 6 minutes old (replay)", false],
    ["Missing or wrong-length signature", false],
  ];
  return (
    <Frame kicker="Vapi webhooks · HMAC-SHA256 over {timestamp}.{body}" title="Sign the raw bytes: parsed-then-stringified JSON fails">
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 48 }}>
        <div>
          {line("Raw body Vapi signed", '"cost":0.10,"summary":"Caf\\u00e9 …"', color.accent)}
          {line("JSON.stringify(JSON.parse(body))", '"cost":0.1,"summary":"Café …"', color.warm)}
          <div style={{ marginTop: 26, fontFamily: sans, fontSize: 23, color: color.ink, lineHeight: 1.45 }}>
            Same data, different bytes, so a different HMAC. Keep the raw buffer with <span style={{ fontFamily: mono }}>express.raw()</span> or a{" "}
            <span style={{ fontFamily: mono }}>verify</span> hook.
          </div>
        </div>
        <div style={{ fontFamily: sans }}>
          {rows.map(([what, ok]) => (
            <div
              key={what}
              style={{ display: "flex", gap: 14, fontSize: 25, color: color.ink, padding: "15px 0", borderTop: `1px solid ${color.line}` }}
            >
              <span style={{ color: ok ? color.accent : color.warm, fontWeight: 700 }}>{ok ? "✓" : "✗"}</span>
              {what}
            </div>
          ))}
          <div style={{ marginTop: 14, fontSize: 21, color: color.muted }}>7 of 7 tests pass, all checks constant-time.</div>
        </div>
      </div>
    </Frame>
  );
}

export const figures = [
  { id: "fig-passport-ocr-vs-nfc", component: FigOcrVsNfc },
  { id: "fig-kyc-data-retention", component: FigKycRetention },
  { id: "fig-liveness-apcer", component: FigLivenessApcer },
  { id: "fig-ann-recall", component: FigAnnRecall },
  { id: "fig-latency-percentiles", component: FigLatencyPercentiles },
  { id: "fig-exif-orientation", component: FigExifOrientation },
  { id: "fig-asyncio-timeout", component: FigAsyncioTimeout },
  { id: "fig-idempotency-keys", component: FigIdempotencyKeys },
  { id: "fig-calibration", component: FigCalibration },
  { id: "fig-cancel-on-disconnect", component: FigCancelOnDisconnect },
  { id: "fig-fts5-stemming", component: FigFts5Stemming },
  { id: "fig-upload-magic-bytes", component: FigMagicBytes },
  { id: "fig-dst-schedule", component: FigDstSchedule },
  { id: "fig-pii-redaction", component: FigPiiRedaction },
  { id: "fig-judge-kappa", component: FigJudgeKappa },
  { id: "fig-active-liveness", component: FigActiveLiveness },
  { id: "fig-aml-structuring", component: FigAmlStructuring },
  { id: "fig-kyb-ownership", component: FigKybOwnership },
  { id: "fig-kyc-selfie-match", component: FigKycSelfieMatch },
  { id: "fig-cdd-edd-risk", component: FigCddEdd },
  { id: "fig-voice-tool-calls", component: FigVoiceToolCalls },
  { id: "fig-ocr-metrics", component: FigOcrMetrics },
  { id: "fig-mrz-fields", component: FigMrzFields },
  { id: "fig-webhook-signatures", component: FigWebhookSignatures },
  { id: "fig-partial-json", component: FigPartialJson },
  { id: "fig-passport-bac-keys", component: FigPassportBacKeys },
  { id: "fig-similarity-metrics", component: FigSimilarityMetrics },
  { id: "fig-passive-auth", component: FigPassiveAuth },
  { id: "fig-vapi-hmac", component: FigVapiHmac },
] as const;
