"use client";

import { useState } from "react";
import { videos, videoSorts, videoTags } from "@/data/content";
import Segmented from "./Segmented";
import { FieldRows } from "./placeholders";
import s from "./Videos.module.css";

/** "{강조}" 표기를 노란 강조로 바꾼다 */
function Caption({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, li) => (
        <span key={li}>
          {li > 0 && <br />}
          {line.split(/(\{[^}]+\})/).map((part, pi) =>
            part.startsWith("{") ? <em key={pi}>{part.slice(1, -1)}</em> : <span key={pi}>{part}</span>,
          )}
        </span>
      ))}
    </>
  );
}

export default function Videos() {
  const [sort, setSort] = useState(videoSorts[0].label);
  const [q, setQ] = useState("");

  // 띄어쓰기는 무시하고 찾는다 ("무른 논" = "무른논")
  const norm = (t: string) => t.replace(/\s+/g, "").replace(/[{}]/g, "");
  const key = norm(q.replace(/^#/, ""));
  const list = videos
    .filter(
      (v) => !key || [v.title, v.caption, v.kind, ...v.tags].some((t) => norm(t).includes(key)),
    )
    .sort((a, b) => (sort === videoSorts[0].label ? b.date.localeCompare(a.date) : 0));

  return (
    <section className="mod" id="videos" aria-labelledby="videos-title">
      <div className="mod-in">
        <span className="lab-k">작업 영상</span>
        <h2 id="videos-title">현장에서 직접 보세요.</h2>
        <p className="tag">안동 서후면 들판에서 찍은 실제 작업 장면과 사용법 영상입니다.</p>

        <form className={s.search} role="search" onSubmit={(e) => e.preventDefault()}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M15.5 15.5 L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            id="video-search"
            type="search"
            placeholder="영상 검색 — 예: 네트 교체"
            aria-label="영상 검색"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>

        <div className={s.tags}>
          {videoTags.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={q === t.slice(1)}
              onClick={() => setQ(q === t.slice(1) ? "" : t.slice(1))}
            >
              {t}
            </button>
          ))}
        </div>

        <Segmented
          className={s.seg}
          label="정렬"
          value={sort}
          onChange={setSort}
          options={videoSorts.map((o) => ({ id: o.label, label: o.label, short: o.short }))}
        />

        <div className={s.grid}>
          {list.map((v) => (
            <article key={v.id} className={s.v}>
              <a
                href={v.youtubeId ? `https://www.youtube.com/watch?v=${v.youtubeId}` : "#videos"}
                className={`photo ${s.thumb}`}
                aria-label={`${v.title} 재생`}
              >
                <FieldRows w={400} h={250} fill={v.tone} stroke="rgba(0,0,0,.25)" />
                <span className={`glass glass--dark ${s.play}`} aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M8 5.5 L19 12 L8 18.5 Z" fill="currentColor" />
                  </svg>
                </span>
                <span className={s.cap}>
                  <Caption text={v.caption} />
                </span>
              </a>
              <div className={s.body}>
                <h3>{v.title}</h3>
                <p className={s.meta}>
                  <b>{v.kind}</b>
                  {v.date}
                </p>
              </div>
            </article>
          ))}
          {list.length === 0 && (
            <p className={s.empty}>
              &ldquo;{q}&rdquo; 영상은 아직 없습니다. 다른 말로 찾아보시거나 전화로 물어봐 주세요.
            </p>
          )}
        </div>

        <div className="links">
          <a className="lnk" href="#videos">
            유튜브 채널에서 더 보기
          </a>
        </div>
      </div>
    </section>
  );
}
