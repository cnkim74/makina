"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import a from "../admin.module.css";

/* 블로그 관리 화면의 클라이언트 조각 */

/** AI 초안 버튼 — 기다리는 동안 안내 */
export function AiSubmit() {
  const { pending } = useFormStatus();
  return (
    <>
      <button type="submit" className={a.btn} disabled={pending}>
        {pending ? "AI 가 글을 쓰는 중… (1~2분)" : "AI 로 초안 쓰기"}
      </button>
      {pending && <p className={a.muted}>창을 닫지 말고 기다려 주세요. 다 쓰면 편집 화면이 열립니다.</p>}
    </>
  );
}

async function upload(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("dir", "blog");
  const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const j = (await r.json()) as { error?: string; url?: string };
  if (!r.ok || !j.url) throw new Error(j.error ?? "올리지 못했습니다.");
  return j.url;
}

/** 본문에 사진 넣기 — 올린 뒤 커서 자리에 ![설명](주소) 를 넣는다 */
export function BodyImage({ target }: { target: string }) {
  const [state, setState] = useState<{ busy?: boolean; error?: string }>({});
  return (
    <label className={a.field}>
      <span>
        본문에 사진 넣기 <small>jpg·png·webp · 올리면 글쓴 자리(커서)에 들어갑니다</small>
      </span>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={state.busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setState({ busy: true });
          try {
            const url = await upload(file);
            const ta = document.getElementById(target) as HTMLTextAreaElement | null;
            if (ta) {
              const md = `\n\n![사진 설명](${url} "사진 아래 글")\n\n`;
              const at = ta.selectionStart ?? ta.value.length;
              ta.value = ta.value.slice(0, at) + md + ta.value.slice(at);
              ta.focus();
            }
            setState({});
          } catch (err) {
            setState({ error: err instanceof Error ? err.message : "올리지 못했습니다." });
          }
          e.target.value = "";
        }}
      />
      {state.busy && <small>올리는 중…</small>}
      {state.error && (
        <small className={a.error} role="alert">
          {state.error}
        </small>
      )}
    </label>
  );
}

/** 표지 사진 올리기 — 주소 칸을 채운다 */
export function CoverImage({ initial }: { initial: string }) {
  const [url, setUrl] = useState(initial);
  const [state, setState] = useState<{ busy?: boolean; error?: string }>({});
  return (
    <div className={a.row}>
      <label className={a.field}>
        <span>
          표지 사진 주소 <small>“사진” 표지일 때 · 페이스북 미리보기 그림으로도 씁니다</small>
        </span>
        <input name="cover_image" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/media/uploads/…" />
      </label>
      <label className={a.field}>
        <span>표지 사진 올리기</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={state.busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setState({ busy: true });
            try {
              setUrl(await upload(file));
              setState({});
            } catch (err) {
              setState({ error: err instanceof Error ? err.message : "올리지 못했습니다." });
            }
            e.target.value = "";
          }}
        />
        {state.busy && <small>올리는 중…</small>}
        {state.error && (
          <small className={a.error} role="alert">
            {state.error}
          </small>
        )}
      </label>
    </div>
  );
}

/** 저장 버튼 (intent 로 저장·발행·내리기를 나눈다) */
export function IntentButton({ intent, children, ghost }: { intent: string; children: React.ReactNode; ghost?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" name="intent" value={intent} className={`${a.btn} ${ghost ? a.btnGhost : ""}`} disabled={pending}>
      {pending ? "처리 중…" : children}
    </button>
  );
}
