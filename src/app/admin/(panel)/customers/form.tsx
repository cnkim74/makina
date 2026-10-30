import { GRADE, type Grade } from "@/lib/biz";
import a from "../../admin.module.css";

export type CustomerRow = {
  id: number;
  name: string;
  phone: string;
  phone2: string;
  email: string;
  region: string;
  address: string;
  farm: string;
  tractor: string;
  machines: string;
  source: string;
  grade: Grade;
  memo: string;
};

/** 고객 등록·수정 칸 (서버에서 그림) */
export function CustomerForm({ c }: { c?: CustomerRow }) {
  return (
    <>
      {c && <input type="hidden" name="id" value={c.id} />}
      <div className={`${a.row} ${a.row3}`}>
        <label className={a.field}>
          <span>이름 *</span>
          <input name="name" required defaultValue={c?.name} />
        </label>
        <label className={a.field}>
          <span>휴대전화</span>
          <input name="phone" inputMode="tel" defaultValue={c?.phone} placeholder="010-0000-0000" />
        </label>
        <label className={a.field}>
          <span>다른 전화</span>
          <input name="phone2" inputMode="tel" defaultValue={c?.phone2} />
        </label>
      </div>
      <div className={`${a.row} ${a.row3}`}>
        <label className={a.field}>
          <span>지역</span>
          <input name="region" defaultValue={c?.region} placeholder="예: 경북 영주" />
        </label>
        <label className={a.field}>
          <span>주소</span>
          <input name="address" defaultValue={c?.address} />
        </label>
        <label className={a.field}>
          <span>이메일</span>
          <input name="email" type="email" defaultValue={c?.email} />
        </label>
      </div>
      <div className={`${a.row} ${a.row3}`}>
        <label className={a.field}>
          <span>농장 · 사육 규모</span>
          <input name="farm" defaultValue={c?.farm} placeholder="예: 한우 120두, 수단그라스 8ha" />
        </label>
        <label className={a.field}>
          <span>트랙터</span>
          <input name="tractor" defaultValue={c?.tractor} placeholder="예: 110마력" />
        </label>
        <label className={a.field}>
          <span>보유 기계</span>
          <input name="machines" defaultValue={c?.machines} placeholder="예: DRAGON 230 (2025)" />
        </label>
      </div>
      <div className={a.row}>
        <label className={a.field}>
          <span>알게 된 경로</span>
          <input name="source" defaultValue={c?.source} placeholder="박람회 · 소개 · 유튜브 · 홈페이지 문의" />
        </label>
        <label className={a.field}>
          <span>구분</span>
          <select name="grade" defaultValue={c?.grade ?? "prospect"}>
            {(Object.keys(GRADE) as Grade[]).map((g) => (
              <option key={g} value={g}>
                {GRADE[g]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className={a.field}>
        <span>메모</span>
        <textarea name="memo" defaultValue={c?.memo} placeholder="상담 내용, 다음 연락 날짜 등" />
      </label>
    </>
  );
}
