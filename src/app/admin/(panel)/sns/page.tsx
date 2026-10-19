import { requireUser } from "@/lib/auth";
import { all, readyDb } from "@/lib/db";
import { SNS_PLATFORMS, type SnsPlatform } from "@/lib/types";
import { addSns, deleteSns, moveSns, updateSns } from "../../actions";
import { ConfirmSubmit, Submit } from "../../_ui/client";
import { Flash, PageHead } from "../../_ui/server";
import a from "../../admin.module.css";

type Row = { id: number; platform: SnsPlatform; label: string; url: string; visible: number };

export default async function Sns({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  const db = (await readyDb())!;
  const rows = await all<Row>(db, "SELECT id, platform, label, url, visible FROM sns_links ORDER BY sort ASC, id ASC");

  return (
    <>
      <PageHead
        title="SNS"
        desc="유튜브·인스타그램·블로그 같은 채널 주소를 모아 둡니다. 홈페이지 맨 아래에 버튼으로 나타나고, 유튜브 채널은 “작업 영상”의 “유튜브 채널에서 더 보기”로도 연결됩니다."
      />
      <Flash msg={sp.msg} />

      <section className={a.card}>
        <h2>채널 추가</h2>
        <form action={addSns} className={a.form}>
          <div className={`${a.row} ${a.row3}`}>
            <label className={a.field}>
              <span>종류</span>
              <select name="platform" defaultValue="youtube">
                {SNS_PLATFORMS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={a.field}>
              <span>
                버튼 이름 <small>(선택)</small>
              </span>
              <input name="label" maxLength={30} placeholder="예: 성원마끼나 유튜브" />
            </label>
            <label className={a.field}>
              <span>주소</span>
              <input name="url" required placeholder="https://" />
            </label>
          </div>
          <div className={a.actions}>
            <Submit>추가</Submit>
          </div>
        </form>
      </section>

      <h2 style={{ margin: "28px 0 12px", fontSize: 20 }}>연결된 채널 {rows.length}개</h2>
      {rows.length === 0 ? (
        <p className={a.empty}>아직 연결된 채널이 없습니다.</p>
      ) : (
        <div className={a.list}>
          {rows.map((r, i) => (
            <article key={r.id} className={a.item}>
              <form action={updateSns} className={a.form}>
                <input type="hidden" name="id" value={r.id} />
                <div className={`${a.row} ${a.row3}`}>
                  <label className={a.field}>
                    <span>종류</span>
                    <input value={SNS_PLATFORMS.find((p) => p.id === r.platform)?.label ?? r.platform} disabled />
                  </label>
                  <label className={a.field}>
                    <span>버튼 이름</span>
                    <input name="label" defaultValue={r.label} maxLength={30} />
                  </label>
                  <label className={a.field}>
                    <span>주소</span>
                    <input name="url" defaultValue={r.url} required />
                  </label>
                </div>
                <div className={a.actions}>
                  <label className={a.check}>
                    <input type="checkbox" name="visible" defaultChecked={r.visible === 1} /> 홈페이지에 보이기
                  </label>
                  <Submit>저장</Submit>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className={a.linkBtn}>
                    열어 보기 ↗
                  </a>
                </div>
              </form>
              <div className={a.actions}>
                <form action={moveSns}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="dir" value="up" />
                  <button type="submit" className={`${a.btn} ${a.btnGhost} ${a.btnSm}`} disabled={i === 0}>
                    ↑ 앞으로
                  </button>
                </form>
                <form action={moveSns}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="dir" value="down" />
                  <button type="submit" className={`${a.btn} ${a.btnGhost} ${a.btnSm}`} disabled={i === rows.length - 1}>
                    ↓ 뒤로
                  </button>
                </form>
                <form action={deleteSns}>
                  <input type="hidden" name="id" value={r.id} />
                  <ConfirmSubmit message={`${r.label} 채널을 지울까요?`}>지우기</ConfirmSubmit>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
