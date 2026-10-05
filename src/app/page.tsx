import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FloatingButtons from "@/components/FloatingButtons";
import WorkFlow from "@/components/WorkFlow";
import Products from "@/components/Products";
import HpFinder from "@/components/HpFinder";
import Videos from "@/components/Videos";
import Consumables from "@/components/Consumables";
import Support from "@/components/Support";
import Directions from "@/components/Directions";
import Footer from "@/components/Footer";
import MobileDock from "@/components/MobileDock";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
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
