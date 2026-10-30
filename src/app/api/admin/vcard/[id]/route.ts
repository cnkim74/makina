import { currentUser, hasRole } from "@/lib/auth";
import { first, readyDb } from "@/lib/db";

type Card = { name: string; company: string; title: string; phone: string; mobile: string; email: string; address: string; memo: string };

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");

/** 명함 한 장 → vCard 3.0 (휴대폰 연락처에 바로 저장) */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user || !hasRole(user, "editor")) return new Response("Unauthorized", { status: 401 });
  const db = await readyDb();
  const { id } = await params;
  const c = db ? await first<Card>(db, "SELECT * FROM name_cards WHERE id = ?", Number(id)) : null;
  if (!c) return new Response("Not found", { status: 404 });
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${esc(c.name)}`,
    `N:${esc(c.name)};;;;`,
    c.company && `ORG:${esc(c.company)}`,
    c.title && `TITLE:${esc(c.title)}`,
    c.mobile && `TEL;TYPE=CELL:${c.mobile}`,
    c.phone && `TEL;TYPE=WORK:${c.phone}`,
    c.email && `EMAIL:${c.email}`,
    c.address && `ADR;TYPE=WORK:;;${esc(c.address)};;;;`,
    c.memo && `NOTE:${esc(c.memo)}`,
    "END:VCARD",
  ].filter(Boolean);
  const file = encodeURIComponent(`${c.name}.vcf`);
  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "content-type": "text/vcard; charset=utf-8",
      "content-disposition": `attachment; filename*=UTF-8''${file}`,
      "cache-control": "private, no-store",
    },
  });
}
