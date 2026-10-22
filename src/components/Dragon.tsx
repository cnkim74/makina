"use client";

/* eslint-disable @next/next/no-img-element */
import { dragon, products } from "@/data/content";
import { openInquiry } from "@/lib/inquiry";
import { useSite } from "./SiteData";
import s from "./Dragon.module.css";

/** 주력 제품 DRAGON — 큰 현장 사진, 밭에서 축사까지의 이야기, 구조 */
export default function Dragon() {
  const site = useSite();
  return (
    <section className="mod mod--alt" id="dragon" aria-labelledby="dragon-title">
      <div className="mod-in">
        <span className="lab-k">주력 제품</span>
        <h2 id="dragon-title" className={s.title}>
          {dragon.name}
        </h2>
        <p className={s.label}>{dragon.label}</p>
        <p className="tag">{dragon.copy}</p>
        <div className={s.models} aria-label="드래곤 모델">
          {products.map((p) => (
            <a key={p.id} href="#products">
              {p.name.replace("DRAGON ", "")}
            </a>
          ))}
        </div>

        <div className={s.lead}>
          <figure className={s.field}>
            <img src={dragon.heroImage} alt={dragon.heroAlt} loading="lazy" />
          </figure>
          <div className={s.machine}>
            <img src={dragon.render} alt={dragon.renderAlt} loading="lazy" />
            <p className={s.catch}>{dragon.catch}</p>
            <div className={s.acts}>
              <a className="btn btn--cta" href={site.phoneHref}>
                ☏ 드래곤 상담
              </a>
              <a className="lnk" href="#products">
                모델 보기
              </a>
              <a
                className="lnk"
                href="#inquiry"
                onClick={() => openInquiry("구매 상담", "드래곤 상담을 원합니다.\n트랙터 마력: \n작업 면적: ")}
              >
                문의 남기기
              </a>
            </div>
          </div>
        </div>

        <ol className={s.story}>
          {dragon.story.map((st, i) => (
            <li key={st.step} className={s.scene}>
              <figure>
                <img src={st.image} alt={st.alt} loading="lazy" />
              </figure>
              <div className={s.sceneText}>
                <span className={s.step}>
                  {i + 1} · {st.step}
                </span>
                <h3>{st.title}</h3>
                <p>{st.copy}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className={s.parts}>
          {dragon.parts.map((pt) => (
            <figure key={pt.name} className={s.part}>
              <img src={pt.image} alt={`드래곤 ${pt.name} 3D 도면`} loading="lazy" />
              <figcaption>
                <b>{pt.name}</b>
                {pt.copy}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
