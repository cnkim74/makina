import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileDock from "@/components/MobileDock";
import SiteAnalytics from "@/components/SiteAnalytics";
import { SiteDataProvider } from "@/components/SiteData";
import { getPublicData } from "@/lib/public-data";

/** 블로그도 메인과 같은 내비·푸터·도크를 쓴다 (관리자에서 고친 연락처가 그대로 보이게) */
export default async function BlogLayout({ children }: { children: React.ReactNode }) {
  const data = await getPublicData();
  return (
    <SiteDataProvider value={data}>
      <Header />
      <main>{children}</main>
      <Footer />
      <MobileDock />
      <SiteAnalytics gaId={data.integrations.gaId} channelTalkKey={data.integrations.channelTalkKey} />
    </SiteDataProvider>
  );
}
