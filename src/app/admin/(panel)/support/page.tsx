import { hasRole, requireUser } from "@/lib/auth";
import { readyDb } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { saveContact, saveIntegrations } from "../../actions";
import { Submit } from "../../_ui/client";
import { Flash, PageHead } from "../../_ui/server";
import a from "../../admin.module.css";

export default async function Support({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const db = (await readyDb())!;
  const [c, integ] = await Promise.all([getSetting(db, "contact"), getSetting(db, "integrations")]);
  const canEdit = hasRole(user, "admin");

  return (
    <>
      <PageHead
        title="고객지원 · 연결"
        desc="홈페이지 곳곳의 전화 버튼, 카카오톡 상담, 오시는 길, 새 문의 알림, 채널톡 상담 창을 여기서 정합니다."
      />
      <Flash msg={sp.msg} />
      {!canEdit && <Flash msg="편집자는 볼 수만 있습니다. 바꾸려면 관리자에게 부탁하세요." warn />}

      <form action={saveContact} className={a.form}>
        <fieldset disabled={!canEdit} style={{ border: 0, padding: 0, margin: 0, display: "contents" }}>
          <section className={a.card}>
            <h2>연락처</h2>
            <p className={a.sub}>대표 전화는 홈페이지의 모든 “전화 상담” 버튼에 들어갑니다.</p>
            <div className={`${a.row} ${a.row3}`}>
              <label className={a.field}>
                <span>대표 전화</span>
                <input name="phone" defaultValue={c.phone} required inputMode="tel" />
              </label>
              <label className={a.field}>
                <span>
                  두 번째 전화 <small>(선택)</small>
                </span>
                <input name="phone2" defaultValue={c.phone2} inputMode="tel" placeholder="054-843-4001" />
              </label>
              <label className={a.field}>
                <span>상담 시간</span>
                <input name="hours" defaultValue={c.hours} maxLength={120} />
              </label>
            </div>
            <label className={a.field}>
              <span>주소</span>
              <input name="address" defaultValue={c.address} maxLength={200} />
            </label>
            <div className={`${a.row} ${a.row3}`}>
              <label className={a.field}>
                <span>대표자</span>
                <input name="ceo" defaultValue={c.ceo} maxLength={30} />
              </label>
              <label className={a.field}>
                <span>사업자등록번호</span>
                <input name="bizNo" defaultValue={c.bizNo} maxLength={30} />
              </label>
              <label className={a.field}>
                <span>팩스</span>
                <input name="fax" defaultValue={c.fax} maxLength={30} />
              </label>
            </div>
          </section>

          <section className={a.card}>
            <h2>카카오톡 · 지도</h2>
            <div className={a.row}>
              <label className={a.field}>
                <span>
                  카카오톡 채널 주소 <small>비워 두면 버튼이 “문의 남기기”로 연결됩니다</small>
                </span>
                <input name="kakaoUrl" defaultValue={c.kakaoUrl} placeholder="https://pf.kakao.com/_xxxxx/chat" />
              </label>
              <label className={a.field}>
                <span>
                  지도 크게 보기 주소 <small>카카오맵 장소 링크 · 길찾기·지도는 주소로 자동</small>
                </span>
                <input name="mapUrl" defaultValue={c.mapUrl} placeholder="https://map.kakao.com/..." />
              </label>
            </div>
            <p className={a.muted}>
              카카오톡 채널 주소는 카카오톡 채널 관리자센터 → 채널 홈 → “채팅 링크”에서 복사합니다.
            </p>
          </section>

          {canEdit && (
            <div className={a.actions}>
              <Submit>연락처 저장</Submit>
            </div>
          )}
        </fieldset>
      </form>

      <form action={saveIntegrations} className={a.form} style={{ marginTop: 24 }}>
        <fieldset disabled={!canEdit} style={{ border: 0, padding: 0, margin: 0, display: "contents" }}>
          <section className={a.card}>
            <h2>새 문의 알림</h2>
            <p className={a.sub}>
              문의가 들어오면 슬랙·디스코드 같은 메신저로 바로 알려 줍니다. 받는 곳에서 만든 “웹훅 주소”를 넣으세요.
            </p>
            <label className={a.field}>
              <span>
                웹훅 주소 <small>홈페이지에는 보이지 않습니다</small>
              </span>
              <input
                name="inquiryWebhook"
                defaultValue={integ.inquiryWebhook}
                placeholder="https://hooks.slack.com/services/..."
                autoComplete="off"
              />
            </label>
          </section>

          <section className={a.card}>
            <h2>채널톡 상담 창</h2>
            <p className={a.sub}>
              채널톡(channel.io)에 가입하면 홈페이지 오른쪽 아래에 실시간 상담 창이 생깁니다. 직원 휴대폰 앱으로 답할 수 있습니다.
            </p>
            <label className={a.field}>
              <span>
                플러그인 키 <small>채널톡 관리자 → 설정 → 채널 설정 → 버튼 설치</small>
              </span>
              <input name="channelTalkKey" defaultValue={integ.channelTalkKey} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" autoComplete="off" />
            </label>
          </section>

          {canEdit && (
            <div className={a.actions}>
              <Submit>연결 저장</Submit>
            </div>
          )}
        </fieldset>
      </form>
    </>
  );
}
