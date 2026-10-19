import Link from "next/link";
import a from "../admin.module.css";

/** DB 가 아직 연결되지 않았을 때 보이는 안내 */
export default function SetupGuide({ reason }: { reason: "no-binding" | "no-schema" }) {
  return (
    <div className={a.authPage}>
      <div className={`${a.card} ${a.guide}`}>
        <h1>관리자 화면을 켜려면 한 번만 설정해 주세요</h1>
        <p className={a.sub}>
          {reason === "no-binding"
            ? "Cloudflare 데이터베이스(D1)와 파일 저장소(R2)가 아직 연결되지 않았습니다. 연결 전에도 홈페이지는 지금 내용 그대로 잘 열립니다."
            : "데이터베이스는 연결되었지만 표(테이블)가 아직 만들어지지 않았습니다. 아래 4번만 하시면 됩니다."}
        </p>
        <ol>
          <li>
            Cloudflare 대시보드 → <b>Storage &amp; Databases → D1</b> → <b>Create</b> → 이름 <code>makina-db</code> 로 만들고,
            만들어진 <b>Database ID</b> 를 복사합니다.
          </li>
          <li>
            <b>R2 Object Storage</b> → <b>Create bucket</b> → 이름 <code>makina-media</code> 로 만듭니다.
          </li>
          <li>
            저장소의 <code>wrangler.jsonc</code> 에서 &quot;운영 연결&quot; 주석을 풀고 Database ID 를 넣습니다. (Claude 에게 ID 를
            알려 주면 대신 해 드립니다.)
          </li>
          <li>
            Cloudflare Workers 설정의 <b>Deploy command</b> 를 아래로 바꿉니다. 배포할 때마다 표가 자동으로 맞춰집니다.
            <pre>npx wrangler d1 migrations apply makina-db --remote &amp;&amp; npx opennextjs-cloudflare deploy</pre>
          </li>
          <li>
            배포가 끝나면 <Link href="/admin/signup">/admin/signup</Link> 에서 가입하세요. <b>처음 가입한 사람이 대표 관리자</b>가
            됩니다.
          </li>
        </ol>
        <p className={a.sub}>자세한 내용은 저장소 README 의 &quot;CMS 설정&quot;에 있습니다.</p>
        <p>
          <Link href="/" className={a.linkBtn}>
            ← 홈페이지로
          </Link>
        </p>
      </div>
    </div>
  );
}
