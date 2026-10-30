import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { first, readyDb } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { VAT_MODE, parseItems, totals, type VatMode } from "@/lib/biz";
import { kstDate } from "@/lib/time";
import { ItemsTable, Logo, PrintBar, Seller } from "../../doc";
import a from "../../../admin.module.css";

export const dynamic = "force-dynamic";

type Q = { id: number; doc_no: string; customer_name: string; customer_phone: string; customer_addr: string; title: string; items: string; discount: number; vat_mode: VatMode; valid_until: string; note: string; created_at: string; created_by: string };

export default async function QuotePrint({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const db = await readyDb();
  if (!db) redirect("/admin");
  const { id } = await params;
  const q = await first<Q>(db, "SELECT * FROM quotes WHERE id = ?", Number(id));
  if (!q) notFound();
  const contact = await getSetting(db, "contact");
  const items = parseItems(q.items);
  const t = totals(items, q.discount, q.vat_mode);

  return (
    <>
      <PrintBar back={`/admin/quotes/${q.id}`} />
      <article className={a.doc}>
        <div className={a.docHead}>
          <Logo />
          <span>
            No. {q.doc_no}
            <br />
            작성일 {kstDate(q.created_at)}
          </span>
        </div>
        <h1>견 적 서</h1>
        <div className={a.docSign} style={{ marginTop: 0, marginBottom: "6mm" }}>
          <div>
            <p style={{ fontSize: "14pt", fontWeight: 800, marginBottom: "3mm" }}>{q.customer_name} 귀하</p>
            <p>{q.customer_phone}</p>
            <p>{q.customer_addr}</p>
            <p style={{ marginTop: "4mm" }}>
              건명: {q.title}
              <br />
              유효 기간: {q.valid_until || "견적일로부터 30일"}
              <br />
              {VAT_MODE[q.vat_mode]}
            </p>
            <p style={{ marginTop: "4mm" }}>아래와 같이 견적합니다.</p>
          </div>
          <Seller c={contact} />
        </div>
        <ItemsTable items={items} discount={q.discount} t={t} />
        {q.note && (
          <div style={{ marginTop: "6mm" }}>
            <b>비고</b>
            <p style={{ whiteSpace: "pre-wrap" }}>{q.note}</p>
          </div>
        )}
        <p style={{ marginTop: "8mm", fontSize: "9pt", color: "#555" }}>
          담당 {q.created_by || "-"} · 문의 {contact.phone}
        </p>
      </article>
    </>
  );
}
