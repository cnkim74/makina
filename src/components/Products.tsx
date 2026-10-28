"use client";

/* eslint-disable @next/next/no-img-element */
import { otherMachines, priceNote, products } from "@/data/content";
import { openInquiry } from "@/lib/inquiry";
import s from "./Products.module.css";

/** 드래곤 라인업 — 애플식 제품 타일. 글은 위, 사진은 아래 */
export default function Products() {
  return (
    <section className="mod mod--alt" id="products" aria-labelledby="products-title">
      <div className="mod-in">
        <span className="lab-k">드래곤 라인업</span>
        <h2 id="products-title">내 밭에 맞는 드래곤.</h2>
        <p className="tag">
          60마력부터 150마력까지 다섯 가지 모델. 트랙터 마력에 맞춰 고르세요. 안동 서후면에서 직접 만들고 직접 고칩니다.
        </p>

        <div className={s.grid}>
          {products.map((p) => (
            <article key={p.id} className={`tile ${s.tile}${p.flagship ? ` ${s.flag}` : ""}`}>
              <div className={s.top}>
                {p.isNew ? <span className={s.new}>NEW</span> : <span className={s.newSpace} aria-hidden="true" />}
                <h3>{p.name}</h3>
                <p className={s.cat}>{p.categoryLabel}</p>
                <p className={s.catch}>{p.catch}</p>
                <p className={s.copy}>{p.copy}</p>
                {p.specs ? (
                  <ul className={s.specs} aria-label={`${p.name} 주요 사양`}>
                    <li>작업 폭 {p.specs.width}</li>
                    <li>{p.specs.hp}</li>
                  </ul>
                ) : (
                  <p className={s.spec}>작업 폭 · 적정 마력 전화 안내</p>
                )}
                <div className={s.links}>
                  <a
                    className="lnk"
                    href="#inquiry"
                    onClick={() => openInquiry("구매 상담", `${p.name} 상담을 원합니다.\n트랙터 마력: \n작업 면적: `)}
                  >
                    상담 남기기
                  </a>
                  <a className="lnk" href="#videos">
                    영상 보기
                  </a>
                </div>
              </div>
              <div className={s.art}>
                {p.image ? (
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

        <div className={s.tableWrap}>
          <table className={s.table}>
            <caption>드래곤 제품 규격</caption>
            <thead>
              <tr>
                <th scope="col">모델</th>
                <th scope="col">작업 폭</th>
                <th scope="col">적용 마력</th>
                <th scope="col">PTO</th>
                <th scope="col">칼날 수</th>
                <th scope="col">무게</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <th scope="row">{p.name}</th>
                  <td>{p.specs?.width ?? "문의"}</td>
                  <td>{p.specs?.hp ?? "문의"}</td>
                  <td>{p.specs?.pto ?? "문의"}</td>
                  <td>{p.specs?.blades ?? (p.id === "dr314" ? "66개" : "문의")}</td>
                  <td>{p.specs?.weight ?? "문의"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={s.note}>{priceNote}</p>

        <div className={s.others}>
          <h3>다른 작업기도 만듭니다.</h3>
          <ul>
            {otherMachines.map((m) => (
              <li key={m.name}>
                <img className={s.otherImg} src={m.image} alt={`${m.name} ${m.label}`} loading="lazy" />
                <b>{m.name}</b>
                <span className={s.otherLabel}>{m.label}</span>
                <p>{m.copy}</p>
                <a
                  className="lnk"
                  href="#inquiry"
                  onClick={() => openInquiry("구매 상담", `${m.name}(${m.label}) 상담을 원합니다.\n트랙터 마력: `)}
                >
                  상담 남기기
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
