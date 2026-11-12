import type { Metadata } from "next";
import Link from "next/link";
import { catalog } from "@/data/content";
import { site } from "@/data/site";
import CatalogBook from "@/components/CatalogBook";
import { readyDb } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { telHref } from "@/lib/types";
import s from "./catalog.module.css";

export const metadata: Metadata = {
  title: `온라인 카탈로그 · ${site.name}`,
  description: `${catalog.title} — DRAGON 하이브리드 모우어 컨디셔너 라인업(210·230·250·280·314)과 사용 효과를 책장 넘기듯 봅니다.`,
  alternates: { canonical: "/catalog" },
  openGraph: { title: `${catalog.title} · ${site.name}`, images: [{ url: catalog.page(1) }] },
};

// 관리자에서 고친 연락처·SNS 가 바로 보이도록 요청마다 그린다
export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const contact = await getSetting(await readyDb(), "contact");
  return (
    <>
      <section className={`mod mod--dark ${s.mod}`} aria-labelledby="catalog-title">
        <div className="mod-in">
          <span className="lab-k">CATALOG</span>
          <h2 id="catalog-title">DRAGON 카탈로그.</h2>
          <p className="tag">
            책장을 넘기듯 보세요. 모서리를 끌거나 화살표를 누르면 넘어갑니다. ({catalog.edition} 판 · {catalog.pages}쪽)
          </p>
          <div className={s.book}>
            <CatalogBook />
          </div>
          <div className={`links on-dark ${s.links}`}>
            <a className="lnk" href={catalog.pdf} download>
              PDF 로 내려받기
            </a>
            <Link className="lnk" href="/#products">
              DRAGON 라인업 보기
            </Link>
          </div>
        </div>
      </section>
      <section className="mod">
        <div className="mod-in">
          <span className="lab-k">CONTACT</span>
          <h2>종이 카탈로그가 필요하세요?</h2>
          <p className="tag">전화 주시면 우편으로 보내 드립니다. 트랙터 마력과 작업 면적을 알려 주시면 맞는 모델도 함께 안내해 드립니다.</p>
          <div className={s.cta}>
            <a href={telHref(contact.phone)} className="btn btn--cta">
              ☏ 전화 상담 {contact.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
