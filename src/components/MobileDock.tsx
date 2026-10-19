import { site } from "@/data/site";
import s from "./MobileDock.module.css";

/** 모바일 하단 — 떠 있는 유리 도크. 전화 상담 / 카톡 문의 / 소모품 주문 */
export default function MobileDock() {
  return (
    <div className={s.wrap}>
      <div className={`glass ${s.dock}`}>
        <a className={s.tel} href={site.phoneHref}>
          ☏ 전화 상담
        </a>
        <a className={s.kakao} href={site.kakaoHref}>
          카톡 문의
        </a>
        <a className={s.order} href="#consumables">
          소모품 주문
        </a>
      </div>
    </div>
  );
}
