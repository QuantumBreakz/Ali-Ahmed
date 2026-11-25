import { useCurrentFrame } from "remotion";
import { Chapter, color, FPS, mono, s, sans, serif, Stage, tween, useReveal } from "./theme";

export const SSRF_DURATION = s(27);

const SPELLINGS = ["http://2130706433/", "http://0x7f.0.0.1/", "http://127.1/", "http://0177.0.0.1/"];

function Node({
  x,
  y,
  w,
  title,
  sub,
  tone = color.line,
  style,
}: {
  x: number;
  y: number;
  w: number;
  title: string;
  sub?: string;
  tone?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: 150,
        borderRadius: 18,
        border: `2px solid ${tone}`,
        background: color.surface,
        ...style,
      }}
    >
      <div style={{ marginTop: 34, textAlign: "center", fontFamily: sans, fontSize: 32, color: tone === color.line ? color.ink : tone }}>{title}</div>
      {sub && <div style={{ marginTop: 10, textAlign: "center", fontFamily: mono, fontSize: 24, color: color.muted }}>{sub}</div>}
    </div>
  );
}

/** A packet moving along a list of points between two times. */
function packet(f: number, pts: [number, number][], a: number, b: number) {
  const p = tween(f, a, b, 0, pts.length - 1, "inOut");
  const i = Math.min(Math.floor(p), pts.length - 2);
  const k = p - i;
  return { x: pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, y: pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k, on: p > 0 && p < pts.length - 1 };
}

export function SsrfGuard() {
  const f = useCurrentFrame();
  const t = f / FPS;

  // Act 1: spellings collapse to 127.0.0.1, one after another.
  const spell = (i: number) => {
    const at = 1.4 + i * 1.3;
    return { show: tween(f, at, at + 0.5, 0, 1), morph: tween(f, at + 0.6, at + 1.1, 0, 1, "inOut") };
  };
  const act1Out = tween(f, 8, 8.6, 1, 0, "inOut");

  // Act 2: server, public site, internal service.
  const SERVER: [number, number] = [330, 640];
  const PUBLIC: [number, number] = [960, 640];
  const INTERNAL: [number, number] = [1590, 640];
  const plainTo = packet(f, [SERVER, PUBLIC], 9.6, 10.6);
  const plainRedirect = packet(f, [PUBLIC, SERVER], 10.8, 11.6);
  const plainInternal = packet(f, [SERVER, INTERNAL], 11.8, 12.8);
  const secretBack = packet(f, [INTERNAL, SERVER], 13, 14);
  const guardedTo = packet(f, [SERVER, PUBLIC], 15.4, 16.2);
  const guardedRedirect = packet(f, [PUBLIC, SERVER], 16.4, 17.1);
  const gate = tween(f, 17.2, 17.7, 0, 1);
  const act2Out = tween(f, 19.6, 20.2, 1, 0, "inOut");

  // Act 3: DNS answers checked at connect time.
  const answers = tween(f, 21.6, 22.3, 0, 1);
  const flag = tween(f, 22.8, 23.3, 0, 1);

  const r2title = useReveal(8.9);
  const r2plain = useReveal(14, 15);
  const r3 = useReveal(20.4, 24);

  const dot = (p: { x: number; y: number; on: boolean }, label: string, tone: string) =>
    p.on && (
      <div style={{ position: "absolute", left: p.x - 90, top: p.y - 150, width: 180, textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            padding: "8px 18px",
            borderRadius: 24,
            background: tone,
            color: color.bg,
            fontFamily: mono,
            fontSize: 24,
          }}
        >
          {label}
        </div>
      </div>
    );

  return (
    <Stage>
      <Chapter
        items={[
          { at: 0.3, text: "01 · Spellings" },
          { at: 8.8, text: "02 · Redirects" },
          { at: 20.3, text: "03 · DNS" },
          { at: 24.2, text: "The guard" },
        ]}
      />

      {/* Act 1 */}
      <div style={{ opacity: act1Out }}>
        <div style={{ position: "absolute", left: 64, top: 110, fontFamily: serif, fontSize: 56, color: color.ink, ...useReveal(0.4) }}>
          Four URLs, one address
        </div>
        {SPELLINGS.map((u, i) => {
          const { show, morph } = spell(i);
          return (
            <div
              key={u}
              style={{ position: "absolute", left: 160, top: 300 + i * 130, display: "flex", alignItems: "center", gap: 40, opacity: show }}
            >
              <span style={{ fontFamily: mono, fontSize: 46, color: color.warm, width: 620 }}>{u}</span>
              <span style={{ fontFamily: sans, fontSize: 26, color: color.muted, opacity: morph }}>new URL() →</span>
              <span style={{ fontFamily: mono, fontSize: 46, color: color.ink, opacity: morph }}>127.0.0.1</span>
              <span style={{ fontFamily: sans, fontSize: 30, color: color.accent, opacity: tween(f, 6.9, 7.4, 0, 1) }}>refused</span>
            </div>
          );
        })}
      </div>

      {/* Act 2 */}
      {t >= 8.8 && (
        <div style={{ opacity: act2Out }}>
          <div style={{ position: "absolute", left: 64, top: 110, fontFamily: serif, fontSize: 56, color: color.ink, ...r2title }}>
            {t < 15 ? "A plain fetch follows the redirect" : "The guard checks every hop"}
          </div>
          <div
            style={{
              position: "absolute",
              left: SERVER[0] + 170,
              top: SERVER[1] - 2,
              width: PUBLIC[0] - SERVER[0] - 340,
              height: 4,
              background: color.line,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: PUBLIC[0] + 170,
              top: PUBLIC[1] - 2,
              width: INTERNAL[0] - PUBLIC[0] - 340,
              height: 4,
              background: color.line,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: SERVER[0] + 170,
              top: SERVER[1] + 110,
              width: INTERNAL[0] - SERVER[0] - 340,
              textAlign: "center",
              fontFamily: sans,
              fontSize: 24,
              color: color.faint,
            }}
          >
            the internal service is reachable from your server, never from the internet
          </div>
          <Node x={SERVER[0] - 170} y={SERVER[1] - 75} w={340} title="Your server" sub="fetch(userUrl)" />
          <Node x={PUBLIC[0] - 170} y={PUBLIC[1] - 75} w={340} title="Public site" sub="302 → 127.0.0.1" />
          <Node x={INTERNAL[0] - 170} y={INTERNAL[1] - 75} w={340} title="Internal service" sub="127.0.0.1:8080" tone={color.warm} />
          {dot(plainTo, "GET", color.muted)}
          {dot(plainRedirect, "302", color.muted)}
          {dot(plainInternal, "GET", color.warm)}
          {dot(secretBack, "SECRET", color.warm)}
          {dot(guardedTo, "GET", color.accent)}
          {dot(guardedRedirect, "302", color.accent)}
          <div style={{ position: "absolute", left: 160, top: 820, fontFamily: mono, fontSize: 34, color: color.warm, ...r2plain }}>
            plain fetch → "SECRET from 127.0.0.1"
          </div>
          <div
            style={{
              position: "absolute",
              left: SERVER[0] + 200,
              top: SERVER[1] - 60,
              width: 8,
              height: 120,
              background: color.accent,
              opacity: gate,
              borderRadius: 4,
            }}
          />
          <div style={{ position: "absolute", left: 160, top: 820, fontFamily: mono, fontSize: 34, color: color.accent, opacity: gate }}>
            Refused: private address 127.0.0.1
          </div>
        </div>
      )}

      {/* Act 3 */}
      {t >= 20.3 && t < 24.4 && (
        <div style={r3}>
          <div style={{ position: "absolute", left: 64, top: 110, fontFamily: serif, fontSize: 56, color: color.ink }}>
            Hostnames are checked after DNS, at connect time
          </div>
          <div style={{ position: "absolute", left: 200, top: 420, fontFamily: mono, fontSize: 56, color: color.ink }}>localhost</div>
          <div style={{ position: "absolute", left: 600, top: 430, fontFamily: sans, fontSize: 32, color: color.muted, opacity: answers }}>
            resolves to →
          </div>
          <div style={{ position: "absolute", left: 900, top: 360, fontFamily: mono, fontSize: 50, color: color.ink, opacity: answers }}>::1</div>
          <div
            style={{
              position: "absolute",
              left: 900,
              top: 470,
              fontFamily: mono,
              fontSize: 50,
              color: flag > 0.5 ? color.warm : color.ink,
              opacity: answers,
            }}
          >
            127.0.0.1
          </div>
          <div style={{ position: "absolute", left: 1240, top: 470, fontFamily: sans, fontSize: 34, color: color.warm, opacity: flag }}>
            ← private: refuse the connection
          </div>
          <div style={{ position: "absolute", left: 200, top: 660, fontFamily: sans, fontSize: 30, color: color.muted, opacity: flag }}>
            Every answer is checked, inside the connection's own lookup, so a rebinding DNS server can't swap it later.
          </div>
        </div>
      )}

      {/* End card */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", ...useReveal(24.4) }}>
        <div style={{ fontFamily: serif, fontSize: 60, color: color.ink }}>Parse · check literals · check DNS at connect</div>
        <div style={{ fontFamily: mono, fontSize: 42, color: color.accent, marginTop: 30 }}>redirect: "manual", and repeat for every hop</div>
        <div style={{ fontFamily: sans, fontSize: 30, color: color.muted, marginTop: 36 }}>
          6 tests in Node.js with undici, including the BlockList rule that blocks all of IPv4
        </div>
      </div>
    </Stage>
  );
}
