import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { dbState, first } from "@/lib/db";
import { LogoMark } from "@/components/placeholders";
import { logoutAction } from "../actions";
import { NavLinks } from "../_ui/client";
import SetupGuide from "../_ui/SetupGuide";
import a from "../admin.module.css";

export const dynamic = "force-dynamic";

const ROLE_LABEL = { owner: "대표", admin: "관리자", editor: "편집자" } as const;

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const st = await dbState();
  if (!st.ok) return <SetupGuide reason={st.reason} />;
  const user = await requireUser();

  const [inq, pending] = await Promise.all([
    first<{ n: number }>(st.db, "SELECT COUNT(*) AS n FROM inquiries WHERE status = 'new'"),
    first<{ n: number }>(st.db, "SELECT COUNT(*) AS n FROM users WHERE status = 'pending'"),
  ]);

  const items = [
    { href: "/admin", label: "한눈에 보기" },
    { href: "/admin/inquiries", label: "문의", badge: inq?.n ?? 0 },
    { href: "/admin/videos", label: "유튜브 영상" },
    { href: "/admin/sns", label: "SNS" },
    { href: "/admin/hero", label: "히어로" },
    { href: "/admin/support", label: "고객지원 · 연결" },
    { href: "/admin/analytics", label: "분석" },
    ...(user.role !== "editor" ? [{ href: "/admin/users", label: "회원", badge: pending?.n ?? 0 }] : []),
    { href: "/admin/account", label: "내 계정" },
  ];

  return (
    <div className={a.shell}>
      <aside className={a.side}>
        <Link href="/admin" className={a.brand}>
          <LogoMark size={28} />
          <span>
            성원마끼나 <small>관리</small>
          </span>
        </Link>
        <NavLinks items={items} />
        <div className={a.sideFoot}>
          <span>
            <b>{user.name}</b> · {ROLE_LABEL[user.role]}
          </span>
          <a href="/" target="_blank" rel="noopener noreferrer">
            홈페이지 보기 ↗
          </a>
          <form action={logoutAction}>
            <button type="submit" className={a.linkBtn}>
              로그아웃
            </button>
          </form>
        </div>
      </aside>
      <main className={a.main}>{children}</main>
    </div>
  );
}
