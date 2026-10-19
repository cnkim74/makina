"use client";

import { useState } from "react";
import { products, productTabs, type ProductCategory } from "@/data/content";
import { useSite } from "./SiteData";
import Segmented from "./Segmented";
import { ProductSilhouette } from "./placeholders";
import s from "./Products.module.css";

type TabId = ProductCategory | "all";

/** 대표 작업기 — 애플식 제품 타일. 글은 위, 누끼 사진은 아래 */
export default function Products() {
  const site = useSite();
  const [tab, setTab] = useState<TabId>("all");
  const list = tab === "all" ? products : products.filter((p) => p.category === tab);

  return (
    <section className="mod" id="products" aria-labelledby="products-title">
      <div className="mod-in">
        <span className="lab-k">작업기</span>
        <h2 id="products-title">이름처럼 일하는 기계.</h2>
        <p className="tag">베일러부터 제초기까지, 안동 서후면 공장에서 직접 만들고 직접 고칩니다.</p>

        <Segmented<TabId>
          className={s.seg}
          label="작업기 분류"
          kind="tablist"
          value={tab}
          onChange={setTab}
          options={productTabs.map((t) => ({ id: t.id, label: t.label }))}
        />

        <div className={s.grid} role="tabpanel" aria-label={productTabs.find((t) => t.id === tab)?.label}>
          {list.map((p) => (
            <article key={p.id} className={`tile ${s.tile}`}>
              <div className={s.top}>
                {p.isNew ? <span className={s.new}>NEW</span> : <span className={s.newSpace} aria-hidden="true" />}
                <h3>{p.name}</h3>
                <p className={s.cat}>{p.categoryLabel}</p>
                <p className={s.catch}>{p.catch}</p>
                <p className={s.copy}>{p.copy}</p>
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
                  <img src={p.image} alt={`${p.name} ${p.categoryLabel}`} />
                ) : (
                  <ProductSilhouette variant={p.category} />
                )}
              </div>
            </article>
          ))}

          {list.length === 0 && (
            <div className={`card ${s.empty}`}>
              {tab === "consumable" ? (
                <>
                  <b>네트와 랩 필름은 아래에서 바로 주문하세요.</b>
                  <a className="lnk" href="#consumables">
                    소모품 빠른 주문
                  </a>
                </>
              ) : (
                <>
                  <b>이 분류의 작업기 정보를 정리하고 있습니다.</b>
                  <p>모델과 가격은 전화로 바로 안내해 드립니다.</p>
                  <a className="btn btn--cta" href={site.phoneHref}>
                    ☏ 전화 상담 {site.phone}
                  </a>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
