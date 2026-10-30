"use client";

import { createContext, useContext } from "react";
import { heroStory, heroVideo, videos } from "@/data/content";
import { site } from "@/data/site";
import { LANDING_SECTIONS, type PublicData } from "@/lib/types";

/** DB 가 없을 때와 같은 기본값 (src/data) */
const FALLBACK: PublicData = {
  site,
  hero: { video: heroVideo, story: heroStory },
  videos,
  sns: [],
  integrations: { gaId: "", channelTalkKey: "" },
  landing: { sections: LANDING_SECTIONS.map((s) => ({ id: s.id, visible: true })) },
};

const Ctx = createContext<PublicData>(FALLBACK);

/** 공개 홈페이지 전체에 CMS 데이터를 내려 준다 (src/app/page.tsx) */
export function SiteDataProvider({ value, children }: { value: PublicData; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useSiteData = () => useContext(Ctx);
export const useSite = () => useContext(Ctx).site;
