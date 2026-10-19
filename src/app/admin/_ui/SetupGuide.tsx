import Link from "next/link";
import a from "../admin.module.css";

/** DB 가 아직 쓸 수 없을 때 보이는 안내. 무엇이 문제인지 그대로 보여 준다 */
export default function SetupGuide({ reason, detail }: { reason: "no-binding" | "no-schema"; detail?: string }) {
  return (
    <div className={a.authPage}>
      <div className={`${a.card} ${a.guide}`}>
        <h1>관리자 화면을 아직 열 수 없습니다</h1>
        {reason === "no-binding" ? (
          <>
            <p className={a.sub}>
              이 배포에는 데이터베이스(D1) 연결이 없습니다. 홈페이지는 지금 내용 그대로 잘 열립니다.
            </p>
            <ol>
              <li>
                Cloudflare → Workers &amp; Pages → <b>makina</b> → <b>Settings → Bindings</b> 에 <code>DB</code>(D1 makina-db)와{" "}
                <code>MEDIA</code>(R2 makina-media)가 있는지 확인합니다.
              </li>
              <li>
                없다면 가장 최근 배포가 <code>wrangler.jsonc</code> 에 연결 설정을 넣기 전 버전입니다. <b>Deployments</b> 에서 최신
                커밋으로 다시 배포하세요.
              </li>
            </ol>
          </>
        ) : (
          <>
            <p className={a.sub}>데이터베이스는 연결되었지만 표(테이블)를 만들지 못했습니다.</p>
            {detail && (
              <pre>
                오류: {detail}
              </pre>
            )}
            <ol>
              <li>이 화면을 캡처해서 Claude 에게 보내 주세요. 오류 내용을 보고 고칩니다.</li>
              <li>
                또는 Workers 빌드 설정의 <b>Deploy command</b> 를 아래로 바꾸고 다시 배포하면 배포 때 표를 만듭니다.
                <pre>npx wrangler d1 migrations apply makina-db --remote &amp;&amp; npx opennextjs-cloudflare deploy</pre>
              </li>
            </ol>
          </>
        )}
        <p>
          <Link href="/" className={a.linkBtn}>
            ← 홈페이지로
          </Link>
        </p>
      </div>
    </div>
  );
}
