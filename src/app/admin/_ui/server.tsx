import a from "../admin.module.css";

/* 서버에서 그리는 관리자 화면 조각 */

export function PageHead({ title, desc, children }: { title: string; desc?: string; children?: React.ReactNode }) {
  return (
    <div className={a.head}>
      <div>
        <h1>{title}</h1>
        {desc && <p>{desc}</p>}
      </div>
      {children}
    </div>
  );
}

export function Flash({ msg, warn }: { msg?: string; warn?: boolean }) {
  if (!msg) return null;
  return (
    <p className={`${a.flash} ${warn ? a.flashWarn : ""}`} role="status">
      {msg}
    </p>
  );
}

/** 날짜별 막대 (한 계열). 막대 위에 올리면 날짜·값이 뜬다 */
export function DailyBars({ days, label }: { days: { day: string; n: number }[]; label: string }) {
  const W = 720;
  const H = 200;
  const padL = 34;
  const padB = 24;
  const padT = 10;
  const max = Math.max(1, ...days.map((d) => d.n));
  const nice = niceMax(max);
  const bw = (W - padL) / days.length;
  const y = (v: number) => padT + (H - padT - padB) * (1 - v / nice);
  const ticks = [0, nice / 2, nice];

  return (
    <svg className={a.chart} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${label} 날짜별 막대 그래프`}>
      {ticks.map((t) => (
        <g key={t}>
          <line className={a.gridLine} x1={padL} x2={W} y1={y(t)} y2={y(t)} />
          <text x={padL - 6} y={y(t) + 4} textAnchor="end">
            {Math.round(t)}
          </text>
        </g>
      ))}
      {days.map((d, i) => {
        const h = Math.max(0, y(0) - y(d.n));
        const x = padL + i * bw + 1;
        const w = Math.max(1, bw - 2);
        return (
          <g key={d.day}>
            {/* 위쪽만 둥근 막대 */}
            <path
              className={a.bar}
              d={
                h > 4
                  ? `M${x} ${y(0)} V${y(d.n) + 4} Q${x} ${y(d.n)} ${x + 4} ${y(d.n)} H${x + w - 4} Q${x + w} ${y(d.n)} ${x + w} ${y(d.n) + 4} V${y(0)} Z`
                  : `M${x} ${y(0)} V${y(0) - h} H${x + w} V${y(0)} Z`
              }
            >
              <title>{`${d.day} · ${label} ${d.n}`}</title>
            </path>
            {/* 첫날·마지막 날·주 단위 눈금. 마지막 날과 너무 붙는 눈금은 뺀다 */}
            {(i === 0 || i === days.length - 1 || (i % 7 === 0 && days.length - 1 - i >= 4)) && (
              <text
                x={i === days.length - 1 ? x + w : i === 0 ? x : x + w / 2}
                y={H - 6}
                textAnchor={i === days.length - 1 ? "end" : i === 0 ? "start" : "middle"}
              >
                {d.day.slice(5).replace("-", ".")}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function niceMax(v: number) {
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const m = v / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
}
