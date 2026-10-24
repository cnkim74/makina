import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { dbState } from "@/lib/db";
import { LogoMark, Wordmark } from "@/components/Logo";
import { LoginForm } from "../_ui/client";
import SetupGuide from "../_ui/SetupGuide";
import a from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const st = await dbState();
  if (!st.ok) return <SetupGuide reason={st.reason} detail={st.detail} />;
  if (await currentUser()) redirect("/admin");

  return (
    <div className={a.authPage}>
      <div className={a.authCard}>
        <span className={a.authLogo}>
          <LogoMark size={34} />
          <Wordmark height={22} />
        </span>
        <div>
          <h1>관리자 로그인</h1>
          <p className={a.sub}>성원마끼나 홈페이지 관리</p>
        </div>
        <LoginForm />
        <p className={a.sub}>
          계정이 없으신가요? <Link href="/admin/signup" className={a.linkBtn}>가입 신청</Link>
        </p>
        <Link href="/" className={a.linkBtn}>
          ← 홈페이지로
        </Link>
      </div>
    </div>
  );
}
