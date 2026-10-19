import { quickDoors } from "@/data/content";
import s from "./QuickDoors.module.css";

/** 히어로 바로 아래 — 문 세 개. 구매 상담 · 소모품 · 정비 */
export default function QuickDoors() {
  return (
    <section className="mod" id="doors" aria-labelledby="doors-title">
      <div className="mod-in">
        <span className="lab-k">바로 가기</span>
        <h2 id="doors-title">무엇이 필요하세요?</h2>
        <p className="tag">작업기 상담부터 소모품 주문, 정비 접수까지. 어느 문으로 들어오셔도 전화 한 통이면 됩니다.</p>

        <div className={s.grid}>
          {quickDoors.map((d) => (
            <a key={d.kicker} className={`card ${s.door}`} href={d.href}>
              <span className={s.kicker}>{d.kicker}</span>
              <b className={s.title}>{d.title}</b>
              <p className={s.copy}>{d.copy}</p>
              <em className="lnk">{d.link}</em>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
