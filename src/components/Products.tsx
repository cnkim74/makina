"use client";

import { products } from "@/data/content";
import s from "./Products.module.css";

/** 드래곤 라인업 — 애플식 제품 타일. 글은 위, 사진은 아래 */
export default function Products() {

  return (
    <section className="mod mod--alt" id="products" aria-labelledby="products-title">
      <div className="mod-in">
        <span className="lab-k">드래곤 라인업</span>
        <h2 id="products-title">내 밭에 맞는 드래곤.</h2>
        <p className="tag">
          다섯 가지 크기 중에 트랙터와 밭에 맞는 모델을 고르세요. 안동 서후면 공장에서 직접 만들고 직접 고칩니다.
        </p>

        <div className={s.grid}>
          {products.map((p) => (
            <article key={p.id} className={`tile ${s.tile}`}>
              <div className={s.top}>
                {p.isNew ? <span className={s.new}>NEW</span> : <span className={s.newSpace} aria-hidden="true" />}
                <h3>{p.name}</h3>
                <p className={s.cat}>{p.categoryLabel}</p>
                <p className={s.catch}>{p.catch}</p>
                <p className={s.copy}>{p.copy}</p>
                <p className={s.spec}>{p.spec ?? "작업 폭 · 적정 마력 전화 안내"}</p>
                <div className={s.links}>
                  <a className="lnk" href="#support">
                    상담 받기
                  </a>
                  <a className="lnk" href="#videos">
                    영상 보기
                  </a>
                </div>
              </div>
              <div className={s.art}>
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt={`${p.name} ${p.categoryLabel}`} loading="lazy" />
                ) : (
                  <div className={s.ph} aria-label={`${p.name} 사진 준비 중`}>
                    <b>{p.name.replace("DRAGON ", "")}</b>
                    <span>사진 준비 중</span>
                  </div>
                )}
              </div>
            </article>
          ))}

        </div>
      </div>
    </section>
  );
}
