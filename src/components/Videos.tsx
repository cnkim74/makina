"use client";

import { useState } from "react";
import Link from "next/link";
import { videos, videoSorts, videoTags } from "@/data/content";
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
  const [sort, setSort] = useState(0);
  const [q, setQ] = useState("");

  const list = videos.filter((v) => !q || v.title.includes(q) || v.caption.includes(q));

  return (
    <section className="sec" id="videos" aria-labelledby="videos-title">
      <div className="wrap">
        <h2 className="sec-title" id="videos-title">
          작업 영상
        </h2>

        <form
          className={s.search}
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <input
            type="search"
            placeholder="영상 검색"
            aria-label="영상 검색"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="submit" aria-label="검색">
            <i />
          </button>
        </form>

        <div className={s.tags}>
          {videoTags.map((t) => (
            <button key={t} type="button" onClick={() => setQ(t.slice(1))}>
              {t}
            </button>
          ))}
        </div>

        <div className={s.sort} role="group" aria-label="정렬">
          {videoSorts.map((o, i) => (
            <button
              key={o.label}
              type="button"
              className={sort === i ? s.on : undefined}
              aria-pressed={sort === i}
              onClick={() => setSort(i)}
            >
              <span className={s.long}>{o.label}</span>
              <span className={s.short}>{o.short}</span>
            </button>
          ))}
        </div>

        <div className={s.grid}>
          {list.map((v) => (
            <article key={v.id} className={s.v}>
              <a
                href={v.youtubeId ? `https://www.youtube.com/watch?v=${v.youtubeId}` : "#videos"}
                className={`photo ${s.thumb}`}
                aria-label={`${v.title} 재생`}
              >
                <FieldRows w={400} h={290} fill={v.tone} stroke="rgba(0,0,0,.25)" />
                <span className={s.play} aria-hidden="true" />
                <span className={s.cap}>
                  <Caption text={v.caption} />
                </span>
              </a>
              <h3>{v.title}</h3>
              <div className={s.meta}>
                <b>{v.kind}</b>
                {v.date}
              </div>
            </article>
          ))}
          {list.length === 0 && <p className={s.empty}>&ldquo;{q}&rdquo; 에 맞는 영상이 아직 없습니다.</p>}
        </div>

        <div className={s.more}>
          <Link href="#videos" className="pill pill--line">
            영상 더 보기
          </Link>
        </div>
      </div>
    </section>
  );
}
