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
  viewportFit: "cover",
  themeColor: "#ffffff",
};

const GOOGLE_FONTS =
  "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Noto+Sans+KR:wght@400;500;700;900&display=swap";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={GOOGLE_FONTS} />
      </head>
      <body>{children}</body>
    </html>
  );
}
