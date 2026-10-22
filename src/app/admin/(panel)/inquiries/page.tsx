import Link from "next/link";
import { hasRole, requireUser } from "@/lib/auth";
import { all, readyDb } from "@/lib/db";
import { INQUIRY_STATUS, telHref } from "@/lib/types";
import { kstMinute } from "@/lib/time";
import { deleteInquiry, updateInquiry } from "../../actions";
import { ConfirmSubmit, Submit } from "../../_ui/client";
import { Flash, PageHead } from "../../_ui/server";
import a from "../../admin.module.css";

type Status = keyof typeof INQUIRY_STATUS;
type Row = {
  id: number;
  name: string;
  phone: string;
  email: string;
  category: string;
  message: string;
  status: Status;
  memo: string;
  created_at: string;
  updated_at: string;
};

const PILL: Record<Status, string> = { new: a.pNew, in_progress: a.pProg, done: a.pDone };

export default async function Inquiries({ searchParams }: { searchParams: Promise<{ msg?: string; status?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const db = (await readyDb())!;
  const filter = (["new", "in_progress", "done"] as const).find((s) => s === sp.status);

  const rows = await all<Row>(
    db,
    `SELECT id, name, phone, email, category, message, status, memo, created_at, updated_at
       FROM inquiries ${filter ? "WHERE status = ?" : ""} ORDER BY id DESC LIMIT 200`,
    ...(filter ? [filter] : []),
  );
  const counts = await all<{ status: Status; n: number }>(db, "SELECT status, COUNT(*) AS n FROM inquiries GROUP BY status");
  const n = (s: Status) => counts.find((c) => c.status === s)?.n ?? 0;

  return (
    <>
      <PageHead
        title="문의"
        desc="홈페이지 “문의 남기기”로 들어온 내용입니다. 전화드린 뒤 상태를 바꾸고 메모를 남겨 두면 다른 직원도 이어서 볼 수 있습니다."
      />
      <Flash msg={sp.msg} />

      <div className={a.filters}>
        <Link href="/admin/inquiries" aria-current={!filter ? "true" : undefined}>
          전체 {n("new") + n("in_progress") + n("done")}
        </Link>
        {(Object.keys(INQUIRY_STATUS) as Status[]).map((s) => (
          <Link key={s} href={`/admin/inquiries?status=${s}`} aria-current={filter === s ? "true" : undefined}>
            {INQUIRY_STATUS[s]} {n(s)}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className={a.empty}>
          {filter ? "이 상태의 문의가 없습니다." : "아직 들어온 문의가 없습니다. 홈페이지 맨 아래 “문의 남기기”에서 접수됩니다."}
        </p>
      ) : (
        <div className={a.list}>
          {rows.map((r) => (
            <article key={r.id} id={`q${r.id}`} className={a.item}>
              <div className={a.itemHead}>
                <span className={`${a.pill} ${PILL[r.status]}`}>{INQUIRY_STATUS[r.status]}</span>
                <span className={`${a.pill} ${a.pMuted}`}>{r.category}</span>
                <h3>{r.name}</h3>
                <a href={telHref(r.phone)} className={a.linkBtn}>
                  ☏ {r.phone}
                </a>
                {r.email && (
                  <a href={`mailto:${r.email}`} className={a.linkBtn}>
                    {r.email}
                  </a>
                )}
                <span className={a.muted}>접수 {kstMinute(r.created_at)}</span>
              </div>
              <p className={a.message}>{r.message}</p>
              <form action={updateInquiry} className={a.form}>
                <input type="hidden" name="id" value={r.id} />
                <div className={a.row}>
                  <label className={a.field}>
                    <span>상태</span>
                    <select name="status" defaultValue={r.status}>
                      {(Object.keys(INQUIRY_STATUS) as Status[]).map((s) => (
                        <option key={s} value={s}>
                          {INQUIRY_STATUS[s]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={a.field}>
                    <span>
                      메모 <small>직원끼리만 보입니다</small>
                    </span>
                    <input name="memo" defaultValue={r.memo} maxLength={2000} placeholder="예: 10/20 통화, 다음 주 견적 전달" />
                  </label>
                </div>
                <div className={a.actions}>
                  <Submit>저장</Submit>
                  <span className={a.muted}>최근 수정 {kstMinute(r.updated_at)}</span>
                </div>
              </form>
              {hasRole(user, "admin") && (
                <form action={deleteInquiry}>
                  <input type="hidden" name="id" value={r.id} />
                  <ConfirmSubmit message={`${r.name}님의 문의를 지울까요? 되돌릴 수 없습니다.`}>지우기</ConfirmSubmit>
                </form>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
