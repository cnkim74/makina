import { hasRole, requireUser } from "@/lib/auth";
import { all, readyDb } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { saveIntegrations } from "../../actions";
import { Submit } from "../../_ui/client";
import { DailyBars, Flash, PageHead } from "../../_ui/server";
import a from "../../admin.module.css";

const DAYS = 30;

const EVENTS: { type: string; label: string; desc: string }[] = [
  { type: "page_view", label: "홈페이지 열람", desc: "홈페이지를 연 횟수" },
  { type: "call_click", label: "전화 버튼", desc: "전화 상담 버튼을 누른 횟수" },
  { type: "kakao_click", label: "카카오톡 버튼", desc: "카카오톡 상담으로 넘어간 횟수" },
  { type: "inquiry_submit", label: "문의 접수", desc: "문의 남기기를 끝까지 보낸 횟수" },
  { type: "video_play", label: "영상 재생", desc: "작업 영상을 눌러 본 횟수" },
  { type: "cta_click", label: "기타 버튼", desc: "제품 보기·길찾기 등 나머지 버튼" },
];

export default async function Analytics({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const db = (await readyDb())!;
  const since = `-${DAYS - 1} days`;

  const [integ, totals, daily, labels] = await Promise.all([
    getSetting(db, "integrations"),
    all<{ type: string; n: number }>(
      db,
      "SELECT type, COUNT(*) AS n FROM events WHERE created_at >= date('now', ?) GROUP BY type",
      since,
    ),
    all<{ day: string; n: number }>(
      db,
      `SELECT date(created_at) AS day, COUNT(*) AS n FROM events
        WHERE type = 'page_view' AND created_at >= date('now', ?) GROUP BY day`,
      since,
    ),
    all<{ type: string; label: string; n: number }>(
      db,
      `SELECT type, label, COUNT(*) AS n FROM events
        WHERE type <> 'page_view' AND label <> '' AND created_at >= date('now', ?)
        GROUP BY type, label ORDER BY n DESC LIMIT 12`,
      since,
    ),
  ]);

  // 기록이 없는 날도 0 으로 채워 30일을 고르게 보여 준다
  const byDay = new Map(daily.map((d) => [d.day, d.n]));
  const today = new Date();
  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - (DAYS - 1 - i));
    const key = d.toISOString().slice(0, 10);
    return { day: key, n: byDay.get(key) ?? 0 };
  });
  const total = (t: string) => totals.find((x) => x.type === t)?.n ?? 0;
  const views = total("page_view");
  const contacts = total("call_click") + total("kakao_click") + total("inquiry_submit");
  const rate = views ? ((contacts / views) * 100).toFixed(1) : "0.0";
  const labelOf = (t: string) => EVENTS.find((e) => e.type === t)?.label ?? t;

  return (
    <>
      <PageHead
        title="분석"
        desc={`최근 ${DAYS}일 동안 홈페이지에서 일어난 일입니다. 이름·전화번호 같은 개인정보는 기록하지 않습니다.`}
      >
        {integ.gaId && (
          <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className={`${a.btn} ${a.btnGhost}`}>
            구글 애널리틱스 열기 ↗
          </a>
        )}
      </PageHead>
      <Flash msg={sp.msg} />

      <div className={`${a.grid} ${a.cols4}`}>
        <div className={`${a.card} ${a.stat}`}>
          <span>홈페이지 열람</span>
          <b>{views}</b>
          <small>하루 평균 {(views / DAYS).toFixed(1)}</small>
        </div>
        <div className={`${a.card} ${a.stat}`}>
          <span>상담 연결</span>
          <b>{contacts}</b>
          <small>전화·카카오톡·문의 합계</small>
        </div>
        <div className={`${a.card} ${a.stat}`}>
          <span>상담 전환율</span>
          <b>{rate}%</b>
          <small>열람 100번 중 상담으로 이어진 수</small>
        </div>
        <div className={`${a.card} ${a.stat}`}>
          <span>영상 재생</span>
          <b>{total("video_play")}</b>
          <small>작업 영상을 눌러 본 횟수</small>
        </div>
      </div>

      <section className={a.card} style={{ marginTop: 16 }}>
        <h2>날짜별 홈페이지 열람</h2>
        <p className={a.sub}>막대에 마우스를 올리면 그날 숫자가 보입니다.</p>
        <DailyBars days={days} label="홈페이지 열람" />
      </section>

      <div className={`${a.grid} ${a.cols2}`} style={{ marginTop: 16 }}>
        <section className={a.card}>
          <h2>행동별 합계</h2>
          <div className={a.tableWrap}>
            <table className={a.table}>
              <thead>
                <tr>
                  <th scope="col">행동</th>
                  <th scope="col">뜻</th>
                  <th scope="col" style={{ textAlign: "right" }}>
                    {DAYS}일
                  </th>
                </tr>
              </thead>
              <tbody>
                {EVENTS.map((e) => (
                  <tr key={e.type}>
                    <td>{e.label}</td>
                    <td className={a.muted}>{e.desc}</td>
                    <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{total(e.type)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={a.card}>
          <h2>많이 누른 버튼</h2>
          {labels.length === 0 ? (
            <p className={a.muted}>아직 기록이 없습니다.</p>
          ) : (
            <div className={a.tableWrap}>
              <table className={a.table}>
                <thead>
                  <tr>
                    <th scope="col">행동</th>
                    <th scope="col">버튼·영상</th>
                    <th scope="col" style={{ textAlign: "right" }}>
                      횟수
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {labels.map((l) => (
                    <tr key={`${l.type}-${l.label}`}>
                      <td>{labelOf(l.type)}</td>
                      <td>{l.label}</td>
                      <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{l.n}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section className={a.card} style={{ marginTop: 16 }}>
        <h2>구글 애널리틱스 연결</h2>
        <p className={a.sub}>
          위 숫자는 홈페이지가 직접 세는 기본 통계입니다. 방문자가 어느 지역·검색어로 들어왔는지까지 보려면 구글 애널리틱스(GA4)를
          연결하세요. 같은 행동(전화 버튼, 문의 접수 등)이 GA4에도 이벤트로 기록됩니다.
        </p>
        <ol className={a.steps}>
          <li>
            <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer">
              analytics.google.com
            </a>{" "}
            에서 계정과 “속성”을 만듭니다. 업종은 “제조”, 플랫폼은 “웹”을 고릅니다.
          </li>
          <li>웹사이트 주소를 넣고 스트림을 만들면 “측정 ID”(G-로 시작)가 나옵니다.</li>
          <li>그 ID를 아래에 붙여 넣고 저장합니다. 몇 분 뒤 GA4 “실시간” 화면에 방문이 보이면 연결된 것입니다.</li>
        </ol>
        {hasRole(user, "admin") ? (
          <form action={saveIntegrations} className={a.form}>
            <input type="hidden" name="from" value="analytics" />
            <label className={a.field}>
              <span>
                측정 ID <small>비우고 저장하면 연결을 끊습니다</small>
              </span>
              <input name="gaId" defaultValue={integ.gaId} placeholder="G-AB12CD34EF" autoComplete="off" />
            </label>
            <div className={a.actions}>
              <Submit>저장</Submit>
              <span className={a.muted}>{integ.gaId ? `연결됨 · ${integ.gaId}` : "아직 연결 전"}</span>
            </div>
          </form>
        ) : (
          <p className={a.muted}>{integ.gaId ? `연결됨 · ${integ.gaId}` : "아직 연결 전 — 관리자가 연결할 수 있습니다."}</p>
        )}
      </section>
    </>
  );
}
