import Link from "next/link";
import { site } from "@/data/site";
import s from "./MobileDock.module.css";

/** 모바일 하단 고정 버튼 3개 — 전화 상담 / 카톡 문의 / 소모품 주문 */
export default function MobileDock() {
  return (
    <div className={s.dock}>
      <a className={s.tel} href={site.phoneHref}>
        ☏ 전화 상담
      </a>
      <a className={s.kakao} href={site.kakaoHref}>
        카톡 문의
      </a>
      <Link className={s.order} href="#consumables">
        소모품 주문
      </Link>
    </div>
  );
}
