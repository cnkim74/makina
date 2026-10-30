import { currentUser, hasRole } from "@/lib/auth";
import { getBucket } from "@/lib/cf";

/** 로그인한 직원만 보는 파일 (명함 사진: R2 cards/). 공개 /media 로는 나가지 않는다 */
export async function GET(_: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const user = await currentUser();
  if (!user || !hasRole(user, "editor")) return new Response("Unauthorized", { status: 401 });
  const { key: parts } = await params;
  const key = parts.map(decodeURIComponent).join("/");
  if (!/^cards\/[\w.\-]+$/.test(key)) return new Response("Not found", { status: 404 });
  const bucket = await getBucket();
  const obj = bucket ? await bucket.get(key) : null;
  if (!obj) return new Response("Not found", { status: 404 });
  return new Response(obj.body, {
    headers: {
      "content-type": obj.httpMetadata?.contentType ?? "application/octet-stream",
      "cache-control": "private, max-age=3600",
    },
  });
}
