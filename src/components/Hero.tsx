import Link from "next/link";
import { site } from "@/data/site";
import { FieldScene } from "./placeholders";
import s from "./Hero.module.css";

const SLIDES = ["01", "02", "03", "04", "05"];

export default function Hero() {
  return (
    <section className={s.hero} aria-label="메인 소개">
      <div className={`photo ${s.photo}`}>
        <FieldScene />
        <span className="photo-label">현장 영상 루프 — 안동 서후면 들판, 비무꼬 작업 중 (교체)</span>
      </div>
      <div className={s.shade} />

      <h1 className={s.slogan}>
        <span className={s.sloganLine}>베고, 모으고,</span>
        <span className={s.sloganLine}>묶고, 감싸다.</span>
        <small>{site.sloganSub}</small>
      </h1>

      <div className={s.idx} aria-hidden="true">
        {SLIDES.map((n, i) => (
          <span key={n} className={i === 0 ? s.on : undefined}>
            {n}
          </span>
        ))}
        <div className={s.bar} />
        <div className={s.pause} />
      </div>

      <div className={s.panel}>
        <h2>{site.tagline}</h2>
        <Link href="#products">작업기 보기</Link>
      </div>
    </section>
  );
}
