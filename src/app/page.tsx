import { Fragment } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import QuickDoors from "@/components/QuickDoors";
import Dragon from "@/components/Dragon";
import Feeding from "@/components/Feeding";
import Products from "@/components/Products";
import HpFinder from "@/components/HpFinder";
import Videos from "@/components/Videos";
import Consumables from "@/components/Consumables";
import Support from "@/components/Support";
import Inquiry from "@/components/Inquiry";
import Directions from "@/components/Directions";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import MobileDock from "@/components/MobileDock";
import SiteAnalytics from "@/components/SiteAnalytics";
import { SiteDataProvider } from "@/components/SiteData";
import { getPublicData } from "@/lib/public-data";
import type { LandingSectionId } from "@/lib/types";

/** 관리자 "랜딩페이지"에서 켜고 끄고 순서를 바꾸는 섹션 */
const SECTIONS: Record<LandingSectionId, () => React.ReactNode> = {
  quick: () => <QuickDoors />,
  dragon: () => <Dragon />,
  feeding: () => <Feeding />,
  products: () => <Products />,
  hpfinder: () => <HpFinder />,
  videos: () => <Videos />,
  consumables: () => <Consumables />,
  support: () => <Support />,
  inquiry: () => <Inquiry />,
  directions: () => <Directions />,
};

// 관리자 화면에서 고친 내용이 바로 보이도록 요청마다 그린다
export const dynamic = "force-dynamic";

/**
 * 메인 — 흰 바탕과 연회색 바탕 모듈이 번갈아 온다.
 * 히어로(어둠) → 바로 가기 → DRAGON(회색) → 급여 효과 → DRAGON 라인업(회색) → 마력 찾기(어둠) → 영상 → 소모품(회색)
 * → 고객지원 → 문의 남기기(회색) → 오시는 길
 */
export default async function HomePage() {
  const data = await getPublicData();

  return (
    <SiteDataProvider value={data}>
      <Header />
      <main>
        <Hero />
        {data.landing.sections
          .filter((s) => s.visible)
          .map((s) => (
            <Fragment key={s.id}>{SECTIONS[s.id]()}</Fragment>
          ))}
      </main>
      <Footer />
      <FloatingButtons />
      <MobileDock />
      <SiteAnalytics gaId={data.integrations.gaId} channelTalkKey={data.integrations.channelTalkKey} />
    </SiteDataProvider>
  );
}
