"use client";

import { useLayoutEffect, useRef, useState } from "react";
import s from "./Segmented.module.css";

export type SegOption<T extends string> = { id: T; label: string; short?: string };

type Props<T extends string> = {
  options: SegOption<T>[];
  value: T;
  onChange: (id: T) => void;
  label: string;
  /** tablist: 아래 내용을 바꾸는 탭 / group: 같은 화면 안의 선택 */
  kind?: "tablist" | "group";
  tone?: "light" | "dark";
  className?: string;
};

/**
 * 리퀴드 글래스 세그먼트 컨트롤.
 * 고른 항목 뒤로 유리 방울(thumb)이 스프링처럼 미끄러져 간다. 항목 폭이 달라도 실제 위치를 재서 따라간다.
 */
export default function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  kind = "group",
  tone = "light",
  className,
}: Props<T>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const btn = track.querySelector<HTMLButtonElement>(`[data-id="${CSS.escape(value)}"]`);
      if (!btn) return;
      setThumb({ x: btn.offsetLeft, w: btn.offsetWidth });
      // 고른 항목이 가로 스크롤 밖이면 보이게
      const scroller = track.parentElement;
      if (scroller && scroller.scrollWidth > scroller.clientWidth) {
        const left = btn.offsetLeft - 24;
        const right = btn.offsetLeft + btn.offsetWidth + 24 - scroller.clientWidth;
        if (scroller.scrollLeft > left) scroller.scrollLeft = left;
        else if (scroller.scrollLeft < right) scroller.scrollLeft = right;
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, [value, options]);

  return (
    <div className={`${s.wrap} ${className ?? ""}`}>
      <div className={`glass ${tone === "dark" ? "glass--dark" : ""} ${s.seg} ${tone === "dark" ? s.dark : ""}`}>
        <div
          ref={trackRef}
          className={s.track}
          role={kind}
          aria-label={label}
        >
          <span
            className={s.thumb}
            aria-hidden="true"
            style={thumb ? { transform: `translateX(${thumb.x}px)`, width: thumb.w, opacity: 1 } : undefined}
          />
          {options.map((o) => {
            const on = o.id === value;
            const a11y =
              kind === "tablist" ? { role: "tab" as const, "aria-selected": on } : { "aria-pressed": on };
            return (
              <button
                key={o.id}
                type="button"
                data-id={o.id}
                className={`${s.opt} ${on ? s.on : ""}`}
                aria-label={o.short ? o.label : undefined}
                onClick={() => onChange(o.id)}
                {...a11y}
              >
                {o.short ? (
                  <>
                    <span className={s.long}>{o.label}</span>
                    <span className={s.short} aria-hidden="true">
                      {o.short}
                    </span>
                  </>
                ) : (
                  o.label
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
