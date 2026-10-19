# makina

성원마끼나(MAKKINA) 브랜드 웹사이트.
경북 안동 서후면에서 조사료(축산 사료) 작업기를 만드는 제조사의 공식 사이트입니다.

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드
npm run lint     # ESLint
```

Node 22 이상, Next.js 16 (App Router, TypeScript, CSS Modules). Tailwind 등 외부 UI 라이브러리는 쓰지 않습니다.

## 배포 (Cloudflare Workers)

[OpenNext Cloudflare 어댑터](https://opennext.js.org/cloudflare)로 Cloudflare Workers에 배포합니다. 설정 파일은 `wrangler.jsonc`, `open-next.config.ts` 입니다.

```bash
npm run cf:build     # Next 빌드 + Workers 번들 생성 (.open-next/)
npm run cf:preview   # 빌드 후 로컬에서 Workers 런타임으로 미리보기
npm run cf:deploy    # 빌드 후 Cloudflare에 배포 (wrangler 로그인 또는 CLOUDFLARE_API_TOKEN 필요)
```

**방법 A. Cloudflare 대시보드에서 GitHub 연결 (권장, 푸시할 때마다 자동 배포)**

1. Cloudflare 대시보드 → Workers & Pages → Create → **Import a repository** → `cnkim74/makina` 선택
2. 빌드 설정
   - Build command: `npx opennextjs-cloudflare build`
   - Deploy command: `npx opennextjs-cloudflare deploy`
   - Root directory: `/`
3. 저장하면 첫 배포가 시작되고, 이후 기본 브랜치에 푸시할 때마다 자동 배포됩니다.

**방법 B. 터미널에서 직접**

```bash
npx wrangler login    # 처음 한 번, 브라우저로 Cloudflare 로그인
npm run cf:deploy
```

CI나 Claude 세션처럼 브라우저 로그인이 안 되는 곳에서는 환경 변수 `CLOUDFLARE_API_TOKEN`(Workers Scripts 편집 권한)과 `CLOUDFLARE_ACCOUNT_ID`를 넣으면 `npm run cf:deploy`가 바로 됩니다.

배포 후 커스텀 도메인은 Cloudflare 대시보드 → 해당 Worker → Settings → Domains & Routes 에서 연결합니다.

## 관리자(CMS)

`/admin` 에서 회원가입·로그인 후 문의, 유튜브 영상, SNS, 히어로, 연락처·고객지원 연결, 분석, 회원을 관리합니다. 데이터는 Cloudflare **D1**(SQLite), 올린 사진·영상은 **R2**에 저장합니다.

| 메뉴 | 하는 일 | 홈페이지 반영 위치 |
| --- | --- | --- |
| 문의 | 홈페이지 “문의 남기기” 접수 목록, 상태(새 문의/처리 중/완료)·메모 | — |
| 유튜브 영상 | 주소만 넣으면 제목·썸네일 자동, 순서·공개 여부 | 작업 영상 (사이트 안에서 재생) |
| SNS | 유튜브·인스타그램·블로그 등 채널 주소 | 푸터 버튼, “유튜브 채널에서 더 보기” |
| 히어로 | 영상·사진 올리기(R2), 영상 주소, 장면 글자, 슬로건 | 첫 화면 |
| 고객지원 · 연결 | 전화·주소·카카오톡 채널·지도, 새 문의 알림(웹훅), 채널톡 | 전화 버튼, 카카오톡 버튼, 오시는 길, 푸터 |
| 분석 | 자체 집계(열람·전화·카카오톡·문의·영상 재생), GA4 측정 ID 연결 | — |
| 회원 | 가입 승인, 권한(대표/관리자/편집자) | — |

- **첫 가입자가 대표(owner)** 가 됩니다. 이후 가입자는 “승인 대기”로 들어오고, 관리자가 승인해야 로그인할 수 있습니다. 배포 직후 바로 대표 계정을 만드세요.
- 비밀번호는 PBKDF2(SHA-256, 10만 회)로 저장하고, 로그인은 httpOnly 쿠키 세션(30일)입니다. 5번 연속 틀리면 15분 잠깁니다.
- D1이 연결되기 전에는 홈페이지가 `src/data/` 의 기본 콘텐츠로 그대로 뜨고, `/admin` 에는 아래 설정 안내가 나옵니다.

### 처음 한 번: D1·R2 만들기

1. Cloudflare 대시보드 → Storage & Databases → **D1** → Create → 이름 `makina-db` → 만든 뒤 **Database ID** 복사
2. 대시보드 → **R2** → Create bucket → 이름 `makina-media`
3. `wrangler.jsonc` 의 “운영 연결”에 1번 ID 를 넣어 커밋·푸시 (완료: `090ea305-…`)
4. (권장) Workers 빌드 설정의 Deploy command 를 아래로 바꿉니다 (배포할 때마다 스키마를 맞춤). 빠뜨려도 사이트가 첫 실행에 `migrations/` 와 같은 표를 만듭니다

   ```
   npx wrangler d1 migrations apply makina-db --remote && npx opennextjs-cloudflare deploy
   ```

5. 배포가 끝나면 `https://<사이트>/admin/signup` 에서 대표 계정을 만듭니다.

### 연결 서비스

| 서비스 | 넣는 곳 | 비고 |
| --- | --- | --- |
| Google Analytics 4 | 관리자 → 분석 → 측정 ID (`G-…`) | 전화·카카오톡·문의·영상 재생이 GA4 이벤트로도 기록 |
| 채널톡 | 관리자 → 고객지원 · 연결 → 플러그인 키 | 모바일에선 기본 버튼을 숨기고 도크와 겹치지 않게 배치 |
| 새 문의 알림 | 관리자 → 고객지원 · 연결 → 웹훅 주소 | 슬랙·디스코드 웹훅, 그 밖의 주소엔 JSON POST |
| 카카오톡 채널 | 관리자 → 고객지원 · 연결 | 비워 두면 카카오톡 버튼이 문의 양식으로 연결 |

키·주소는 저장소가 아니라 D1 설정에 저장됩니다.

### 로컬 개발

```bash
npm run db:migrate:local   # 로컬 D1(.wrangler/)에 스키마 적용
npm run dev                # env.dev 바인딩(로컬 D1·R2)으로 실행 → http://localhost:3000/admin/signup
```

스키마를 바꿀 때는 `migrations/0002_….sql` 처럼 새 파일을 추가합니다. 이미 적용된 파일은 고치지 않습니다. 빌드·개발 서버가 시작될 때 `scripts/gen-schema.mjs` 가 `src/lib/schema.generated.ts` 를 다시 만듭니다(표가 하나도 없을 때 사이트가 스스로 만드는 데 씀). 그 뒤의 변경은 배포 명령의 마이그레이션으로 적용됩니다.

## 저장소 구조

```
docs/design/          디자인 시스템 원본 (브랜드북, 토큰, 시안 HTML, 폰트 컨셉)
src/app/              Next.js 라우트. layout.tsx(메타데이터), page.tsx(메인), globals.css
src/styles/tokens.css 디자인 토큰 → CSS 변수 (docs/design/tokens.json 과 동기화)
src/styles/fonts.css  웹폰트 @font-face (self-host → CDN → 시스템 폴백)
src/data/site.ts      전화번호·주소·메뉴 등 사이트 공통 정보
src/data/content.ts   제품·작업 흐름·마력표·영상·소모품·고객지원 콘텐츠 (CMS 값이 없을 때의 기본값)
src/components/       메인 화면 섹션 컴포넌트 (각각 .tsx + .module.css)
src/app/admin/        관리자 화면 (로그인·가입, (panel)/ 아래 메뉴별 화면, actions.ts 서버 액션)
src/app/api/          문의 접수, 분석 이벤트, 관리자 파일 올리기
src/app/media/        R2에 올린 파일 내려주기 (영상 Range 지원)
src/lib/              D1·R2 접근, 인증, 설정, 공개 데이터 조립, 유튜브·분석 도우미
migrations/           D1 스키마 (wrangler d1 migrations)
src/components/placeholders/  사진·누끼·지도 자리표시 SVG. 실제 자료가 오면 교체
public/fonts/         웹폰트 파일 넣는 곳 (README 참고)
public/images/        제품 누끼·현장 사진 넣는 곳
```

## 화면 컨셉

[ZIPLAN](https://github.com/cnkim74/ziplan-site) 컨셉(애플식 스토어프런트 + 리퀴드 글래스 + 스크롤 장면 히어로)에 성원마끼나 브랜드 색과 대동 홈페이지식 정보 구성을 얹었습니다. 규칙은 `CLAUDE.md`의 "화면 문법" 참고.

## 메인 화면 구성

| 섹션 | 컴포넌트 | 비고 |
| --- | --- | --- |
| 떠 있는 유리 내비 | `Header` | 히어로 위에선 어두운 유리, 그 아래선 밝은 유리. 커서를 따라 유리 방울이 미끄러짐 |
| 히어로 | `Hero` | 스크롤로 움직이는 영상: BALE → MACHINE → FIELD → HARVEST |
| 바로 가기 | `QuickDoors` | 구매 상담 · 소모품 · 정비 |
| 조사료 작업 흐름 | `WorkFlow` | 유리 세그먼트로 5단계 전환 |
| 대표 작업기 | `Products` | 분류 탭 + 제품 타일 |
| 내 트랙터 마력으로 찾기 | `HpFinder` | 어두운 띠 위 유리 세그먼트 |
| 작업 영상 | `Videos` | 검색 · 해시태그 · 정렬, 관리자에서 올린 유튜브를 사이트 안에서 재생 |
| 소모품 빠른 주문 | `Consumables` | 수량 스테퍼, 전화 주문 |
| 고객지원 | `Support` | 펼침 목록 5개 |
| 문의 남기기 | `Inquiry` | 문의 종류·이름·전화·내용 → 관리자 “문의” |
| 오시는 길 | `Directions` | 구글 지도 퍼가기(키 불필요), 카카오맵 등록 장소(7941605) 크게 보기·길찾기, 네이버 지도, 주소 복사 |
| 푸터 | `Footer` | 애플식 링크 묶음 |
| 플로팅 캡슐 | `FloatingButtons` | 데스크톱 전용, 히어로가 끝나면 나타남 |
| 하단 유리 도크 | `MobileDock` | 모바일 전용 |

## 히어로 영상

히어로는 영상 한 편으로 만든 스크롤 장면입니다. 베일 클로즈업에서 카메라가 물러나 트랙터·베일러, 들판 전체로 넓어지고, 캡션이 BALE → MACHINE → FIELD → HARVEST 로 바뀝니다.

| 환경 | 재생 방식 | 파일 |
| --- | --- | --- |
| 데스크톱 | 스크롤이 곧 재생 헤드 (되감기 가능) | `public/videos/hero-1600.mp4` / `.webm` |
| 휴대폰·태블릿 | 소리 없이 자동 반복 | `public/videos/hero-960.mp4` / `.webm` |
| 움직임 줄이기 | 한 장면 | `public/images/hero/hero-still.webp` |
| 영상이 뜨기 전 | 첫 장면 | `public/images/hero/hero-poster.webp` |

- 원본(4K, 61MB)은 저장소에 넣지 않고 GitHub 릴리스 [`hero-video`](https://github.com/cnkim74/makina/releases/tag/hero-video)에 있습니다.
- 브라우저가 H.264를 틀 수 있으면 mp4, 아니면 VP9 webm을 씁니다.
- 경로와 캡션 타이밍은 `src/data/content.ts`의 `heroVideo`, `heroStory`에서 바꿉니다. `heroVideo`를 `null`로 두면 SVG 자리표시 장면으로 돌아갑니다.

영상을 바꿀 때는 원본을 받아 아래처럼 다시 만듭니다. 데스크톱판은 스크롤로 앞뒤로 자유롭게 넘길 수 있도록 4프레임마다 키프레임을 넣습니다.

```bash
# 데스크톱 (스크롤 되감기용)
ffmpeg -i source.mp4 -an -vf "scale=1600:900,format=yuv420p" -c:v libx264 -profile:v high -preset slow -crf 25 -g 4 -keyint_min 4 -bf 0 -sc_threshold 0 -movflags +faststart public/videos/hero-1600.mp4
ffmpeg -i source.mp4 -an -vf "scale=1600:900,format=yuv420p" -c:v libvpx-vp9 -b:v 0 -crf 38 -g 4 -keyint_min 4 -row-mt 1 public/videos/hero-1600.webm
# 모바일 (자동 반복)
ffmpeg -i source.mp4 -an -vf "scale=960:540,format=yuv420p" -c:v libx264 -preset slow -crf 27 -g 48 -movflags +faststart public/videos/hero-960.mp4
ffmpeg -i source.mp4 -an -vf "scale=960:540,format=yuv420p" -c:v libvpx-vp9 -b:v 0 -crf 40 -g 48 -row-mt 1 public/videos/hero-960.webm
# 포스터·정지 장면
ffmpeg -ss 0.25 -i source.mp4 -frames:v 1 -vf scale=1600:-2 public/images/hero/hero-poster.webp
ffmpeg -ss 7.2  -i source.mp4 -frames:v 1 -vf scale=1600:-2 public/images/hero/hero-still.webp
```

## 교체가 필요한 자리표시

- 작업 흐름 단계별 사진, 마력 찾기 띠 사진, 작업 영상 썸네일
- 제품 누끼 사진 → `public/images/` 에 넣고 `src/data/content.ts` 의 `image` 필드에 경로 지정
- 웹폰트 파일 → `public/fonts/` (없으면 CDN 사용)
- 대표자, 사업자등록번호, 팩스, 카카오톡 채널 링크 → 관리자 “고객지원 · 연결” (기본값은 `src/data/site.ts`)
- 유튜브·SNS 링크 → 관리자 “SNS”
