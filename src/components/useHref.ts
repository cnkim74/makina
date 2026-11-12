"use client";

import { usePathname } from "next/navigation";

/** 메인의 "#섹션" 링크를 다른 페이지(블로그 등)에서는 "/#섹션" 으로 바꾼다 */
export function useHref() {
  const path = usePathname();
  return (href: string) => (href.startsWith("#") && path !== "/" ? `/${href}` : href);
}
