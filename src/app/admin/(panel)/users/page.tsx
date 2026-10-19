import { requireUser, type Role } from "@/lib/auth";
import { all, readyDb } from "@/lib/db";
import { deleteMember, updateMember } from "../../actions";
import { ConfirmSubmit, Submit } from "../../_ui/client";
import { Flash, PageHead } from "../../_ui/server";
import a from "../../admin.module.css";

type Status = "pending" | "active" | "disabled";
type Row = { id: number; email: string; name: string; role: Role; status: Status; created_at: string; last_login_at: string | null };

const ROLE: Record<Role, string> = { owner: "대표", admin: "관리자", editor: "편집자" };
const STATUS: Record<Status, string> = { pending: "승인 대기", active: "사용 중", disabled: "막음" };
const PILL: Record<Status, string> = { pending: a.pNew, active: a.pDone, disabled: a.pMuted };

export default async function Users({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const me = await requireUser("admin");
  const sp = await searchParams;
  const db = (await readyDb())!;
  const rows = await all<Row>(
    db,
    `SELECT id, email, name, role, status, created_at, last_login_at FROM users
      ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END, id ASC`,
  );
  // 관리자는 편집자만, 대표는 모두 다룰 수 있다
  const canManage = (r: Row) => r.id !== me.id && (me.role === "owner" || r.role === "editor");
  const roles: Role[] = me.role === "owner" ? ["editor", "admin", "owner"] : ["editor"];

  return (
    <>
      <PageHead
        title="회원"
        desc="직원이 /admin/signup 에서 가입하면 여기에 “승인 대기”로 나타납니다. 상태를 “사용 중”으로 바꾸고 저장하면 로그인할 수 있습니다."
      />
      <Flash msg={sp.msg} />

      <section className={a.card}>
        <h2>권한 안내</h2>
        <ul className={a.check_list}>
          <li>
            <b>편집자</b>
            <span className={a.muted}>문의 확인·메모, 영상·SNS·히어로 수정</span>
          </li>
          <li>
            <b>관리자</b>
            <span className={a.muted}>편집자 일 + 연락처·연결 설정, 문의·파일 삭제, 편집자 승인</span>
          </li>
          <li>
            <b>대표</b>
            <span className={a.muted}>관리자 일 + 관리자·대표 지정, 회원 삭제</span>
          </li>
        </ul>
      </section>

      <div className={a.list} style={{ marginTop: 16 }}>
        {rows.map((r) => (
          <article key={r.id} className={a.item}>
            <div className={a.itemHead}>
              <span className={`${a.pill} ${PILL[r.status]}`}>{STATUS[r.status]}</span>
              <span className={`${a.pill} ${a.pMuted}`}>{ROLE[r.role]}</span>
              <h3>
                {r.name}
                {r.id === me.id && " (나)"}
              </h3>
              <a href={`mailto:${r.email}`} className={a.linkBtn}>
                {r.email}
              </a>
              <span className={a.muted}>
                가입 {r.created_at.slice(0, 10)} · 최근 로그인 {r.last_login_at ? r.last_login_at.slice(0, 16) : "없음"}
              </span>
            </div>
            {canManage(r) && (
              <div className={a.actions}>
                <form action={updateMember} className={a.actions}>
                  <input type="hidden" name="id" value={r.id} />
                  <label className={a.field}>
                    <span>권한</span>
                    <select name="role" defaultValue={r.role}>
                      {roles.map((x) => (
                        <option key={x} value={x}>
                          {ROLE[x]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={a.field}>
                    <span>상태</span>
                    <select name="status" defaultValue={r.status}>
                      {(Object.keys(STATUS) as Status[]).map((s) => (
                        <option key={s} value={s}>
                          {STATUS[s]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Submit>저장</Submit>
                </form>
                {me.role === "owner" && (
                  <form action={deleteMember}>
                    <input type="hidden" name="id" value={r.id} />
                    <ConfirmSubmit message={`${r.name}(${r.email}) 계정을 지울까요?`}>지우기</ConfirmSubmit>
                  </form>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
