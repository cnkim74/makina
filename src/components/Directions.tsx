import { site } from "@/data/site";
import { MapPlaceholder } from "./placeholders";
import s from "./Directions.module.css";

export default function Directions() {
  return (
    <section className="mod mod--alt" id="directions" aria-labelledby="dir-title">
      <div className="mod-in">
        <span className="lab-k">오시는 길</span>
        <h2 id="dir-title">안동 서후면, 공장으로 오세요.</h2>
        <p className="tag">작업기를 직접 보고 시연까지 받아 보실 수 있습니다. 오시기 전에 전화 한 번 주세요.</p>

        <div className={s.way}>
          <div className={s.map}>
            <MapPlaceholder />
            <span className={s.pin} aria-hidden="true" />
            <span className="photo-label" style={{ color: "#8a8a8e" }}>
              지도 — 카카오맵 임베드로 교체
            </span>
          </div>

          <div className={s.info}>
            <h3>{site.name} 본사 · 공장</h3>
            <dl>
              <dt>주소</dt>
              <dd>{site.address}</dd>
              <dt>운영시간</dt>
              <dd>{site.hours}</dd>
            </dl>
            <a className={s.tel} href={site.phoneHref}>
              {site.phone}
            </a>
            <div className={s.acts}>
              <a className="btn btn--cta" href={site.phoneHref}>
                ☏ 전화 상담
              </a>
              <a className="btn btn--kakao" href={site.kakaoHref}>
                카카오톡 문의
              </a>
              <a className="btn btn--ghost" href={site.mapHref}>
                길찾기
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
