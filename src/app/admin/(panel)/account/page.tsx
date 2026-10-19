import { requireUser } from "@/lib/auth";
import { logoutAction } from "../../actions";
import { PasswordForm } from "../../_ui/client";
import { PageHead } from "../../_ui/server";
import a from "../../admin.module.css";

const ROLE = { owner: "대표", admin: "관리자", editor: "편집자" } as const;

export default async function Account() {
  const user = await requireUser();
  return (
    <>
      <PageHead title="내 계정" desc="비밀번호를 바꾸면 다른 기기에서 로그인한 상태는 모두 풀립니다." />
      <section className={a.card}>
        <h2>정보</h2>
        <ul className={a.check_list}>
          <li>
            <b>이름</b>
            <span>{user.name}</span>
          </li>
          <li>
            <b>이메일</b>
            <span>{user.email}</span>
          </li>
          <li>
            <b>권한</b>
            <span>{ROLE[user.role]}</span>
          </li>
        </ul>
      </section>
      <section className={a.card} style={{ marginTop: 16 }}>
        <h2>비밀번호 바꾸기</h2>
        <PasswordForm />
      </section>
      <form action={logoutAction} className={a.actions} style={{ marginTop: 16 }}>
        <button type="submit" className={`${a.btn} ${a.btnGhost}`}>
          로그아웃
        </button>
      </form>
    </>
  );
}
