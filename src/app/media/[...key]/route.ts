import { getBucket, type R2Range } from "@/lib/cf";

/**
 * 관리자 화면에서 올린 파일(R2) 내보내기.
 * 영상 되감기를 위해 Range 요청(206)을 지원한다.
 */
export async function GET(req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key: parts } = await params;
  const key = parts.map(decodeURIComponent).join("/");
  if (!/^(hero|uploads)\/[\w.\-]+$/.test(key)) return new Response("Not found", { status: 404 });

  const bucket = await getBucket();
  if (!bucket) return new Response("Storage not configured", { status: 404 });

  const head = await bucket.head(key);
  if (!head) return new Response("Not found", { status: 404 });

  const type = head.httpMetadata?.contentType ?? "application/octet-stream";
  const common = {
    "content-type": type,
    "accept-ranges": "bytes",
    "cache-control": "public, max-age=31536000, immutable",
    etag: head.etag,
  };

  const range = parseRange(req.headers.get("range"), head.size);
  if (range === "invalid") {
    return new Response(null, { status: 416, headers: { "content-range": `bytes */${head.size}` } });
  }

  if (range) {
    const obj = await bucket.get(key, { range: range.r2 });
    if (!obj) return new Response("Not found", { status: 404 });
    return new Response(obj.body, {
      status: 206,
      headers: {
        ...common,
        "content-length": String(range.end - range.start + 1),
        "content-range": `bytes ${range.start}-${range.end}/${head.size}`,
      },
    });
  }

  const obj = await bucket.get(key);
  if (!obj) return new Response("Not found", { status: 404 });
  return new Response(obj.body, { headers: { ...common, "content-length": String(head.size) } });
}

function parseRange(h: string | null, size: number): { start: number; end: number; r2: R2Range } | "invalid" | null {
  if (!h) return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(h.trim());
  if (!m) return null;
  let start: number;
  let end: number;
  if (m[1] === "" && m[2] !== "") {
    const n = Math.min(Number(m[2]), size);
    start = size - n;
    end = size - 1;
  } else {
    start = Number(m[1]);
    end = m[2] === "" ? size - 1 : Math.min(Number(m[2]), size - 1);
  }
  if (Number.isNaN(start) || start >= size || end < start) return "invalid";
  return { start, end, r2: { offset: start, length: end - start + 1 } };
}
