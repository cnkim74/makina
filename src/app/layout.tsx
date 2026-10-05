import type { Metadata, Viewport } from "next";
import { site } from "@/data/site";
import "./globals.css";

export const metadata: Metadata = {
  title: `${site.name} ${site.nameEn} — ${site.tagline}`,
  description: `${site.slogan} ${site.sloganSub} 경북 안동 서후면에서 조사료 작업기를 만듭니다. 전화 ${site.phone}`,
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.sloganSub,
    locale: "ko_KR",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1c1a17",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
