import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { dbState, first } from "@/lib/db";
import { CompanyLogo } from "@/components/Logo";
import { logoutAction } from "../actions";
import { NavLinks } from "../_ui/client";
import SetupGuide from "../_ui/SetupGuide";
import a from "../admin.module.css";

export const dynamic = "force-dynamic";

const ROLE_LABEL = { owner: "대표", admin: "관리자", editor: "편집자" } as const;

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const st = await dbState();
  if (!st.ok) return <SetupGuide reason={st.reason} detail={st.detail} />;
  const user = await requireUser();

  const [inq, pending] = await Promise.all([
    first<{ n: number }>(st.db, "SELECT COUNT(*) AS n FROM inquiries WHERE status = 'new'"),
    first<{ n: number }>(st.db, "SELECT COUNT(*) AS n FROM users WHERE status = 'pending'"),
  ]);

  const isAdmin = user.role !== "editor";
  const items = [
    { href: "/admin", label: "대시보드" },
    { group: "영업" },
    { href: "/admin/inquiries", label: "문의", badge: inq?.n ?? 0 },
    { href: "/admin/customers", label: "회원(고객) 관리" },
    { href: "/admin/quotes", label: "견적서" },
    { href: "/admin/contracts", label: "계약서" },
    ...(isAdmin
      ? [
          { href: "/admin/sales", label: "매출 관리" },
          { href: "/admin/performance", label: "실적 관리" },
        ]
      : []),
    { href: "/admin/cards", label: "네임카드" },
    { group: "홈페이지" },
    { href: "/admin/landing", label: "랜딩페이지" },
    { href: "/admin/hero", label: "히어로 영상" },
    { href: "/admin/videos", label: "유튜브 영상" },
    { href: "/admin/sns", label: "SNS" },
    { href: "/admin/analytics", label: "접속 정보" },
    { group: "설정" },
    { href: "/admin/support", label: "고객지원 · 연결" },
    ...(isAdmin ? [{ href: "/admin/users", label: "직원 계정", badge: pending?.n ?? 0 }] : []),
    { href: "/admin/account", label: "내 계정" },
  ];

  return (
    <div className={a.shell}>
      <aside className={a.side}>
        <Link href="/admin" className={a.brand}>
          <CompanyLogo height={26} title="성원마끼나" />
          <small>관리</small>
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
