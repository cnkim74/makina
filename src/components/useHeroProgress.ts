"use client";

import { useEffect, useState } from "react";

/**
 * 히어로(#top) 장면을 얼마나 지났는지 0~1 로 알려 준다.
 * 내비 유리 색(어둠/밝음)과 플로팅 버튼 표시 시점을 맞추는 데 쓴다.
 * 값이 바뀔 때마다가 아니라 기준선을 넘을 때만 다시 그린다.
 */
export function useHeroPast(threshold: number) {
  const [past, setPast] = useState(false);

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const hero = document.getElementById("top");
      if (!hero) {
        setPast(true);
        return;
      }
      const travel = Math.max(1, hero.offsetHeight - window.innerHeight);
      const top = hero.getBoundingClientRect().top;
      setPast(-top / travel >= threshold);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [threshold]);

  return past;
}
