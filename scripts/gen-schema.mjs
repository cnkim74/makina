// migrations/*.sql → src/lib/schema.generated.ts
// 배포 명령에서 마이그레이션이 빠졌을 때도 사이트가 첫 실행에 표를 만들 수 있도록
// 스키마를 코드에 함께 싣는다. 원본은 언제나 migrations/ 폴더다.
import fs from "node:fs";
import path from "node:path";

const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const dir = path.join(root, "migrations");
const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const statements = files.flatMap((f) =>
  fs
    .readFileSync(path.join(dir, f), "utf8")
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean),
);

const out = `// 자동 생성 파일 — 고치지 마세요. \`node scripts/gen-schema.mjs\` (빌드·개발 서버 시작 때 자동 실행)
// 원본: ${files.map((f) => `migrations/${f}`).join(", ")}
export const SCHEMA_STATEMENTS: readonly string[] = ${JSON.stringify(statements, null, 2)};
`;

const target = path.join(root, "src/lib/schema.generated.ts");
if (!fs.existsSync(target) || fs.readFileSync(target, "utf8") !== out) {
  fs.writeFileSync(target, out);
  console.log(`schema: ${statements.length} statements → src/lib/schema.generated.ts`);
}
