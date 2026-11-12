"use client";

import dynamic from "next/dynamic";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { catalog } from "@/data/content";
import s from "./CatalogBook.module.css";

// page-flip 은 브라우저에서만 돈다
const HTMLFlipBook = dynamic(() => import("react-pageflip"), { ssr: false });

type FlipApi = { flipNext: () => void; flipPrev: () => void; flip: (i: number) => void; turnToPage: (i: number) => void };

const Page = forwardRef<HTMLDivElement, { n: number; near: boolean }>(function Page({ n, near }, ref) {
  return (
    <div ref={ref} className={s.page}>
      {/* 가까운 쪽만 그림을 불러온다 (20쪽 × 수백 KB) */}
      {near ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={catalog.page(n)} alt={`${catalog.title} ${n}쪽`} width={catalog.width} height={catalog.height} draggable={false} />
      ) : null}
    </div>
  );
});

/**
 * 온라인 카탈로그 — 책장을 넘겨 보는 이북.
 * 넓은 화면은 펼침면(표지는 한 쪽), 좁은 화면은 한 쪽씩. 화살표 키·버튼·스와이프·모서리 끌기로 넘긴다.
 * 움직임 줄이기 설정이면 넘김 애니메이션을 끈다.
 */
export default function CatalogBook() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<{ pageFlip?: () => FlipApi } | null>(null);
  const [box, setBox] = useState<{ w: number; h: number; portrait: boolean } | null>(null);
  const [cur, setCur] = useState(0);
  const [reduced, setReduced] = useState(false);
  const N = catalog.pages;

  // 무대 폭(= 위 가로 메뉴 폭)을 꽉 채우게 한 쪽 크기를 정한다. 넓으면 펼침면, 좁으면 한 쪽
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const fit = () => {
      const W = el.clientWidth;
      const portrait = W < 760;
      const ratio = catalog.height / catalog.width;
      const w = Math.floor(portrait ? W : W / 2);
      const h = Math.floor(w * ratio);
      setBox((b) => (b && b.w === w && b.h === h && b.portrait === portrait ? b : { w, h, portrait }));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const api = () => bookRef.current?.pageFlip?.();
  const next = useCallback(() => api()?.flipNext(), []);
  const prev = useCallback(() => api()?.flipPrev(), []);
  const go = (i: number) => {
    const pf = api();
    if (!pf) return;
    if (Math.abs(i - cur) > 2 || reduced) pf.turnToPage(i);
    else pf.flip(i);
    setCur(i);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input, textarea, select")) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // 지금 보는 쪽 주변만 그림을 넣는다
  const pages = useMemo(
    () => Array.from({ length: N }, (_, i) => <Page key={i} n={i + 1} near={Math.abs(i - cur) <= 4} />),
    [N, cur],
  );

  // 펼침면 표시: 표지(1)·뒤표지(20)는 한 쪽, 나머지는 2–3, 4–5 …
  const shown = box?.portrait || cur === 0 ? [cur] : cur % 2 === 1 ? [cur, cur + 1] : [cur - 1, cur];
  const vis = shown.filter((i) => i >= 0 && i < N);
  const label = vis.map((i) => i + 1).join("–");

  return (
    <div className={s.wrap}>
      <div ref={wrapRef} className={s.stage}>
        {box && (
          <div className={s.book} style={{ width: box.portrait ? box.w : box.w * 2, height: box.h }}>
            <HTMLFlipBook
              key={`${box.w}x${box.h}${box.portrait ? "p" : "l"}`}
              ref={bookRef as React.Ref<unknown>}
              width={box.w}
              height={box.h}
              size="fixed"
              minWidth={200}
              maxWidth={2000}
              minHeight={280}
              maxHeight={2800}
              drawShadow
              flippingTime={reduced ? 1 : 700}
              usePortrait={box.portrait}
              startPage={cur}
              showCover
              mobileScrollSupport
              onFlip={(e: { data: number }) => setCur(e.data)}
              className=""
              style={{}}
              startZIndex={0}
              autoSize={false}
              maxShadowOpacity={0.45}
              clickEventForward
              useMouseEvents
              swipeDistance={30}
              showPageCorners={!reduced}
              disableFlipByClick={false}
            >
              {pages}
            </HTMLFlipBook>
          </div>
        )}
      </div>

      <div className={s.bar}>
        <button type="button" className={s.nav} onClick={prev} disabled={cur === 0} aria-label="앞 쪽">
          ‹ 앞 쪽
        </button>
        <span className={s.count} aria-live="polite">
          {label} <small>/ {N}쪽</small>
        </span>
        <button type="button" className={s.nav} onClick={next} disabled={cur >= N - 1} aria-label="다음 쪽">
          다음 쪽 ›
        </button>
      </div>

      <div className={s.thumbs} aria-label="쪽 바로 가기">
        {Array.from({ length: N }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`${s.thumb} ${vis.includes(i) ? s.on : ""}`}
            aria-current={vis.includes(i) ? "page" : undefined}
            onClick={() => go(i)}
            aria-label={`${i + 1}쪽으로`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={catalog.thumb(i + 1)} alt="" loading="lazy" />
            <span>{i + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
