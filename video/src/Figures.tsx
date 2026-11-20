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
] as const;
