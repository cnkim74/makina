import { site } from "@/data/site";
import { MapPlaceholder } from "./placeholders";
import s from "./Directions.module.css";

export default function Directions() {
  return (
    <section className="sec" id="directions" aria-labelledby="dir-title">
      <div className="wrap">
        <h2 className={s.ttl} id="dir-title">
          오시는 길
        </h2>

        <div className={s.way}>
          <div className={s.map}>
            <MapPlaceholder />
            <div className={s.pin} aria-hidden="true" />
            <span className="photo-label" style={{ color: "#999" }}>
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
              <dt>전화</dt>
              <dd>
                <a className={s.tel} href={site.phoneHref}>
                  {site.phone}
                </a>
              </dd>
            </dl>
            <div className={s.acts}>
              <a className="pill pill--cta" href={site.phoneHref}>
                전화 상담
              </a>
              <a className="pill pill--kakao" href={site.kakaoHref}>
                카카오톡 문의
              </a>
              <a className="pill pill--line" href={site.mapHref}>
                길찾기
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
