import "server-only";

/*
 * DB 에 넣는 토큰(페이스북 페이지 토큰 등)을 AES-GCM 으로 감싼다.
 * 열쇠는 Workers 비밀 값(FB_APP_SECRET)에서 만든다 — 비밀 값이 바뀌면 다시 연결해야 한다.
 */
const enc = new TextEncoder();

async function keyFrom(secret: string) {
  const raw = await crypto.subtle.digest("SHA-256", enc.encode(`makina-token:${secret}`));
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}

const b64 = (b: Uint8Array) => btoa(String.fromCharCode(...b));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export async function seal(plain: string, secret: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await keyFrom(secret), enc.encode(plain)));
  return `v1.${b64(iv)}.${b64(ct)}`;
}

export async function open(sealed: string, secret: string): Promise<string | null> {
  const [v, iv, ct] = sealed.split(".");
  if (v !== "v1" || !iv || !ct || !secret) return null;
  try {
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(iv) }, await keyFrom(secret), unb64(ct));
    return new TextDecoder().decode(pt);
  } catch {
    return null;
  }
}
