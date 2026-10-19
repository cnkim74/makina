/**
 * 히어로 장면 — 세 겹(하늘·들판과 기계·앞풀과 베일) + 선 그리기.
 * 실제 사진이 오면 각 겹을 <img>(새벽/작업등 두 장)로 바꾼다. README "히어로 이미지" 참고.
 *
 * 색은 새벽(불 꺼짐)이 기본이고, 작업등·해 뜸 빛은 별도 겹으로 얹어
 * 부모가 정한 CSS 변수 --lit(0~1)로 켜진다. 선은 --trace(0~1)로 그려진다.
 * 모든 좌표는 viewBox 1600×900. 기계는 가운데(x≈800)에 둬서 세로 화면에서도 잘리지 않는다.
 */

const VB = "0 0 1600 900";

/* 결정적 난수 — 서버·클라이언트가 같은 그림을 그리도록 */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function spiral(cx: number, cy: number, r0: number, r1: number, turns: number, n: number) {
  const d: string[] = [];
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    const a = k * turns * Math.PI * 2;
    const r = r0 + (r1 - r0) * k;
    d.push(`${i ? "L" : "M"}${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  return d.join(" ");
}

function grassBlades(seed: number, count: number) {
  const r = rng(seed);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = r() * 1640 - 20;
    // 가장자리일수록 키가 크다 → 화면을 액자처럼 감싼다
    const edge = Math.min(x, 1600 - x) / 800;
    const h = 40 + r() * 90 + (1 - edge) * 120;
    const w = 4 + r() * 7;
    const lean = (r() - 0.5) * 70;
    const base = 905;
    out.push(
      `M${x.toFixed(0)} ${base} Q${(x + lean * 0.4).toFixed(0)} ${(base - h * 0.6).toFixed(0)} ${(x + lean).toFixed(0)} ${(base - h).toFixed(0)} Q${(x + lean * 0.35 + w).toFixed(0)} ${(base - h * 0.55).toFixed(0)} ${(x + w * 1.6).toFixed(0)} ${base} Z`,
    );
  }
  return out.join(" ");
}

const FG_GRASS = grassBlades(7, 170);
const FG_GRASS_RIM = grassBlades(11, 60);
const BIG_BALE_SPIRAL = spiral(210, 812, 4, 132, 9, 520);

/* 밭고랑(윈드로) — 소실점(800, 612)에서 퍼진다 */
function windrows() {
  const lines: string[] = [];
  for (let i = -14; i <= 14; i++) {
    const xb = 800 + i * 150;
    lines.push(`M${800 + i * 6} 612 L${xb} 900`);
  }
  return lines.join(" ");
}
const WINDROWS = windrows();

const STARS = (() => {
  const r = rng(3);
  return Array.from({ length: 46 }, () => ({ x: r() * 1600, y: r() * 360, s: 0.6 + r() * 1.4 }));
})();

/** 하늘과 먼 산 (배경 겹) */
export function HeroSky() {
  return (
    <svg viewBox={VB} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="hs-dawn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#070b16" />
          <stop offset=".42" stopColor="#141d33" />
          <stop offset=".62" stopColor="#2a3756" />
          <stop offset=".72" stopColor="#4a5675" />
        </linearGradient>
        <linearGradient id="hs-lit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1430" stopOpacity="0" />
          <stop offset=".38" stopColor="#5b3f62" stopOpacity=".45" />
          <stop offset=".58" stopColor="#d9794a" stopOpacity=".85" />
          <stop offset=".7" stopColor="#f6bd62" />
        </linearGradient>
        <radialGradient id="hs-sun" cx="1130" cy="600" r="560" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff1c9" />
          <stop offset=".18" stopColor="#ffc867" stopOpacity=".9" />
          <stop offset=".55" stopColor="#f08a45" stopOpacity=".25" />
          <stop offset="1" stopColor="#f08a45" stopOpacity="0" />
        </radialGradient>
        <filter id="hs-mist" x="-10%" y="-60%" width="120%" height="220%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>

      <rect width="1600" height="900" fill="url(#hs-dawn)" />

      <g style={{ opacity: "calc(1 - var(--lit, 0))" }} fill="#dfe6ff">
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x.toFixed(0)} cy={s.y.toFixed(0)} r={s.s.toFixed(1)} opacity=".55" />
        ))}
      </g>

      <g style={{ opacity: "var(--lit, 0)" }}>
        <rect width="1600" height="900" fill="url(#hs-lit)" />
        <rect width="1600" height="900" fill="url(#hs-sun)" />
      </g>

      {/* 먼 산 → 가까운 산 */}
      <path
        d="M0 522 C120 486 230 474 340 494 S560 452 700 474 S930 432 1070 462 S1310 440 1430 470 S1560 484 1600 472 L1600 900 L0 900Z"
        fill="#28324d"
      />
      <path
        d="M0 522 C120 486 230 474 340 494 S560 452 700 474 S930 432 1070 462 S1310 440 1430 470 S1560 484 1600 472 L1600 900 L0 900Z"
        fill="#c4774b"
        style={{ opacity: "calc(var(--lit, 0) * .32)" }}
      />
      <path
        d="M0 566 C150 532 270 548 410 528 S650 556 790 532 S1010 516 1150 540 S1380 520 1490 536 S1580 548 1600 544 L1600 900 L0 900Z"
        fill="#1a2135"
      />
      <path
        d="M0 566 C150 532 270 548 410 528 S650 556 790 532 S1010 516 1150 540 S1380 520 1490 536 S1580 548 1600 544 L1600 900 L0 900Z"
        fill="#8a4f3a"
        style={{ opacity: "calc(var(--lit, 0) * .22)" }}
      />

      {/* 골짜기 안개 */}
      <g filter="url(#hs-mist)">
        <ellipse cx="420" cy="560" rx="360" ry="26" fill="#9fb1d4" opacity=".16" />
        <ellipse cx="1180" cy="552" rx="420" ry="24" fill="#9fb1d4" opacity=".14" />
        <g style={{ opacity: "var(--lit, 0)" }}>
          <ellipse cx="1180" cy="552" rx="420" ry="24" fill="#ffd59a" opacity=".32" />
          <ellipse cx="420" cy="560" rx="360" ry="26" fill="#ffcf8f" opacity=".18" />
        </g>
      </g>
    </svg>
  );
}

/** 들판과 트랙터 + 원형 베일러 (가운데 겹) */
export function HeroField() {
  return (
    <svg viewBox={VB} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="hf-field" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#20261a" />
          <stop offset="1" stopColor="#0c0f0a" />
        </linearGradient>
        <linearGradient id="hf-field-lit" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9a54a" stopOpacity=".55" />
          <stop offset=".5" stopColor="#b9773a" stopOpacity=".18" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="hf-bale-lit" cx=".72" cy=".3" r=".8">
          <stop offset="0" stopColor="#f3c869" />
          <stop offset=".6" stopColor="#b98632" stopOpacity=".5" />
          <stop offset="1" stopColor="#b98632" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hf-beam" x1="0" y1="0" x2="1" y2=".4">
          <stop offset="0" stopColor="#fff6d8" stopOpacity=".75" />
          <stop offset="1" stopColor="#fff6d8" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hf-beam-back" x1="1" y1="0" x2="0" y2=".5">
          <stop offset="0" stopColor="#fff6d8" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff6d8" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="hf-lamp">
          <stop offset="0" stopColor="#fffbe8" />
          <stop offset=".35" stopColor="#ffe4a0" stopOpacity=".8" />
          <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hf-baler-lit" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2bf4a" />
          <stop offset="1" stopColor="#a8761a" />
        </linearGradient>
      </defs>

      {/* 들판 */}
      <path d="M0 612 L1600 600 L1600 900 L0 900Z" fill="url(#hf-field)" />
      <path d="M0 612 L1600 600 L1600 900 L0 900Z" fill="url(#hf-field-lit)" style={{ opacity: "var(--lit, 0)" }} />
      <path d={WINDROWS} stroke="#2e3522" strokeWidth="5" fill="none" opacity=".8" />
      <path d={WINDROWS} stroke="#e0a526" strokeWidth="2" fill="none" style={{ opacity: "calc(var(--lit, 0) * .22)" }} />

      {/* 먼 원형 베일 */}
      {[
        [330, 640, 13],
        [492, 652, 17],
        [1196, 646, 15],
        [1360, 664, 21],
        [1480, 640, 11],
        [210, 668, 19],
      ].map(([x, y, r], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y + r * 0.9} rx={r * 1.3} ry={r * 0.22} fill="#000" opacity=".35" />
          <circle cx={x} cy={y} r={r} fill="#43371f" />
          <circle cx={x} cy={y} r={r} fill="url(#hf-bale-lit)" style={{ opacity: "var(--lit, 0)" }} />
        </g>
      ))}

      {/* 랩으로 감싼 베일 두 개 */}
      <g>
        <rect x="560" y="676" width="54" height="44" rx="20" fill="#7d8792" />
        <rect x="602" y="684" width="54" height="44" rx="20" fill="#8c96a1" />
        <g style={{ opacity: "var(--lit, 0)" }}>
          <rect x="560" y="676" width="54" height="44" rx="20" fill="#f3d4a0" opacity=".45" />
          <rect x="602" y="684" width="54" height="44" rx="20" fill="#f7dcaa" opacity=".55" />
          <rect x="612" y="690" width="26" height="6" rx="3" fill="#fff" opacity=".6" />
        </g>
      </g>

      {/* 작업등 빛줄기 (앞·뒤) */}
      <g style={{ opacity: "var(--lit, 0)", mixBlendMode: "screen" }}>
        <path d="M968 600 L1600 700 L1600 900 L1180 900 Z" fill="url(#hf-beam)" opacity=".55" />
        <path d="M862 604 L560 700 L640 830 L846 640 Z" fill="url(#hf-beam-back)" opacity=".45" />
      </g>

      {/* 트랙터 + 원형 베일러 — 땅 y=790 */}
      <g transform="translate(0 30)">
        <ellipse cx="840" cy="762" rx="270" ry="14" fill="#000" opacity=".5" />

        {/* 베일러 (뒤) */}
        <path d="M800 712 L852 712" stroke="#0d0e11" strokeWidth="8" />
        <rect x="646" y="598" width="164" height="134" rx="26" fill="#2c2416" />
        <rect
          x="646"
          y="598"
          width="164"
          height="134"
          rx="26"
          fill="url(#hf-baler-lit)"
          style={{ opacity: "calc(var(--lit, 0) * .9)" }}
        />
        <rect x="676" y="586" width="96" height="16" rx="6" fill="#16130d" />
        <circle cx="722" cy="664" r="50" fill="none" stroke="#120f0a" strokeWidth="5" opacity=".7" />
        <rect x="788" y="724" width="46" height="10" rx="3" fill="#121316" />
        <circle cx="698" cy="734" r="26" fill="#0b0c0f" />
        <circle cx="698" cy="734" r="11" fill="#2b2e34" />
        <circle cx="652" cy="640" r="4" fill="#ff3b2f" style={{ opacity: "calc(.25 + var(--lit, 0) * .75)" }} />

        {/* 트랙터 */}
        <path d="M905 652 L1040 664 Q1054 666 1054 680 L1054 708 L905 708 Z" fill="#15171c" />
        <rect x="998" y="608" width="8" height="54" rx="2" fill="#0e0f12" />
        <path d="M842 650 L960 650 L966 712 L838 712 Z" fill="#111317" />
        {/* 캐빈 */}
        <rect x="846" y="556" width="116" height="12" rx="4" fill="#0e0f12" />
        <path d="M856 568 L954 568 L960 650 L850 650 Z" fill="#1c2633" opacity=".95" />
        <path
          d="M856 568 L954 568 L960 650 L850 650 Z"
          fill="#ffcf7a"
          style={{ opacity: "calc(var(--lit, 0) * .55)" }}
        />
        <path d="M856 568 L850 650 M954 568 L960 650 M905 568 L905 650" stroke="#0e0f12" strokeWidth="6" />
        {/* 바퀴 */}
        <path d="M812 690 A70 70 0 0 1 950 690" fill="none" stroke="#0e0f12" strokeWidth="12" />
        <circle cx="880" cy="698" r="62" fill="#0a0b0d" />
        <circle cx="880" cy="698" r="30" fill="#2a2d33" />
        <circle cx="880" cy="698" r="30" fill="#e0a526" style={{ opacity: "calc(var(--lit, 0) * .55)" }} />
        <circle cx="880" cy="698" r="9" fill="#0e0f12" />
        <circle cx="1012" cy="722" r="38" fill="#0a0b0d" />
        <circle cx="1012" cy="722" r="18" fill="#2a2d33" />
        <circle cx="1012" cy="722" r="18" fill="#e0a526" style={{ opacity: "calc(var(--lit, 0) * .55)" }} />
        {/* 작업등 */}
        <g style={{ opacity: "var(--lit, 0)" }}>
          <circle cx="952" cy="560" r="34" fill="url(#hf-lamp)" />
          <circle cx="866" cy="560" r="26" fill="url(#hf-lamp)" />
          <circle cx="1052" cy="688" r="22" fill="url(#hf-lamp)" />
        </g>
        <rect x="944" y="550" width="16" height="8" rx="2" fill="#2a2d33" />
        <rect x="858" y="550" width="16" height="8" rx="2" fill="#2a2d33" />
      </g>
    </svg>
  );
}

/** 앞풀과 큰 원형 베일 (앞 겹) */
export function HeroForeground() {
  return (
    <svg viewBox={VB} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="hg-bale" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#3a2f1d" />
          <stop offset="1" stopColor="#211a10" />
        </radialGradient>
        <radialGradient id="hg-bale-lit" cx=".78" cy=".28" r=".85">
          <stop offset="0" stopColor="#f6cf73" />
          <stop offset=".55" stopColor="#c38a30" stopOpacity=".7" />
          <stop offset="1" stopColor="#7a521b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hg-fog" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b9c6de" stopOpacity="0" />
          <stop offset=".5" stopColor="#b9c6de" stopOpacity=".1" />
          <stop offset="1" stopColor="#b9c6de" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="0" y="740" width="1600" height="120" fill="url(#hg-fog)" />

      {/* 큰 원형 베일 — 단면의 나선 */}
      <circle cx="210" cy="812" r="150" fill="url(#hg-bale)" />
      <circle cx="210" cy="812" r="150" fill="url(#hg-bale-lit)" style={{ opacity: "var(--lit, 0)" }} />
      <path d={BIG_BALE_SPIRAL} fill="none" stroke="#120d06" strokeWidth="3" opacity=".55" />
      <path
        d={BIG_BALE_SPIRAL}
        fill="none"
        stroke="#ffd98a"
        strokeWidth="1.2"
        style={{ opacity: "calc(var(--lit, 0) * .35)" }}
      />
      <circle cx="210" cy="812" r="150" fill="none" stroke="#0d0a05" strokeWidth="6" opacity=".6" />

      {/* 앞풀 */}
      <path d={FG_GRASS} fill="#05070a" />
      <path d={FG_GRASS_RIM} fill="none" stroke="#e0a526" strokeWidth="1.4" style={{ opacity: "calc(var(--lit, 0) * .4)" }} />
    </svg>
  );
}

/** 기계 도면 선 — 흰 선이 스스로 그려진다 (--trace) */
export function HeroTrace() {
  return (
    <svg viewBox={VB} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g
        transform="translate(0 30)"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* 땅선 */}
        <path pathLength={1} d="M560 760 L1120 760" />
        {/* 트랙터 */}
        <circle pathLength={1} cx="880" cy="698" r="62" />
        <circle pathLength={1} cx="880" cy="698" r="30" />
        <circle pathLength={1} cx="1012" cy="722" r="38" />
        <circle pathLength={1} cx="1012" cy="722" r="18" />
        <path pathLength={1} d="M846 556 L962 556 L962 568 L846 568 Z" />
        <path pathLength={1} d="M856 568 L850 650 L838 712 M954 568 L960 650 L966 712" />
        <path pathLength={1} d="M905 652 L1040 664 Q1054 666 1054 680 L1054 708 L966 708" />
        <path pathLength={1} d="M812 690 A70 70 0 0 1 950 690" />
        <path pathLength={1} d="M998 608 L998 662 M1006 608 L1006 662" />
        {/* 베일러 */}
        <rect pathLength={1} x="646" y="598" width="164" height="134" rx="26" />
        <circle pathLength={1} cx="722" cy="664" r="50" />
        <circle pathLength={1} cx="698" cy="734" r="26" />
        <path pathLength={1} d="M800 712 L852 712 M788 734 L834 734" />
        {/* 치수선 */}
        <path pathLength={1} d="M646 520 L1054 520 M646 510 L646 530 M1054 510 L1054 530" strokeWidth="1.4" />
        <path pathLength={1} d="M618 556 L618 760 M608 556 L628 556 M608 760 L628 760" strokeWidth="1.4" />
        {/* 바퀴 중심 십자 */}
        <path pathLength={1} d="M868 698 L892 698 M880 686 L880 710 M710 664 L734 664 M722 652 L722 676" strokeWidth="1.4" />
      </g>
      <g
        fill="#fff"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize="15"
        letterSpacing="1"
        style={{ opacity: "var(--trace, 0)" }}
        transform="translate(0 30)"
      >
        <text x="850" y="506" textAnchor="middle">
          4,080
        </text>
        <text x="600" y="664" textAnchor="end">
          2,650
        </text>
        <text x="722" y="590" textAnchor="middle">
          Ø1,200
        </text>
        <text x="1012" y="788" textAnchor="middle">
          PTO 540
        </text>
      </g>
    </svg>
  );
}
