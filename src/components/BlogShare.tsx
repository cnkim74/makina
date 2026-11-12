"use client";

import { useState } from "react";
import s from "@/app/blog/blog.module.css";

/** 글 공유 — 페이스북·X·네이버 밴드·링크 복사. 휴대폰은 기본 공유 창 */
export default function BlogShare({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { label: "페이스북", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { label: "X", href: `https://x.com/intent/post?url=${u}&text=${t}` },
    { label: "밴드", href: `https://band.us/plugin/share?body=${t}%0A${u}&route=${u}` },
  ];
  return (
    <div className={s.share}>
      <span>이 글 공유하기</span>
      <div>
        {links.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer">
            {l.label}
          </a>
        ))}
        <button
          type="button"
          onClick={async () => {
            const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
            try {
              if (nav.share && window.matchMedia("(pointer: coarse)").matches) await nav.share({ title, url });
              else {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              }
            } catch {
              /* 취소 */
            }
          }}
        >
          {copied ? "복사했습니다" : "링크 복사 · 카톡"}
        </button>
      </div>
    </div>
  );
}
