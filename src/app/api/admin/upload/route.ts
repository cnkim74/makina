import { currentUser, hasRole } from "@/lib/auth";
import { getBucket } from "@/lib/cf";
import { readyDb, run } from "@/lib/db";

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};
// Workers 메모리(128MB) 안에서 폼 해석과 R2 저장을 함께 하려면 50MB 가 안전하다.
// 히어로 영상은 1600px·무음으로 줄이면 보통 10~20MB 다.
const MAX = 50 * 1024 * 1024;

/** 관리자 "히어로" 화면의 파일 올리기 → R2 */
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || !hasRole(user, "editor")) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const bucket = await getBucket();
  const db = await readyDb();
  if (!bucket || !db) {
    return Response.json({ error: "파일 저장소(R2)가 아직 연결되지 않았습니다." }, { status: 503 });
  }

  let file: File | null = null;
  try {
    const fd = await req.formData();
    const f = fd.get("file");
    file = f instanceof File ? f : null;
  } catch {
    /* 아래에서 처리 */
  }
  if (!file) return Response.json({ error: "파일을 골라 주세요." }, { status: 400 });

  const ext = TYPES[file.type];
  if (!ext) return Response.json({ error: "jpg·png·webp·avif 사진이나 mp4·webm 영상만 올릴 수 있습니다." }, { status: 400 });
  if (file.size > MAX) return Response.json({ error: "50MB 이하 파일만 올릴 수 있습니다. 영상은 줄여서 올려 주세요." }, { status: 400 });

  const base =
    file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "file";
  const key = `hero/${Date.now().toString(36)}-${base}.${ext}`;

  // R2 는 길이를 아는 본문만 받는다 (스트림은 길이를 몰라 거절됨)
  await bucket.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" },
  });
  await run(
    db,
    "INSERT INTO media (r2_key, filename, content_type, size) VALUES (?, ?, ?, ?)",
    key,
    file.name.slice(0, 120),
    file.type,
    file.size,
  );

  return Response.json({ ok: true, url: `/media/${key}`, type: file.type });
}
