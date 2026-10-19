import Header from "@/components/Header";
import Hero from "@/components/Hero";
import QuickDoors from "@/components/QuickDoors";
import WorkFlow from "@/components/WorkFlow";
import Products from "@/components/Products";
import HpFinder from "@/components/HpFinder";
import Videos from "@/components/Videos";
import Consumables from "@/components/Consumables";
import Support from "@/components/Support";
import Directions from "@/components/Directions";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import MobileDock from "@/components/MobileDock";

/**
 * 메인 — 흰 바탕과 연회색 바탕 모듈이 번갈아 온다.
 * 히어로(어둠) → 바로 가기 → 작업 흐름(회색) → 작업기 → 마력 찾기(어둠) → 영상 → 소모품(회색) → 고객지원 → 오시는 길(회색)
 */
export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <QuickDoors />
        <WorkFlow />
        <Products />
        <HpFinder />
        <Videos />
        <Consumables />
        <Support />
        <Directions />
      </main>
      <Footer />
      <FloatingButtons />
      <MobileDock />
    </>
  );
}
