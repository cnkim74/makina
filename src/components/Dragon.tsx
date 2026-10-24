"use client";

/* eslint-disable @next/next/no-img-element */
import { dragon, products } from "@/data/content";
import { openInquiry } from "@/lib/inquiry";
import { Wordmark } from "./Logo";
import { useSite } from "./SiteData";
import s from "./Dragon.module.css";

/** 주력 제품 DRAGON — 현장 사진, 밭에서 축사까지, 제품 특징, 개발 배경 (소개서 기준) */
export default function Dragon() {
  const site = useSite();
  return (
    <section className="mod mod--alt" id="dragon" aria-labelledby="dragon-title">
      <div className="mod-in">
        <span className="lab-k">주력 제품</span>
        <h2 id="dragon-title" className={s.title}>
          <span className="sr-only">{dragon.name}</span>
          <Wordmark word="dragon" height={100} />
        </h2>
        <p className={s.label}>{dragon.label}</p>
        <p className="tag">{dragon.copy}</p>
        <p className={s.range}>{dragon.range}</p>
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
                사양 · 가격 보기
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

        <h3 className={s.subhead}>제품 특징.</h3>
        <div className={s.features}>
          {dragon.features.map((f) => (
            <figure key={f.name} className={s.feature}>
              <img src={f.image} alt={`${f.name} 도면`} loading="lazy" />
              <figcaption>
                <b>{f.name}</b>
                {f.copy}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className={s.why}>
          <div className={s.whyText}>
            <span className={s.step}>개발 배경</span>
            <h3>{dragon.why.title}</h3>
            {dragon.why.copy.map((c) => (
              <p key={c}>{c}</p>
            ))}
            <ul className={s.more}>
              {dragon.more.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
          <div className={s.gallery}>
            {dragon.gallery.map((g) => (
              <figure key={g.image}>
                <img src={g.image} alt={`${g.caption} 작업 광경`} loading="lazy" />
                <figcaption>{g.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
