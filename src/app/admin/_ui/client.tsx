"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { changePasswordAction, loginAction, signupAction, type FormState } from "../actions";
import a from "../admin.module.css";

/* 관리자 화면의 작은 클라이언트 조각들 */

export function NavLinks({ items }: { items: { href: string; label: string; badge?: number }[] }) {
  const path = usePathname();
  return (
    <nav className={a.nav} aria-label="관리 메뉴">
      {items.map((it) => {
        const on = it.href === "/admin" ? path === "/admin" : path.startsWith(it.href);
        return (
          <Link key={it.href} href={it.href} className={`${a.navLink} ${on ? a.navOn : ""}`} aria-current={on ? "page" : undefined}>
            {it.label}
            {it.badge ? <span className={a.badge}>{it.badge}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function Submit({ children, className }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className ?? a.btn} disabled={pending}>
      {pending ? "처리 중…" : children}
    </button>
  );
}

/** 지우기처럼 되돌릴 수 없는 버튼 — 한 번 더 묻는다 */
export function ConfirmSubmit({ children, message }: { children: React.ReactNode; message: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={`${a.btn} ${a.btnDanger} ${a.btnSm}`}
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

function Message({ state }: { state: FormState }) {
  if (state.error)
    return (
      <p className={a.error} role="alert">
        {state.error}
      </p>
    );
  if (state.ok)
    return (
      <p className={a.ok} role="status">
        {state.ok}
      </p>
    );
  return null;
}

export function LoginForm() {
  const [state, action] = useActionState(loginAction, {});
  return (
    <form action={action} className={a.form}>
      <label className={a.field}>
        <span>이메일</span>
        <input id="login-email" name="email" type="email" required autoComplete="username" />
      </label>
      <label className={a.field}>
        <span>비밀번호</span>
        <input id="login-password" name="password" type="password" required autoComplete="current-password" />
      </label>
      <Message state={state} />
      <Submit>로그인</Submit>
    </form>
  );
}

export function SignupForm() {
  const [state, action] = useActionState(signupAction, {});
  if (state.ok) return <Message state={state} />;
  return (
    <form action={action} className={a.form}>
      <label className={a.field}>
        <span>이름</span>
        <input id="signup-name" name="name" required maxLength={40} autoComplete="name" />
      </label>
      <label className={a.field}>
        <span>이메일</span>
        <input id="signup-email" name="email" type="email" required autoComplete="email" />
      </label>
      <label className={a.field}>
        <span>
          비밀번호 <small>8자 이상</small>
        </span>
        <input id="signup-password" name="password" type="password" required minLength={8} autoComplete="new-password" />
      </label>
      <label className={a.field}>
        <span>비밀번호 확인</span>
        <input id="signup-password2" name="password2" type="password" required minLength={8} autoComplete="new-password" />
      </label>
      <Message state={state} />
      <Submit>가입 신청</Submit>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePasswordAction, {});
  return (
    <form action={action} className={a.form}>
      <label className={a.field}>
        <span>지금 비밀번호</span>
        <input id="pw-current" name="current" type="password" required autoComplete="current-password" />
      </label>
      <div className={a.row}>
        <label className={a.field}>
          <span>새 비밀번호</span>
          <input id="pw-next" name="next" type="password" required minLength={8} autoComplete="new-password" />
        </label>
        <label className={a.field}>
          <span>새 비밀번호 확인</span>
          <input id="pw-next2" name="next2" type="password" required minLength={8} autoComplete="new-password" />
        </label>
      </div>
      <Message state={state} />
      <div className={a.actions}>
        <Submit>비밀번호 바꾸기</Submit>
      </div>
    </form>
  );
}

/** 파일 올리기 → R2. 끝나면 화면을 새로 고쳐 목록에 나타나게 한다 */
export function UploadBox() {
  const router = useRouter();
  const [state, setState] = useState<{ busy?: boolean; error?: string; url?: string }>({});

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setState({ busy: true });
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const j = (await r.json()) as { error?: string; url?: string };
      if (!r.ok) setState({ error: j.error ?? "올리지 못했습니다." });
      else {
        setState({ url: j.url });
        router.refresh();
      }
    } catch {
      setState({ error: "올리지 못했습니다. 인터넷 연결을 확인해 주세요." });
    }
    e.target.value = "";
  }

  return (
    <div className={a.form}>
      <label className={a.field}>
        <span>
          파일 올리기 <small>사진 jpg·png·webp·avif, 영상 mp4·webm · 50MB까지</small>
        </span>
        <input
          id="hero-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
          onChange={onChange}
          disabled={state.busy}
        />
      </label>
      {state.busy && <p className={a.muted}>올리는 중… 영상은 시간이 조금 걸립니다.</p>}
      {state.error && (
        <p className={a.error} role="alert">
          {state.error}
        </p>
      )}
      {state.url && (
        <p className={a.ok} role="status">
          올렸습니다. 주소: <code>{state.url}</code> — 아래 칸에 붙여 넣거나 목록에서 고르세요.
        </p>
      )}
    </div>
  );
}

/** 주소 복사 버튼 */
export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={`${a.btn} ${a.btnGhost} ${a.btnSm}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* 복사 실패 시 주소가 화면에 보이므로 그대로 둔다 */
        }
      }}
    >
      {done ? "복사됨" : "주소 복사"}
    </button>
  );
}
