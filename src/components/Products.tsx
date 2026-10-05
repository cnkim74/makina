"use client";

import { useState } from "react";
import Link from "next/link";
import { products, productTabs, type ProductCategory } from "@/data/content";
import { ProductSilhouette } from "./placeholders";
import s from "./Products.module.css";

export default function Products() {
  const [tab, setTab] = useState<ProductCategory | "all">("all");
  const list = tab === "all" ? products : products.filter((p) => p.category === tab);

  return (
    <section className={`sec ${s.sec}`} id="products" aria-labelledby="products-title">
      <div className="wrap">
        <div className={s.tabs} role="tablist" aria-label="작업기 분류">
          {productTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={tab === t.id ? s.on : undefined}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <h2 className={s.catH} id="products-title">
          대표 작업기
        </h2>

        {list.length === 0 ? (
          <p className={s.empty}>이 분류의 작업기는 준비 중입니다. 전화로 문의해 주세요.</p>
        ) : (
          <div className={s.cards}>
            {list.map((p) => (
              <article key={p.id} className={s.card}>
                <div className={s.img}>
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={`${p.name} ${p.categoryLabel}`} />
                  ) : (
                    <ProductSilhouette variant={p.category} />
                  )}
                  {p.isNew && (
                    <div className={s.new}>
                      <span>NEW</span>
                    </div>
                  )}
                </div>
                <h3>{p.name}</h3>
                <div className={s.c}>{p.categoryLabel}</div>
                <p>
                  <i className={s.catch}>{p.catch}</i>
                  {p.copy}
                </p>
              </article>
            ))}
          </div>
        )}

        <div className={s.more}>
          <Link href="#products" className="pill pill--line">
            작업기 전체 보기
          </Link>
        </div>
      </div>
    </section>
  );
}
