import { requireUser } from "@/lib/auth";
import { all, readyDb } from "@/lib/db";
import { ytThumb, ytWatch } from "@/lib/youtube";
import { addVideo, deleteVideo, moveVideo, updateVideo } from "../../actions";
import { ConfirmSubmit, Submit } from "../../_ui/client";
import { Flash, PageHead } from "../../_ui/server";
import a from "../../admin.module.css";

type Row = {
  id: number;
  youtube_id: string;
  title: string;
  caption: string;
  kind: string;
  tags: string;
  published_on: string;
  visible: number;
};

const KINDS = ["작업 영상", "사용법", "제품 소개", "고객 후기"];

export default async function Videos({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  const db = (await readyDb())!;
  const rows = await all<Row>(
    db,
    "SELECT id, youtube_id, title, caption, kind, tags, published_on, visible FROM videos ORDER BY sort ASC, id ASC",
  );
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHead
        title="유튜브 영상"
        desc="유튜브 주소만 넣으면 홈페이지 “작업 영상”에 썸네일과 함께 나타나고, 누르면 사이트 안에서 바로 재생됩니다."
      />
      <Flash msg={sp.msg} />

      <section className={a.card}>
        <h2>영상 추가</h2>
        <p className={a.sub}>제목을 비워 두면 유튜브 제목을 그대로 가져옵니다.</p>
        <form action={addVideo} className={a.form}>
          <label className={a.field}>
            <span>유튜브 주소</span>
            <input name="url" required placeholder="https://youtu.be/... 또는 https://www.youtube.com/watch?v=..." />
          </label>
          <div className={a.row}>
            <label className={a.field}>
              <span>
                제목 <small>(선택)</small>
              </span>
              <input name="title" maxLength={120} />
            </label>
            <label className={a.field}>
              <span>
                썸네일 자막 <small>{"{ }"} 로 감싼 말은 노란색 · 줄바꿈은 그대로</small>
              </span>
              <input name="caption" maxLength={80} placeholder="무른 논에서 {한 번에} 베고 묶기" />
            </label>
          </div>
          <div className={`${a.row} ${a.row3}`}>
            <label className={a.field}>
              <span>종류</span>
              <select name="kind" defaultValue="작업 영상">
                {KINDS.map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </label>
            <label className={a.field}>
              <span>
                해시태그 <small>쉼표로 구분</small>
              </span>
              <input name="tags" placeholder="비무꼬, 수확철" />
            </label>
            <label className={a.field}>
              <span>날짜</span>
              <input name="date" type="date" defaultValue={today} />
            </label>
          </div>
          <div className={a.actions}>
            <Submit>영상 올리기</Submit>
          </div>
        </form>
      </section>

      <h2 style={{ margin: "28px 0 12px", fontSize: 20 }}>올린 영상 {rows.length}개</h2>
      {rows.length === 0 ? (
        <p className={a.empty}>아직 올린 영상이 없습니다. 지금 홈페이지에는 예시 영상 카드가 보입니다.</p>
      ) : (
        <div className={a.list}>
          {rows.map((r, i) => (
            <article key={r.id} className={a.item}>
              <div className={a.videoRow}>
                <a href={ytWatch(r.youtube_id)} target="_blank" rel="noopener noreferrer" className={a.thumb}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ytThumb(r.youtube_id)} alt={`${r.title} 썸네일`} loading="lazy" />
                </a>
                <form action={updateVideo} className={a.form}>
                  <input type="hidden" name="id" value={r.id} />
                  <div className={a.row}>
                    <label className={a.field}>
                      <span>제목</span>
                      <input name="title" defaultValue={r.title} maxLength={120} />
                    </label>
                    <label className={a.field}>
                      <span>썸네일 자막</span>
                      <input name="caption" defaultValue={r.caption} maxLength={80} />
                    </label>
                  </div>
                  <div className={`${a.row} ${a.row3}`}>
                    <label className={a.field}>
                      <span>종류</span>
                      <select name="kind" defaultValue={r.kind}>
                        {[...new Set([...KINDS, r.kind])].map((k) => (
                          <option key={k}>{k}</option>
                        ))}
                      </select>
                    </label>
                    <label className={a.field}>
                      <span>해시태그</span>
                      <input name="tags" defaultValue={safeTags(r.tags).join(", ")} />
                    </label>
                    <label className={a.field}>
                      <span>날짜</span>
                      <input name="date" type="date" defaultValue={r.published_on} />
                    </label>
                  </div>
                  <div className={a.actions}>
                    <label className={a.check}>
                      <input type="checkbox" name="visible" defaultChecked={r.visible === 1} /> 홈페이지에 보이기
                    </label>
                    <Submit>저장</Submit>
                  </div>
                </form>
              </div>
              <div className={a.actions}>
                <form action={moveVideo}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="dir" value="up" />
                  <button type="submit" className={`${a.btn} ${a.btnGhost} ${a.btnSm}`} disabled={i === 0}>
                    ↑ 앞으로
                  </button>
                </form>
                <form action={moveVideo}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="dir" value="down" />
                  <button type="submit" className={`${a.btn} ${a.btnGhost} ${a.btnSm}`} disabled={i === rows.length - 1}>
                    ↓ 뒤로
                  </button>
                </form>
                <form action={deleteVideo}>
                  <input type="hidden" name="id" value={r.id} />
                  <ConfirmSubmit message={`“${r.title}” 영상을 목록에서 뺄까요? 유튜브의 원본은 그대로입니다.`}>목록에서 빼기</ConfirmSubmit>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function safeTags(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}
