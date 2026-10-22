import { hasRole, requireUser } from "@/lib/auth";
import { all, readyDb } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { kstDate } from "@/lib/time";
import { deleteMedia, resetHero, saveHero } from "../../actions";
import { ConfirmSubmit, CopyButton, Submit, UploadBox } from "../../_ui/client";
import { Flash, PageHead } from "../../_ui/server";
import a from "../../admin.module.css";

type Media = { id: number; r2_key: string; filename: string; content_type: string; size: number; created_at: string };

const SLOTS = 6;

export default async function Hero({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const db = (await readyDb())!;
  const [hero, media] = await Promise.all([
    getSetting(db, "hero"),
    all<Media>(db, "SELECT id, r2_key, filename, content_type, size, created_at FROM media ORDER BY id DESC LIMIT 60"),
  ]);
  const urls = media.map((m) => `/media/${m.r2_key}`);
  const v = hero.video;

  return (
    <>
      <PageHead
        title="히어로"
        desc="홈페이지 첫 화면입니다. 스크롤을 내리면 영상이 앞으로 감기고, 영문 큰 글자와 한글 설명이 차례로 바뀝니다."
      >
        <a href="/" target="_blank" rel="noopener noreferrer" className={`${a.btn} ${a.btnGhost}`}>
          홈페이지에서 보기 ↗
        </a>
      </PageHead>
      <Flash msg={sp.msg} />

      <section className={a.card}>
        <h2>히어로 영상 만드는 법</h2>
        <div className={a.guide}>
          <ol>
            <li>
              <b>찍기</b> — 휴대폰을 가로로 들고, 베일러가 들판을 지나가는 장면을 <b>한 번에 10~20초</b> 천천히 따라가며 찍습니다.
              흔들림이 적을수록 스크롤이 부드럽습니다. 새벽·해 질 녘 빛이 브랜드 색과 가장 잘 맞습니다.
            </li>
            <li>
              <b>줄이기</b> — 원본은 구글 드라이브에 보관하고, 홈페이지용은 소리를 빼고 가로 1600px(컴퓨터)·960px(휴대폰)로 줄입니다.
              아래 명령을 쓰면 스크롤에 맞게 프레임을 촘촘히 넣어 줍니다.
            </li>
          </ol>
          <pre>{`# 컴퓨터용 (스크롤 되감기: 4프레임마다 키프레임)
ffmpeg -i 원본.mp4 -an -vf "scale=1600:900,format=yuv420p" -c:v libx264 -crf 25 -g 4 -keyint_min 4 -bf 0 -sc_threshold 0 -movflags +faststart hero-1600.mp4
ffmpeg -i 원본.mp4 -an -vf "scale=1600:900,format=yuv420p" -c:v libvpx-vp9 -b:v 0 -crf 38 -g 4 -keyint_min 4 -row-mt 1 hero-1600.webm
# 휴대폰용 (자동 반복)
ffmpeg -i 원본.mp4 -an -vf "scale=960:540,format=yuv420p" -c:v libx264 -crf 27 -g 48 -movflags +faststart hero-960.mp4
ffmpeg -i 원본.mp4 -an -vf "scale=960:540,format=yuv420p" -c:v libvpx-vp9 -b:v 0 -crf 40 -g 48 -row-mt 1 hero-960.webm
# 첫 장면·정지 사진
ffmpeg -ss 0.25 -i 원본.mp4 -frames:v 1 -vf scale=1600:-2 hero-poster.webp
ffmpeg -ss 7    -i 원본.mp4 -frames:v 1 -vf scale=1600:-2 hero-still.webp`}</pre>
          <ol start={3}>
            <li>
              <b>올리기</b> — 아래 “파일 올리기”로 올리면 주소가 생깁니다. 그 주소를 영상·사진 칸에 넣고 저장하세요.
            </li>
            <li>
              <b>글자 고르기</b> — 장면마다 영문 한 단어와 한글 한 줄을 넣습니다. 칸 수만큼 영상 구간이 고르게 나뉩니다.
            </li>
          </ol>
        </div>
      </section>

      <section className={a.card} style={{ marginTop: 16 }}>
        <h2>파일</h2>
        <p className={a.sub}>올린 사진·영상은 Cloudflare R2에 보관됩니다. 주소를 복사해 아래 칸에 붙여 넣으세요.</p>
        <UploadBox />
        {media.length > 0 && (
          <div className={a.media} style={{ marginTop: 16 }}>
            {media.map((m) => {
              const url = `/media/${m.r2_key}`;
              return (
                <figure key={m.id} className={a.mediaItem}>
                  {m.content_type.startsWith("video/") ? (
                    <video src={url} muted playsInline preload="metadata" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt={m.filename} loading="lazy" />
                  )}
                  <div>
                    <b>{m.filename}</b>
                    <code>{url}</code>
                    <span className={a.muted}>
                      {(m.size / 1024 / 1024).toFixed(1)}MB · {kstDate(m.created_at)}
                    </span>
                    <CopyButton text={url} />
                    {hasRole(user, "admin") && (
                      <form action={deleteMedia}>
                        <input type="hidden" name="id" value={m.id} />
                        <ConfirmSubmit message={`${m.filename} 파일을 지울까요? 히어로에서 쓰는 중이면 화면이 비게 됩니다.`}>
                          지우기
                        </ConfirmSubmit>
                      </form>
                    )}
                  </div>
                </figure>
              );
            })}
          </div>
        )}
      </section>

      <form action={saveHero} className={a.form} style={{ marginTop: 16 }}>
        <datalist id="media-urls">
          {urls.map((u) => (
            <option key={u} value={u} />
          ))}
        </datalist>

        <section className={a.card}>
          <h2>보여 줄 방식</h2>
          <div className={a.row}>
            <label className={a.field}>
              <span>히어로 종류</span>
              <select name="mode" defaultValue={hero.mode}>
                <option value="video">현장 영상 (스크롤로 감기)</option>
                <option value="sketch">그림 장면 (새벽 들판 → 작업등 → 도면)</option>
              </select>
            </label>
            <label className={a.field}>
              <span>
                영상 끝 지점 <small>0.5~0.95 · 스크롤 끝에서 영상의 몇 % 까지 감을지</small>
              </span>
              <input name="end" type="number" min={0.5} max={0.95} step={0.05} defaultValue={v.end} />
            </label>
          </div>
          <div className={a.row}>
            <label className={a.field}>
              <span>윗줄 문구</span>
              <input name="tagline" defaultValue={hero.tagline} maxLength={40} />
            </label>
            <label className={a.field}>
              <span>슬로건</span>
              <input name="slogan" defaultValue={hero.slogan} maxLength={40} />
            </label>
          </div>
        </section>

        <section className={a.card}>
          <h2>영상·사진 주소</h2>
          <p className={a.sub}>
            mp4는 아이폰·대부분의 브라우저, webm은 그 밖의 브라우저용입니다. 둘 다 넣는 것이 가장 안전합니다. 정지 사진은 “움직임 줄이기”를
            켠 분께 보입니다.
          </p>
          <div className={a.row}>
            <MediaField name="desktop_mp4" label="컴퓨터 영상 mp4" value={v.desktop.mp4} />
            <MediaField name="desktop_webm" label="컴퓨터 영상 webm" value={v.desktop.webm} />
          </div>
          <div className={a.row}>
            <MediaField name="mobile_mp4" label="휴대폰 영상 mp4" value={v.mobile.mp4} />
            <MediaField name="mobile_webm" label="휴대폰 영상 webm" value={v.mobile.webm} />
          </div>
          <div className={a.row}>
            <MediaField name="poster" label="첫 장면 사진 (로딩 중)" value={v.poster} />
            <MediaField name="still" label="정지 사진 (움직임 줄이기)" value={v.still} />
          </div>
        </section>

        <section className={a.card}>
          <h2>장면 글자</h2>
          <p className={a.sub}>영문은 대문자 한 단어(16자까지), 한글은 한 줄로. 빈 칸은 건너뜁니다.</p>
          {Array.from({ length: SLOTS }, (_, i) => (
            <div key={i} className={a.row}>
              <label className={a.field}>
                <span>장면 {i + 1} · 영문</span>
                <input name={`word_${i}`} defaultValue={hero.story[i]?.word ?? ""} maxLength={16} />
              </label>
              <label className={a.field}>
                <span>장면 {i + 1} · 한글</span>
                <input name={`ko_${i}`} defaultValue={hero.story[i]?.ko ?? ""} maxLength={40} />
              </label>
            </div>
          ))}
        </section>

        <div className={a.actions}>
          <Submit>히어로 저장</Submit>
        </div>
      </form>

      {hasRole(user, "admin") && (
        <form action={resetHero} className={a.actions} style={{ marginTop: 12 }}>
          <ConfirmSubmit message="히어로를 처음 설정(저장소에 들어 있는 현장 영상)으로 되돌릴까요?">처음 설정으로 되돌리기</ConfirmSubmit>
        </form>
      )}
    </>
  );
}

function MediaField({ name, label, value }: { name: string; label: string; value: string }) {
  return (
    <label className={a.field}>
      <span>{label}</span>
      <input name={name} defaultValue={value} list="media-urls" placeholder="/media/hero/... 또는 https://" />
    </label>
  );
}
