import { hasRole, requireUser } from "@/lib/auth";
import { all, readyDb } from "@/lib/db";
import { getBucket } from "@/lib/cf";
import { cardToCustomer, deleteCard, saveCard } from "../../biz-actions";
import { ConfirmSubmit, Submit } from "../../_ui/client";
import { Flash, PageHead } from "../../_ui/server";
import a from "../../admin.module.css";

type Card = {
  id: number; name: string; company: string; title: string; phone: string; mobile: string; email: string; address: string;
  tags: string; memo: string; met_on: string; front_key: string; back_key: string;
};

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;
const img = (k: string) => `/api/admin/file/${k}`;

function Fields({ c }: { c?: Card }) {
  return (
    <>
      {c && <input type="hidden" name="id" value={c.id} />}
      <div className={`${a.row} ${a.row3}`}>
        <label className={a.field}>
          <span>이름 *</span>
          <input name="name" required defaultValue={c?.name} />
        </label>
        <label className={a.field}>
          <span>회사 · 농장</span>
          <input name="company" defaultValue={c?.company} />
        </label>
        <label className={a.field}>
          <span>직함</span>
          <input name="title" defaultValue={c?.title} />
        </label>
      </div>
      <div className={`${a.row} ${a.row3}`}>
        <label className={a.field}>
          <span>휴대전화</span>
          <input name="mobile" inputMode="tel" defaultValue={c?.mobile} />
        </label>
        <label className={a.field}>
          <span>사무실 전화</span>
          <input name="phone" inputMode="tel" defaultValue={c?.phone} />
        </label>
        <label className={a.field}>
          <span>이메일</span>
          <input name="email" type="email" defaultValue={c?.email} />
        </label>
      </div>
      <div className={`${a.row} ${a.row3}`}>
        <label className={a.field}>
          <span>주소</span>
          <input name="address" defaultValue={c?.address} />
        </label>
        <label className={a.field}>
          <span>
            분류 <small>· 쉼표로 여러 개</small>
          </span>
          <input name="tags" defaultValue={c?.tags} placeholder="대리점, 박람회 2026, 부품업체" />
        </label>
        <label className={a.field}>
          <span>받은 날</span>
          <input name="met_on" type="date" defaultValue={c?.met_on} />
        </label>
      </div>
      <div className={a.row}>
        <label className={a.field}>
          <span>명함 앞면 사진 {c?.front_key && <small>· 새로 고르면 바뀜</small>}</span>
          <input name="front" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" />
        </label>
        <label className={a.field}>
          <span>명함 뒷면 사진</span>
          <input name="back" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" />
        </label>
      </div>
      <label className={a.field}>
        <span>메모</span>
        <textarea name="memo" defaultValue={c?.memo} placeholder="어디서 만났는지, 무슨 이야기를 했는지" />
      </label>
    </>
  );
}

export default async function Cards({ searchParams }: { searchParams: Promise<{ msg?: string; q?: string; tag?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const db = (await readyDb())!;
  const q = (sp.q ?? "").trim();
  const tag = (sp.tag ?? "").trim();
  const like = `%${q}%`;
  const [cards, tagRows, bucket] = await Promise.all([
    all<Card>(
      db,
      `SELECT * FROM name_cards
        WHERE (? = '' OR name LIKE ? OR company LIKE ? OR phone LIKE ? OR mobile LIKE ? OR email LIKE ? OR memo LIKE ? OR address LIKE ?)
          AND (? = '' OR (',' || replace(tags, ' ', '') || ',') LIKE ?)
        ORDER BY updated_at DESC LIMIT 500`,
      q, like, like, like, like, like, like, like, tag, `%,${tag.replace(/\s/g, "")},%`,
    ),
    all<{ tags: string }>(db, "SELECT tags FROM name_cards WHERE tags <> ''"),
    getBucket(),
  ]);
  const tags = [...new Set(tagRows.flatMap((r) => r.tags.split(",").map((t) => t.trim()).filter(Boolean)))].sort();

  return (
    <>
      <PageHead title="네임카드" desc="받은 명함을 사진과 함께 정리합니다. 휴대폰으로 열면 바로 촬영해 올릴 수 있고, 연락처 파일(vCard)로 휴대폰에 저장할 수 있습니다." />
      <Flash msg={sp.msg} />
      {!bucket && <Flash msg="파일 저장소(R2)가 연결되지 않아 명함 사진은 저장되지 않습니다. 글자 정보는 저장됩니다." warn />}

      <form className={a.search} role="search">
        <label className={a.field}>
          <span>찾기</span>
          <input name="q" defaultValue={q} placeholder="이름·회사·전화·메모" />
        </label>
        <label className={a.field}>
          <span>분류</span>
          <select name="tag" defaultValue={tag}>
            <option value="">전체</option>
            {tags.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <button className={a.btn} type="submit">
          찾기
        </button>
      </form>

      <details className={a.card} style={{ marginBottom: 16 }} open={cards.length === 0 && !q && !tag}>
        <summary>
          <b>+ 명함 등록</b>
        </summary>
        <form action={saveCard} className={a.form} style={{ marginTop: 14 }}>
          <Fields />
          <div className={a.actions}>
            <Submit>등록</Submit>
          </div>
        </form>
      </details>

      <div className={a.cardGrid}>
        {cards.length === 0 && <p className={a.muted}>{q || tag ? "찾는 명함이 없습니다." : "아직 등록한 명함이 없습니다."}</p>}
        {cards.map((c) => (
          <article key={c.id} className={`${a.card} ${a.nameCard}`}>
            {(c.front_key || c.back_key) && (
              <div className={a.cardImgs}>
                {[c.front_key, c.back_key].filter(Boolean).map((k) => (
                  <a key={k} href={img(k)} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img(k)} alt={`${c.name} 명함 사진`} loading="lazy" />
                  </a>
                ))}
              </div>
            )}
            <div>
              <h2 style={{ marginBottom: 2 }}>{c.name}</h2>
              <p className={a.muted}>{[c.company, c.title].filter(Boolean).join(" · ") || " "}</p>
            </div>
            <dl className={a.kv}>
              {c.mobile && (
                <>
                  <dt>휴대전화</dt>
                  <dd>
                    <a href={tel(c.mobile)}>{c.mobile}</a>
                  </dd>
                </>
              )}
              {c.phone && (
                <>
                  <dt>사무실</dt>
                  <dd>
                    <a href={tel(c.phone)}>{c.phone}</a>
                  </dd>
                </>
              )}
              {c.email && (
                <>
                  <dt>이메일</dt>
                  <dd>
                    <a href={`mailto:${c.email}`}>{c.email}</a>
                  </dd>
                </>
              )}
              {c.address && (
                <>
                  <dt>주소</dt>
                  <dd>{c.address}</dd>
                </>
              )}
              {c.met_on && (
                <>
                  <dt>받은 날</dt>
                  <dd>{c.met_on}</dd>
                </>
              )}
              {c.tags && (
                <>
                  <dt>분류</dt>
                  <dd>{c.tags}</dd>
                </>
              )}
            </dl>
            {c.memo && <p style={{ whiteSpace: "pre-wrap" }}>{c.memo}</p>}
            <div className={a.actions}>
              <a href={`/api/admin/vcard/${c.id}`} className={`${a.btn} ${a.btnGhost} ${a.btnSm}`}>
                휴대폰 연락처로 저장
              </a>
              <form action={cardToCustomer}>
                <input type="hidden" name="id" value={c.id} />
                <Submit className={`${a.btn} ${a.btnGhost} ${a.btnSm}`}>고객으로 등록</Submit>
              </form>
            </div>
            <details>
              <summary className={a.linkBtn}>고치기</summary>
              <form action={saveCard} className={a.form} style={{ marginTop: 12 }}>
                <Fields c={c} />
                <div className={a.actions}>
                  <Submit>저장</Submit>
                </div>
              </form>
              {hasRole(user, "admin") && (
                <form action={deleteCard} style={{ marginTop: 10 }}>
                  <input type="hidden" name="id" value={c.id} />
                  <ConfirmSubmit message={`${c.name} 명함을 지울까요? 사진도 함께 지워집니다.`}>명함 지우기</ConfirmSubmit>
                </form>
              )}
            </details>
          </article>
        ))}
      </div>
    </>
  );
}
