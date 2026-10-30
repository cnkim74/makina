import Link from "next/link";
import { notFound } from "next/navigation";
import { hasRole, requireUser } from "@/lib/auth";
import { first, readyDb } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { QUOTE_STATUS, parseItems, type QuoteStatus, type VatMode } from "@/lib/biz";
import { kstToday } from "@/lib/time";
import { deleteQuote, quoteToContract, saveQuote } from "../../../biz-actions";
import { ConfirmSubmit, Submit } from "../../../_ui/client";
import { CustomerFields, ItemsEditor } from "../../../_ui/biz-client";
import { customerOptions } from "../../../_ui/biz-server";
import { Flash, PageHead } from "../../../_ui/server";
import a from "../../../admin.module.css";

type Q = {
  id: number; doc_no: string; customer_id: number | null; customer_name: string; customer_phone: string; customer_addr: string;
  title: string; items: string; discount: number; vat_mode: VatMode; valid_until: string; note: string; status: QuoteStatus;
};

function plusDays(n: number) {
  const d = new Date(kstToday() + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export default async function Quote({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ msg?: string; customer?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const sp = await searchParams;
  const db = (await readyDb())!;
  const isNew = id === "new";
  const q = isNew ? null : await first<Q>(db, "SELECT * FROM quotes WHERE id = ?", Number(id));
  if (!isNew && !q) notFound();
  const [customers, book] = await Promise.all([customerOptions(db), getSetting(db, "pricebook")]);
  const pre = isNew && sp.customer ? customers.find((c) => c.id === Number(sp.customer)) : undefined;

  return (
    <>
      <PageHead title={q ? `견적서 ${q.doc_no}` : "새 견적서"} desc="저장한 뒤 “인쇄 · PDF”로 내보냅니다. 계약이 되면 “계약서로 옮기기”를 누르세요.">
        <div className={a.actions}>
          {q && (
            <a href={`/admin/print/quote/${q.id}`} target="_blank" rel="noopener noreferrer" className={a.btn}>
              인쇄 · PDF
            </a>
          )}
          <Link href="/admin/quotes" className={`${a.btn} ${a.btnGhost}`}>
            목록
          </Link>
        </div>
      </PageHead>
      <Flash msg={sp.msg} />

      <section className={a.card}>
        <form action={saveQuote} className={a.form}>
          {q && <input type="hidden" name="id" value={q.id} />}
          <CustomerFields
            customers={customers}
            initial={{
              id: q?.customer_id ?? pre?.id ?? null,
              name: q?.customer_name ?? pre?.name ?? "",
              phone: q?.customer_phone ?? pre?.phone ?? "",
              address: q?.customer_addr ?? pre?.address ?? "",
            }}
          />
          <div className={`${a.row} ${a.row3}`}>
            <label className={a.field}>
              <span>건명</span>
              <input name="title" defaultValue={q?.title ?? "DRAGON 하이브리드 모우어 컨디셔너 견적"} />
            </label>
            <label className={a.field}>
              <span>유효 기간</span>
              <input name="valid_until" type="date" defaultValue={q?.valid_until || plusDays(30)} />
            </label>
            <label className={a.field}>
              <span>상태</span>
              <select name="status" defaultValue={q?.status ?? "draft"}>
                {(Object.keys(QUOTE_STATUS) as QuoteStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {QUOTE_STATUS[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <ItemsEditor initial={q ? parseItems(q.items) : []} discount={q?.discount} vatMode={q?.vat_mode} pricebook={book.items} />
          <label className={a.field}>
            <span>비고</span>
            <textarea name="note" defaultValue={q?.note ?? "운반·설치 포함. 출고 후 시운전 및 사용 교육을 해 드립니다."} />
          </label>
          <div className={a.actions}>
            <Submit>{q ? "저장" : "견적서 만들기"}</Submit>
          </div>
        </form>
      </section>

      {q && (
        <div className={a.actions} style={{ marginTop: 16 }}>
          <form action={quoteToContract}>
            <input type="hidden" name="id" value={q.id} />
            <Submit className={`${a.btn} ${a.btnGhost}`}>계약서로 옮기기</Submit>
          </form>
          {hasRole(user, "admin") && (
            <form action={deleteQuote}>
              <input type="hidden" name="id" value={q.id} />
              <ConfirmSubmit message={`견적서 ${q.doc_no} 를 지울까요?`}>견적서 지우기</ConfirmSubmit>
            </form>
          )}
        </div>
      )}
    </>
  );
}
