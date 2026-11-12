import { site } from "@/data/site";
import type { BlogCover as Cover } from "@/lib/blog";
import s from "./BlogCover.module.css";

/** 블로그 표지 카드 (목록 썸네일·글 머리). 이미지를 만들지 않고 화면에서 그린다 */
export default function BlogCover({ cover, title, keyword }: { cover: Cover; title: string; keyword: string }) {
  const tag = keyword ? `#${keyword.replace(/\s+/g, "")}` : "";
  return (
    <div className={`${s.cover} ${s[cover.template]} ${title.length > 26 ? s.long : ""}`} aria-hidden="true">
      {cover.template === "photo" && cover.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover.image} alt="" loading="lazy" />
      )}
      <div className={s.in}>
        <div className={s.brand}>
          MAKKINA <small>{(cover.eyebrow || "INSIGHT").toUpperCase()}</small>
        </div>
        <div className={s.mid}>
          {tag && <div className={s.kw}>{tag}</div>}
          <div className={s.title}>{title}</div>
        </div>
        <div className={s.foot}>
          <span>{site.name} 블로그</span>
          <span>{site.phone}</span>
        </div>
      </div>
    </div>
  );
}
