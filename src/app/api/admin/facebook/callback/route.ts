import { NextResponse, type NextRequest } from "next/server";
import { currentUser, hasRole } from "@/lib/auth";
import { readyDb } from "@/lib/db";
import { holdPages, pagesFromCode, savePage } from "@/lib/facebook";

/** 페이스북에서 돌아오는 주소 — 장기 토큰으로 바꾸고, 페이지가 하나면 바로 연결한다 */
export async function GET(req: NextRequest) {
  const back = (msg: string) => {
    const res = NextResponse.redirect(new URL(`/admin/blog/settings?msg=${encodeURIComponent(msg)}`, req.url));
    res.cookies.delete({ name: "fb_state", path: "/api/admin/facebook" });
    return res;
  };
  const user = await currentUser();
  if (!user || !hasRole(user, "admin")) return NextResponse.redirect(new URL("/admin/login", req.url));
  const p = req.nextUrl.searchParams;
  if (p.get("error")) return back("페이스북 연결을 취소했습니다.");
  if (!p.get("state") || p.get("state") !== req.cookies.get("fb_state")?.value) return back("연결 요청이 만료되었습니다. 다시 눌러 주세요.");
  const code = p.get("code");
  const db = await readyDb();
  if (!code || !db) return back("페이스북 연결에 실패했습니다.");
  try {
    const pages = await pagesFromCode(db, code, req.nextUrl.origin);
    if (pages.length === 0) return back("관리하는 페이스북 페이지가 없습니다. 페이지 관리자 계정으로 연결해 주세요.");
    if (pages.length === 1) {
      await savePage(db, pages[0]);
      return back(`페이스북 페이지 “${pages[0].name}”를 연결했습니다.`);
    }
    await holdPages(db, pages);
    return back("게시할 페이스북 페이지를 골라 주세요.");
  } catch (e) {
    return back(`페이스북 연결 실패: ${e instanceof Error ? e.message : "알 수 없는 오류"}`);
  }
}
