/**
 * 자리표시 그래픽. 실제 사진·영상·누끼가 오면 교체한다.
 * 모두 서버에서 렌더링되는 순수 SVG라 hydration 문제가 없다.
 */

/** 로고 심볼 「감기는 M」 — 원형 베일 단면처럼 안쪽으로 감기는 나선 + M 획 */
function spiralPath(cx: number, cy: number, r0: number, r1: number, turns: number, n: number) {
  const d: string[] = [];
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    const a = k * turns * Math.PI * 2;
    const r = r0 + (r1 - r0) * k;
    d.push(`${i ? "L" : "M"}${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  return d.join(" ");
}

const LOGO_PATH = `${spiralPath(20, 26, 2, 14, 3.25, 120)} L8 42 L8 8 L20 24 L32 8 L32 42`;

export function LogoMark({ size = 40, color = "var(--hay-gold)" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 44 44" width={size} height={size} aria-hidden="true">
      <path d={LOGO_PATH} fill="none" stroke={color} strokeWidth="3.6" strokeLinecap="square" />
    </svg>
  );
}

function rows(n: number, top: number, w: number, h: number, k: number) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * w;
    const xt = w / 2 + (x - w / 2) * k;
    out.push(<path key={i} d={`M${xt.toFixed(0)} ${top} L${x.toFixed(0)} ${h}`} />);
  }
  return out;
}

/** 들판 + 하늘 + 원형 베일 (히어로용) */
export function FieldScene({ w = 1440, h = 860 }: { w?: number; h?: number }) {
  const horizon = Math.round(h * 0.44);
  const bales: [number, number, number][] = [
    [0.21, 0.7, 38],
    [0.36, 0.74, 46],
    [0.53, 0.69, 34],
    [0.69, 0.77, 50],
    [0.83, 0.71, 40],
  ];
  const id = `fs${w}x${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fb4c4" />
          <stop offset="1" stopColor="#d9d6c6" />
        </linearGradient>
        <linearGradient id={`${id}-fld`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a8c5a" />
          <stop offset="1" stopColor="#5a5a34" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#${id}-sky)`} />
      <rect y={horizon} width={w} height={h - horizon} fill={`url(#${id}-fld)`} />
      <g stroke="#4a4a2a" strokeWidth="2" fill="none" opacity=".5">
        {rows(30, horizon, w, h, 0.12)}
      </g>
      <g fill="#c9a85a" stroke="#8a6f2e" strokeWidth="2">
        {bales.map(([x, y, r], i) => (
          <ellipse key={i} cx={x * w} cy={y * h} rx={r * 1.1} ry={r} />
        ))}
      </g>
    </svg>
  );
}

/** 단색 들판 (띠 섹션, 영상 썸네일용) */
export function FieldRows({ w = 1440, h = 560, fill = "#6b6a4a", stroke = "#4e4c32" }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width={w} height={h} fill={fill} />
      <g stroke={stroke} strokeWidth="2" fill="none">
        {rows(24, 0, w, h, 0.25)}
      </g>
    </svg>
  );
}

/** 공장 내부 (고객지원 띠용) */
export function FactoryScene() {
  return (
    <svg viewBox="0 0 1440 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="1440" height="760" fill="#5e5a50" />
      <rect y="500" width="1440" height="260" fill="#4a463e" />
    </svg>
  );
}

/** 제품 누끼 자리표시 실루엣 */
export function ProductSilhouette({ variant }: { variant: "baler" | "mower" | "weeding" | string }) {
  const label = (
    <text x="200" y="395" textAnchor="middle" fontSize="12" fill="#aaa" fontFamily="sans-serif">
      제품 사진 (누끼, 흰 배경) 교체
    </text>
  );
  return (
    <svg viewBox="0 0 400 420" aria-hidden="true">
      <rect width="400" height="420" fill="#fff" />
      {variant === "mower" ? (
        <>
          <rect x="50" y="200" width="300" height="70" rx="4" fill="#1c1a17" />
          <rect x="50" y="270" width="300" height="24" fill="#d9d4c7" />
          <rect x="330" y="150" width="20" height="60" fill="#8c9196" />
          <circle cx="120" cy="235" r="18" fill="#e0a526" />
          <circle cx="200" cy="235" r="18" fill="#e0a526" />
          <circle cx="280" cy="235" r="18" fill="#e0a526" />
        </>
      ) : variant === "weeding" ? (
        <>
          <rect x="90" y="150" width="220" height="110" rx="6" fill="#d9d4c7" />
          <rect x="90" y="130" width="220" height="24" fill="#e0a526" />
          <rect x="60" y="260" width="280" height="30" fill="#1c1a17" />
          <circle cx="130" cy="320" r="30" fill="#2a2724" />
          <circle cx="270" cy="320" r="30" fill="#2a2724" />
          <rect x="180" y="80" width="40" height="50" fill="#8c9196" />
        </>
      ) : (
        <>
          <rect x="60" y="180" width="200" height="120" rx="6" fill="#d9d4c7" />
          <rect x="60" y="160" width="200" height="24" fill="#1c1a17" />
          <circle cx="110" cy="320" r="34" fill="#2a2724" />
          <circle cx="230" cy="320" r="34" fill="#2a2724" />
          <circle cx="110" cy="320" r="14" fill="#8c9196" />
          <circle cx="230" cy="320" r="14" fill="#8c9196" />
          <rect x="260" y="200" width="90" height="16" fill="#8c9196" />
          <circle cx="300" cy="250" r="26" fill="#e0a526" />
        </>
      )}
      {label}
    </svg>
  );
}

/** 소모품 — 네트 롤 */
export function NetRoll() {
  const lines = [];
  for (let i = 1; i < 8; i++) lines.push(<line key={`v${i}`} x1={70 + i * 15} y1="40" x2={70 + i * 15} y2="220" />);
  for (let j = 1; j < 12; j++) lines.push(<line key={`h${j}`} x1="70" y1={40 + j * 15} x2="190" y2={40 + j * 15} />);
  return (
    <svg viewBox="0 0 260 260" aria-hidden="true">
      <rect width="260" height="260" fill="#fff" />
      <rect x="70" y="40" width="120" height="180" rx="8" fill="#f1efe8" stroke="#1c1a17" strokeWidth="2" />
      <g stroke="#1c1a17" strokeWidth="1" fill="none" opacity=".6">
        {lines}
      </g>
    </svg>
  );
}

/** 소모품 — 랩 필름 롤 */
export function WrapRoll() {
  return (
    <svg viewBox="0 0 260 260" aria-hidden="true">
      <rect width="260" height="260" fill="#fff" />
      <circle cx="130" cy="130" r="80" fill="#f1efe8" stroke="#1c1a17" strokeWidth="2" />
      <circle cx="130" cy="130" r="22" fill="#fff" stroke="#1c1a17" strokeWidth="2" />
      <circle cx="130" cy="130" r="55" fill="none" stroke="#1c1a17" strokeWidth="1" opacity=".4" />
    </svg>
  );
}

/** 지도 자리표시 (카카오맵 임베드로 교체) */
export function MapPlaceholder() {
  return (
    <svg viewBox="0 0 620 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="620" height="420" fill="#eceae4" />
      <g stroke="#fff" strokeWidth="10" fill="none">
        <path d="M0 290 C150 270 230 200 390 190 S590 120 620 90" />
        <path d="M80 0 C120 150 250 230 320 420" />
        <path d="M0 400 L620 360" />
      </g>
      <g stroke="#d6d2c6" strokeWidth="2" fill="none">
        <path d="M0 290 C150 270 230 200 390 190 S590 120 620 90" />
        <path d="M80 0 C120 150 250 230 320 420" />
      </g>
      <text x="330" y="150" fontSize="14" fill="#777" fontFamily="sans-serif">
        서후면
      </text>
      <text x="60" y="380" fontSize="13" fill="#999" fontFamily="sans-serif">
        안동 시내 방면
      </text>
    </svg>
  );
}
