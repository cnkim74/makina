import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { dbState, first } from "@/lib/db";
import { LogoMark } from "@/components/placeholders";
import { SignupForm } from "../_ui/client";
import SetupGuide from "../_ui/SetupGuide";
import a from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const st = await dbState();
  if (!st.ok) return <SetupGuide reason={st.reason} />;
  if (await currentUser()) redirect("/admin");
  const n = (await first<{ n: number }>(st.db, "SELECT COUNT(*) AS n FROM users"))?.n ?? 0;

  return (
    <div className={a.authPage}>
      <div className={a.authCard}>
        <LogoMark size={40} />
        <div>
          <h1>{n === 0 ? "대표 관리자 만들기" : "가입 신청"}</h1>
          <p className={a.sub}>
            {n === 0
              ? "처음 가입하는 분이 대표 관리자가 되어 바로 사용할 수 있습니다."
              : "가입 후 관리자가 승인하면 로그인할 수 있습니다."}
          </p>
        </div>
        <SignupForm />
        <p className={a.sub}>
          이미 계정이 있으신가요? <Link href="/admin/login" className={a.linkBtn}>로그인</Link>
        </p>
      </div>
    </div>
  );
}
