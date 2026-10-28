/* eslint-disable @next/next/no-img-element */
import { feeding } from "@/data/content";
import s from "./Feeding.module.css";

/** 축사에서 차이가 납니다 — 소개서 "급여효과". 2026-10-28 교정으로 "작업 흐름" 자리를 대신한다 */
export default function Feeding() {
  return (
    <section className="mod" id="feeding" aria-labelledby="feeding-title">
      <div className="mod-in">
        <span className="lab-k">급여 효과</span>
        <h2 id="feeding-title">{feeding.title}</h2>
        <p className="tag">{feeding.copy}</p>

        <div className={s.wrap}>
          <figure className={s.photo}>
            <img src={feeding.image} alt={feeding.imageAlt} loading="lazy" />
          </figure>
          <ol className={s.list}>
            {feeding.effects.map((e, i) => (
              <li key={e.title}>
                <span className={s.num}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{e.title}</h3>
                  <p>{e.copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <figure className={s.side}>
          <img src={feeding.side} alt={feeding.sideAlt} loading="lazy" />
        </figure>
      </div>
    </section>
  );
}
