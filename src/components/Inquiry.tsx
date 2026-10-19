"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/track";
import { INQUIRY_CATEGORIES } from "@/lib/types";
import { useSite } from "./SiteData";
import s from "./Inquiry.module.css";

type State = { kind: "idle" | "sending" | "done" | "error"; msg?: string };

/** 문의 남기기 — 관리자 화면 "문의"로 들어간다 */
export default function Inquiry() {
  const site = useSite();
  const [category, setCategory] = useState<string>(INQUIRY_CATEGORIES[0]);
  const [state, setState] = useState<State>({ kind: "idle" });

  // 고객지원 목록에서 "문의 남기기"를 누르면 분류를 미리 골라 둔다
  useEffect(() => {
    const on = (e: Event) => {
      const c = (e as CustomEvent<string>).detail;
      if ((INQUIRY_CATEGORIES as readonly string[]).includes(c)) setCategory(c);
    };
    window.addEventListener("mk:inquiry", on);
    return () => window.removeEventListener("mk:inquiry", on);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setState({ kind: "sending" });
    try {
      const r = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          phone: fd.get("phone"),
          email: fd.get("email"),
          category,
          message: fd.get("message"),
          agree: fd.get("agree") === "on",
          company: fd.get("company"),
        }),
      });
      const j = (await r.json().catch(() => ({}))) as { error?: string };
      if (!r.ok) {
        setState({ kind: "error", msg: j.error ?? "보내지 못했습니다. 잠시 후 다시 시도해 주세요." });
        return;
      }
      track("inquiry_submit", category);
      form.reset();
      setState({ kind: "done" });
    } catch {
      setState({ kind: "error", msg: "인터넷 연결을 확인하고 다시 보내 주세요." });
    }
  }

  return (
    <section className="mod mod--alt" id="inquiry" aria-labelledby="inquiry-title">
      <div className="mod-in">
        <span className="lab-k">문의 남기기</span>
        <h2 id="inquiry-title">남겨 주시면 먼저 전화드립니다.</h2>
        <p className="tag">
          근무 시간에는 보통 한두 시간 안에 연락드립니다. 급하시면{" "}
          <a className={s.telInline} href={site.phoneHref}>
            {site.phone}
          </a>
          로 바로 전화 주세요.
        </p>

        {state.kind === "done" ? (
          <div className={`card ${s.done}`} role="status">
            <b>문의가 접수되었습니다.</b>
            <p>남겨 주신 연락처로 담당자가 전화드리겠습니다.</p>
            <button type="button" className="btn btn--ghost" onClick={() => setState({ kind: "idle" })}>
              문의 하나 더 남기기
            </button>
          </div>
        ) : (
          <form className={`card ${s.form}`} onSubmit={onSubmit} noValidate={false}>
            <fieldset className={s.cats}>
              <legend>무엇을 도와드릴까요?</legend>
              <div className={s.catRow}>
                {INQUIRY_CATEGORIES.map((c) => (
                  <label key={c} className={category === c ? s.catOn : undefined}>
                    <input
                      type="radio"
                      name="category"
                      value={c}
                      checked={category === c}
                      onChange={() => setCategory(c)}
                    />
                    {c}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className={s.row}>
              <label className={s.field}>
                <span>이름</span>
                <input id="inq-name" name="name" required maxLength={40} autoComplete="name" placeholder="홍길동" />
              </label>
              <label className={s.field}>
                <span>연락처</span>
                <input
                  id="inq-phone"
                  name="phone"
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={30}
                  placeholder="010-1234-5678"
                />
              </label>
            </div>

            <label className={s.field}>
              <span>
                이메일 <small>(선택)</small>
              </span>
              <input id="inq-email" name="email" type="email" maxLength={120} autoComplete="email" />
            </label>

            <label className={s.field}>
              <span>문의 내용</span>
              <textarea
                id="inq-message"
                name="message"
                required
                maxLength={2000}
                rows={5}
                placeholder="예: 60마력 트랙터에 맞는 원형베일러 견적이 궁금합니다. 작업 면적은 약 2만 평입니다."
              />
            </label>

            {/* 자동 등록 방지용 — 사람에게는 보이지 않는다 */}
            <input className={s.hp} name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />

            <label className={s.agree}>
              <input id="inq-agree" type="checkbox" name="agree" required />
              <span>
                상담을 위해 이름·연락처·이메일을 받고, 상담이 끝나면 1년 안에 지웁니다. 이에 동의합니다.
              </span>
            </label>

            {state.kind === "error" && (
              <p className={s.error} role="alert">
                {state.msg}
              </p>
            )}

            <button type="submit" className={`btn btn--dark ${s.submit}`} disabled={state.kind === "sending"}>
              {state.kind === "sending" ? "보내는 중…" : "문의 보내기"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
