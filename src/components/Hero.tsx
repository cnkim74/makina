"use client";

import { useEffect, useRef, useState } from "react";
import { heroImages, heroSketchStory, type HeroLayerImage } from "@/data/content";
import { Wordmark } from "./Logo";
import { useSiteData } from "./SiteData";
import { HeroField, HeroForeground, HeroSky, HeroTrace } from "./placeholders/HeroScene";
import s from "./Hero.module.css";

/** 실제 사진이 있으면 새벽·작업등 두 장을 겹치고, 없으면 SVG 자리표시 */
function LayerArt({ img, children }: { img?: HeroLayerImage; children: React.ReactNode }) {
  if (!img) return <>{children}</>;
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={s.img} src={img.dawn} alt="" decoding="async" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={`${s.img} ${s.imgLit}`} src={img.lit} alt="" decoding="async" />
    </>
  );
}

/** 영상이 없을 때의 SVG 장면 (세 겹 + 도면 선) */
function SketchScene() {
  return (
    <>
      <div className={`${s.layer} ${s.bg}`} aria-hidden="true">
        <div className={s.drift}>
          <LayerArt img={heroImages.bg}>
            <HeroSky />
          </LayerArt>
        </div>
      </div>
      <div className={`${s.layer} ${s.mid}`} aria-hidden="true">
        <div className={s.drift}>
          <LayerArt img={heroImages.mid}>
            <HeroField />
          </LayerArt>
          <div className={s.trace}>
            <HeroTrace />
          </div>
        </div>
      </div>
      <div className={`${s.layer} ${s.fg}`} aria-hidden="true">
        <div className={s.drift}>
          <LayerArt img={heroImages.fg}>
            <HeroForeground />
          </LayerArt>
        </div>
      </div>
      <div className={s.vignette} aria-hidden="true" />
    </>
  );
}

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
/** p 가 a→b 를 지나는 동안 0→1 (부드럽게) */
const ramp = (p: number, a: number, b: number) => {
  const t = clamp((p - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * 영상 재생 방식.
 * scrub: 데스크톱 — 스크롤이 곧 재생 헤드 (ZIPLAN식)
 * loop:  터치 기기·데이터 절약 — 자동 반복 재생
 * still: 움직임 줄이기 — 한 장면
 */
type Mode = "scrub" | "loop" | "still";

function pickMode(): Mode {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "still";
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  const touch = window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 900;
  if (touch || nav.connection?.saveData) return "loop";
  return "scrub";
}

/**
 * 히어로 — ZIPLAN식 스크롤 장면.
 * 영상이 있으면: 베일 클로즈업 → 카메라가 물러나며 트랙터·베일러 → 들판 전체 → 흰 바탕으로 녹아듦.
 * 영상이 없으면: 새벽 들판 → 작업등(--lit) → 도면 선(--trace) → 베일로 다가감(--zoom).
 * 스크롤 값은 리렌더 없이 CSS 변수와 video.currentTime 으로만 흘려보내고, 캡션이 바뀔 때만 상태를 갱신한다.
 */
export default function Hero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cap, setCap] = useState(-1);
  const [headAway, setHeadAway] = useState(false);
  const [mode, setMode] = useState<Mode | null>(null);
  // 영상의 첫 장면이 실제로 그려졌는지. 그 전까지는 포스터 사진을 위에 덮어 둔다
  const [frameReady, setFrameReady] = useState(false);

  // 관리자 "히어로" 화면에서 고친 영상·캡션 (DB 가 없으면 src/data 기본값)
  const { site, hero } = useSiteData();
  const heroVideo = hero.video;
  const story = heroVideo ? hero.story : heroSketchStory;

  // 재생 방식 정하기 (서버 렌더 때는 포스터만 보인다)
  useEffect(() => {
    // 브라우저에서만 알 수 있는 값(움직임 줄이기·터치 기기)으로 한 번 정한다
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(pickMode());
  }, []);

  // 영상 소스 연결
  useEffect(() => {
    const v = videoRef.current;
    if (!heroVideo || !v || !mode || mode === "still") return;
    v.muted = true;
    const src = mode === "scrub" ? heroVideo.desktop : heroVideo.mobile;
    // 크롬·엣지·파이어폭스는 VP9 WebM 이 스크롤 되감기에 더 안정적이다. 사파리(애플)는 MP4.
    // H.264 를 못 트는 브라우저도 WebM 으로 간다.
    const apple = /Apple/.test(navigator.vendor);
    const webm = v.canPlayType('video/webm; codecs="vp9"') !== "";
    const mp4 = v.canPlayType('video/mp4; codecs="avc1.640028"') !== "";
    v.src = (webm && !apple) || !mp4 ? src.webm : src.mp4;

    // 크롬은 한 번도 재생하지 않은 영상의 시점을 옮겨도 poster 를 계속 보여 줄 수 있다.
    // 그래서 poster 속성 대신 위에 덮은 사진을, 실제 장면이 그려지면 걷어 낸다.
    const shown = () => {
      if (v.readyState >= 2) setFrameReady(true);
    };
    v.addEventListener("loadeddata", shown);
    v.addEventListener("seeked", shown);
    v.addEventListener("playing", shown);
    if (mode === "loop") {
      v.loop = true;
      v.play().catch(() => {
        /* 자동 재생이 막히면 포스터가 그대로 보인다 */
      });
    } else {
      v.load();
    }
    return () => {
      v.removeEventListener("loadeddata", shown);
      v.removeEventListener("seeked", shown);
      v.removeEventListener("playing", shown);
    };
  }, [mode, heroVideo]);

  // 스크롤 → CSS 변수 · 캡션 · (scrub) 재생 헤드
  useEffect(() => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    if (!wrap || !stage || !mode) return;

    if (mode === "still") {
      stage.style.setProperty("--lit", "1");
      return;
    }

    let raf = 0;
    let lastCap = -2;
    let lastAway: boolean | null = null;

    // scrub: 목표 시각을 향해 부드럽게 따라간다
    let target = 0;
    let seekRaf = 0;
    const seekTick = () => {
      seekRaf = 0;
      const v = videoRef.current;
      if (!v || !v.duration || Number.isNaN(v.duration)) return;
      const cur = v.currentTime;
      const d = target - cur;
      if (Math.abs(d) < 1 / 48) return;
      if (!v.seeking) v.currentTime = Math.abs(d) < 0.12 ? target : cur + d * 0.35;
      seekRaf = requestAnimationFrame(seekTick);
    };
    const kickSeek = () => {
      if (!seekRaf) seekRaf = requestAnimationFrame(seekTick);
    };

    const update = () => {
      raf = 0;
      const rect = wrap.getBoundingClientRect();
      const travel = Math.max(1, wrap.offsetHeight - window.innerHeight);
      const p = clamp(-rect.top / travel);

      const head = 1 - ramp(p, 0.02, 0.15);
      stage.style.setProperty("--p", p.toFixed(4));
      stage.style.setProperty("--head", head.toFixed(4));
      stage.style.setProperty("--veil", ramp(p, 0.9, 1).toFixed(4));
      if (!heroVideo) {
        stage.style.setProperty("--lit", ramp(p, 0.2, 0.42).toFixed(4));
        stage.style.setProperty("--trace", ramp(p, 0.44, 0.64).toFixed(4));
        stage.style.setProperty("--zoom", ramp(p, 0.6, 1).toFixed(4));
      }

      if (heroVideo && mode === "scrub") {
        const v = videoRef.current;
        if (v && v.duration) {
          target = clamp(p / heroVideo.end) * Math.max(0, v.duration - 0.05);
          kickSeek();
        }
      }

      const idx = story.findIndex((c) => p >= c.from && p < c.to);
      if (idx !== lastCap) {
        lastCap = idx;
        setCap(idx);
      }
      const away = head < 0.15;
      if (away !== lastAway) {
        lastAway = away;
        setHeadAway(away);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const v = videoRef.current;
    v?.addEventListener("loadedmetadata", onScroll);
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      v?.removeEventListener("loadedmetadata", onScroll);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      if (seekRaf) cancelAnimationFrame(seekRaf);
    };
  }, [mode, story, heroVideo]);

  return (
    <div ref={wrapRef} className={s.photo} id="top">
      <div ref={stageRef} className={`${s.stage} ${heroVideo ? s.withVideo : ""}`} data-hero-mode={mode ?? "pending"}>
        {heroVideo ? (
          mode === "still" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={s.video} src={heroVideo.still} alt="" aria-hidden="true" />
          ) : (
            <>
              <video ref={videoRef} className={s.video} muted playsInline preload="auto" aria-hidden="true" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={`${s.video} ${s.posterImg} ${frameReady ? s.posterOff : ""}`}
                src={heroVideo.poster}
                alt=""
                aria-hidden="true"
              />
            </>
          )
        ) : (
          <SketchScene />
        )}
        <div className={s.shade} aria-hidden="true" />
        {!heroVideo && !heroImages.bg && (
          <span className={`photo-label ${s.label}`}>현장 사진 자리 — 새벽/작업등 두 장씩, 세 겹 (교체)</span>
        )}

        <div className={`${s.head} ${headAway ? s.away : ""}`} aria-hidden={headAway || undefined}>
          <p className={s.eyebrow}>{site.tagline}</p>
          <h1 className={s.term}>
            <span className="sr-only">{site.name} </span>
            <span className={s.word}>
              <Wordmark height={100} />
            </span>
          </h1>
          <p className={s.gloss}>성원마끼나 · 조사료 작업기 · 경북 안동 서후면</p>
          <p className={s.slogan}>{site.slogan}</p>
          <div className={`links on-dark ${s.plinks}`}>
            <a className="lnk" href="#dragon" tabIndex={headAway ? -1 : undefined}>
              드래곤 보기
            </a>
            <a className="lnk" href="#consumables" tabIndex={headAway ? -1 : undefined}>
              소모품 주문
            </a>
            <a className="lnk" href="#videos" tabIndex={headAway ? -1 : undefined}>
              작업 영상
            </a>
          </div>
          <a className={`btn btn--cta ${s.cta}`} href={site.phoneHref} tabIndex={headAway ? -1 : undefined}>
            ☏ 전화 상담 {site.phone}
          </a>
        </div>

        <ol className={s.caps} aria-hidden="true">
          {story.map((c, i) => (
            <li key={c.word} className={`${s.cap} ${cap === i ? s.capOn : ""}`}>
              <div className={s.capW}>{c.word}</div>
              <div className={s.capK}>{c.ko}</div>
            </li>
          ))}
        </ol>

        <div className={`${s.hint} ${headAway ? s.away : ""}`} aria-hidden="true">
          내리면서 보세요 ↓
        </div>
        <div className={s.veil} aria-hidden="true" />
      </div>
    </div>
  );
}
