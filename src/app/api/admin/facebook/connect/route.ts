import { NextResponse, type NextRequest } from "next/server";
import { currentUser, hasRole } from "@/lib/auth";
import { readyDb } from "@/lib/db";
import { FB_SCOPES, fbRedirect } from "@/lib/facebook";
import { getSetting } from "@/lib/settings";

/** 페이스북 페이지 연결 시작 — 페이스북 로그인·권한 화면으로 보낸다 */
export async function GET(req: NextRequest) {
  const user = await currentUser();
  if (!user || !hasRole(user, "admin")) return NextResponse.redirect(new URL("/admin/login", req.url));
  const db = await readyDb();
  const social = db ? await getSetting(db, "social") : null;
  if (!social?.fbAppId) return NextResponse.redirect(new URL("/admin/blog/settings?msg=" + encodeURIComponent("페이스북 앱 ID 를 먼저 저장해 주세요."), req.url));

  const state = crypto.randomUUID();
  const dialog = new URL("https://www.facebook.com/v23.0/dialog/oauth");
  dialog.searchParams.set("client_id", social.fbAppId);
  dialog.searchParams.set("redirect_uri", fbRedirect(req.nextUrl.origin));
  dialog.searchParams.set("response_type", "code");
  dialog.searchParams.set("scope", FB_SCOPES);
  dialog.searchParams.set("state", state);
  const res = NextResponse.redirect(dialog);
  res.cookies.set("fb_state", state, { httpOnly: true, secure: true, sameSite: "lax", path: "/api/admin/facebook", maxAge: 600 });
  return res;
}
