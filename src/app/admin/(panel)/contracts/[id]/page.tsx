import Link from "next/link";
import { notFound } from "next/navigation";
import { hasRole, requireUser } from "@/lib/auth";
import { first, readyDb } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { CONTRACT_STATUS, parseItems, type ContractStatus, type VatMode } from "@/lib/biz";
import { contractToSales, deleteContract, saveContract } from "../../../biz-actions";
import { ConfirmSubmit, Submit } from "../../../_ui/client";
import { CustomerFields, ItemsEditor } from "../../../_ui/biz-client";
import { customerOptions } from "../../../_ui/biz-server";
import { Flash, PageHead } from "../../../_ui/server";
import a from "../../../admin.module.css";

type C = {
  id: number; doc_no: string; quote_id: number | null; customer_id: number | null; customer_name: string; customer_phone: string;
  customer_addr: string; customer_birth: string; items: string; discount: number; vat_mode: VatMode; deposit: number;
  deposit_date: string; balance_date: string; delivery_date: string; delivery_place: string; warranty: string;
  special_terms: string; status: ContractStatus; signed_on: string;
};

export default async function Contract({
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
  const c = isNew ? null : await first<C>(db, "SELECT * FROM contracts WHERE id = ?", Number(id));
  if (!isNew && !c) notFound();
  const [customers, book, inSales] = await Promise.all([
    customerOptions(db),
    getSetting(db, "pricebook"),
    c ? first<{ n: number }>(db, "SELECT COUNT(*) AS n FROM sales WHERE contract_id = ?", c.id) : null,
  ]);
  const pre = isNew && sp.customer ? customers.find((x) => x.id === Number(sp.customer)) : undefined;

  return (
    <>
      <PageHead title={c ? `계약서 ${c.doc_no}` : "새 계약서"} desc="빈 칸을 채우고 저장한 뒤 인쇄해 양쪽이 서명·날인합니다.">
        <div className={a.actions}>
          {c && (
            <a href={`/admin/print/contract/${c.id}`} target="_blank" rel="noopener noreferrer" className={a.btn}>
              인쇄 · PDF
            </a>
          )}
          {c?.quote_id && (
            <Link href={`/admin/quotes/${c.quote_id}`} className={`${a.btn} ${a.btnGhost}`}>
              원래 견적서
            </Link>
          )}
          <Link href="/admin/contracts" className={`${a.btn} ${a.btnGhost}`}>
            목록
          </Link>
        </div>
      </PageHead>
      <Flash msg={sp.msg} />

      <section className={a.card}>
        <form action={saveContract} className={a.form}>
          {c && <input type="hidden" name="id" value={c.id} />}
          <h2>매수인</h2>
          <CustomerFields
            nameLabel="매수인 (고객)"
            customers={customers}
            initial={{
              id: c?.customer_id ?? pre?.id ?? null,
              name: c?.customer_name ?? pre?.name ?? "",
              phone: c?.customer_phone ?? pre?.phone ?? "",
              address: c?.customer_addr ?? pre?.address ?? "",
            }}
            extra={
              <label className={a.field} style={{ maxWidth: 320 }}>
                <span>
                  생년월일 · 사업자번호 <small>(선택)</small>
                </span>
                <input name="customer_birth" defaultValue={c?.customer_birth} />
              </label>
            }
          />
          <h2>계약 품목</h2>
          <ItemsEditor initial={c ? parseItems(c.items) : []} discount={c?.discount} vatMode={c?.vat_mode} pricebook={book.items} />
          <h2>대금 · 인도</h2>
          <div className={`${a.row} ${a.row3}`}>
            <label className={a.field}>
              <span>계약금 (원)</span>
              <input name="deposit" inputMode="numeric" defaultValue={c?.deposit || ""} />
            </label>
            <label className={a.field}>
              <span>계약금 받는 날</span>
              <input name="deposit_date" type="date" defaultValue={c?.deposit_date} />
            </label>
            <label className={a.field}>
              <span>잔금 받는 날</span>
              <input name="balance_date" type="date" defaultValue={c?.balance_date} />
            </label>
          </div>
          <div className={`${a.row} ${a.row3}`}>
            <label className={a.field}>
              <span>인도(출고) 날</span>
              <input name="delivery_date" type="date" defaultValue={c?.delivery_date} />
            </label>
            <label className={a.field}>
              <span>인도 장소</span>
              <input name="delivery_place" defaultValue={c?.delivery_place} placeholder="매수인 농장" />
            </label>
            <label className={a.field}>
              <span>품질 보증</span>
              <input name="warranty" defaultValue={c?.warranty ?? "출고일로부터 1년 (소모품 제외)"} />
            </label>
          </div>
          <label className={a.field}>
            <span>특약 사항</span>
            <textarea name="special_terms" defaultValue={c?.special_terms} placeholder="예: 융자 실행 후 잔금 지급, 기존 기계 보상 판매 등" />
          </label>
          <div className={a.row}>
            <label className={a.field}>
              <span>상태</span>
              <select name="status" defaultValue={c?.status ?? "draft"}>
                {(Object.keys(CONTRACT_STATUS) as ContractStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {CONTRACT_STATUS[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className={a.field}>
              <span>계약일</span>
              <input name="signed_on" type="date" defaultValue={c?.signed_on} />
            </label>
          </div>
          <div className={a.actions}>
            <Submit>{c ? "저장" : "계약서 만들기"}</Submit>
          </div>
        </form>
      </section>

      {c && hasRole(user, "admin") && (
        <div className={a.actions} style={{ marginTop: 16 }}>
          {inSales?.n ? (
            <Link href="/admin/sales" className={`${a.btn} ${a.btnGhost}`}>
              매출에 올라감 · 보기
            </Link>
          ) : (
            <form action={contractToSales}>
              <input type="hidden" name="id" value={c.id} />
              <Submit className={`${a.btn} ${a.btnGhost}`}>매출로 올리기</Submit>
            </form>
          )}
          <form action={deleteContract}>
            <input type="hidden" name="id" value={c.id} />
            <ConfirmSubmit message={`계약서 ${c.doc_no} 를 지울까요?`}>계약서 지우기</ConfirmSubmit>
          </form>
        </div>
      )}
    </>
  );
}
