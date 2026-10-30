# CLAUDE.md

이 저장소는 성원마끼나(MAKKINA) 브랜드 웹사이트 프로젝트입니다. 대화는 한국어로 합니다.

## 기술 스택과 명령

- Next.js 16 App Router + TypeScript + CSS Modules. Tailwind나 UI 라이브러리는 쓰지 않는다.
- `npm run dev` 개발 서버, `npm run build` 빌드, `npm run lint` 린트. 푸시 전에 `npx tsc --noEmit`, `npm run lint`, `npm run build`를 통과시킨다.
- 색·서체·간격은 `src/styles/tokens.css`의 CSS 변수를 쓴다. 하드코딩 금지.
- 사이트 정보(전화·주소·링크)는 `src/data/site.ts`, 콘텐츠(제품·영상·소모품)는 `src/data/content.ts`에만 둔다.
- 섹션 하나 = 컴포넌트 하나(`src/components/이름.tsx` + `이름.module.css`). 데스크톱 1440 기준으로 쓰고 `@media (max-width: 900px)`에서 모바일 390을 맞춘다.
- 사진·영상이 없는 자리는 `src/components/placeholders/`의 SVG로 채운다. 실제 자료가 오면 교체한다.
- 배포는 Cloudflare Workers + OpenNext 어댑터(`wrangler.jsonc`, `open-next.config.ts`). `npm run cf:build`로 번들이 만들어지는지 확인한 뒤 푸시한다. 배포 방법은 README의 "배포" 절 참고. 서버 기능(API 라우트, 폼 처리, DB)을 추가할 때는 Workers 바인딩(D1, R2, KV)을 `wrangler.jsonc`에 선언하고 `npm run cf:typegen`으로 타입을 만든다.

## 주력 제품

- 주력 제품은 **DRAGON(드래곤) 하이브리드 모우어 컨디셔너**다. 베면서 줄기를 파쇄하는 트랙터 부착 예취기. 60~150마력.
- 제품 글·사양의 원본은 회사 "DRAGON 제품소개서"(2026.8, HWP→PDF)와 2026-10-28 고객 교정(박람회 책자에 손으로 표시해 준 것). `src/data/content.ts` 의 `dragon`, `products`, `hpRanges` 가 그것을 옮긴 것이다. 받지 않은 사양을 추측해 넣지 않는다.
- 라인업은 DR210 · 230 · 250 · 280 · 314 다섯 모델. DR314 는 칼날 66개만 받았고 작업 폭·적용 마력·PTO·무게는 받는 대로 채운다(그 전에는 "문의").
- 가격은 홈페이지와 인쇄물에 싣지 않는다(2026-10-28 교정). 융자 한도 안내는 홈페이지에만 남기고 인쇄물에서는 뺀다(2026-10-30 교정). 소개서의 수입 경쟁사·모델명은 홈페이지에 싣지 않는다.
- 박람회 인쇄물(책자·리플렛·X배너)은 `docs/print/`. 인쇄물에는 회사 기존 로고(삼색 심볼 + 붓글씨 성원마끼나)를 쓴다.
- 사진 원본은 구글 드라이브 "성원마끼나 소스" 폴더. 웹용(가로 1000~1600, webp)으로 줄여 `public/images/dragon/` 에 둔다.
- 비무꼬(일체형 원형베일러)·블랙홀(드럼모우어)·모조리(제초 파쇄기)도 실제 제품이지만 주력이 아니다. 라인업 아래 "다른 작업기"에 한 줄씩만 소개한다.

## CMS (관리자)

- `/admin` 관리자. 데이터는 D1(`DB` 바인딩), 파일은 R2(`MEDIA`). 스키마는 `migrations/`, 바꿀 때는 새 번호 파일을 추가한다.
- `wrangler.jsonc` 최상위 바인딩이 운영 D1 `makina-db`·R2 `makina-media` 다. 로컬은 `env.dev` 를 쓴다(`npm run dev` 가 `NEXT_DEV_WRANGLER_ENV=dev` 로 실행). 운영 DB를 건드리는 명령(`--remote`)은 사용자 확인 없이 실행하지 않는다.
- 표가 하나도 없으면 `dbState()` 가 `src/lib/schema.generated.ts`(migrations 에서 자동 생성, 직접 고치지 않음)로 만든다. D1이 없어도 홈페이지는 `src/data/` 기본값으로 떠야 한다. 공개 화면 데이터는 `src/lib/public-data.ts` → `SiteDataProvider` → `useSite()`/`useSiteData()` 로 받는다.
- 연락처·연동 키·히어로 설정은 D1 `settings` 테이블(JSON)에 둔다. 비밀 값을 코드나 저장소에 넣지 않는다.
- 영업 관리(고객·견적·계약·매출·목표·명함)는 `migrations/0002_business.sql`, 서버 동작은 `src/app/admin/biz-actions.ts`, 계산·상태 이름은 `src/lib/biz.ts`. 금액은 원 단위 정수. 견적서·계약서 인쇄는 `src/app/admin/print/`. 명함 사진은 R2 `cards/` 에 두고 공개 `/media` 로 내보내지 않는다.
- GA4 보고서는 `src/lib/ga.ts`. 서비스 계정 키는 Workers 비밀 값(`GA_SA_EMAIL`, `GA_SA_KEY`)에만 두고 DB·저장소에 넣지 않는다.
- 관리자 화면은 사내용이라 `src/app/admin/admin.module.css` 한 파일을 쓴다. 공개 화면 규칙(리퀴드 글래스·모듈 문법)은 적용하지 않지만 토큰과 접근성 규칙은 지킨다.

## 작업 전에 읽을 것

- `docs/design/brand-guide.md`: 브랜드북. 컬러·타이포·모션·접근성 규칙의 원본. 레이아웃은 아래 "화면 문법"이 우선한다.
- `docs/design/tokens.json`: 색상·서체·간격·모서리 토큰. 하드코딩하지 말고 이 값을 쓴다.
- `docs/design/components/HomePage/README.md`, `HomePageMobile/README.md`: 메인 화면 구성과 교체할 자리표시 목록.

## 화면 문법 (2026-10 결정)

화면은 ZIPLAN(`cnkim74/ziplan-site`) 컨셉을 따른다. 브랜드 색과 서체 역할은 brand-guide.md 그대로 두고, 레이아웃 문법만 바꿨다. 정보 구성(작업기 분류·마력 찾기·작업 영상·빠른 상담 버튼·고객지원)은 대동 홈페이지 문법을 유지한다.

- 바탕: 흰색 `--bg` 과 연회색 `--bg-alt` 모듈이 번갈아 온다. 어두운 띠는 `--stage` (히어로·마력 찾기).
- 모듈: 가운데 정렬. 검은 라벨 칩(`.lab-k`) → 큰 제목(마침표로 끝) → 회색 설명(`.tag`) → 내용. 링크는 `.lnk` (건초금 계열 `--accent`, 끝에 ›).
- 리퀴드 글래스: 떠 있는 알약 내비, 세그먼트 컨트롤(`Segmented`), 플로팅 캡슐, 모바일 도크에만 `.glass` 를 쓴다. 히어로 위에서는 `.glass--dark`. 본문 카드에는 쓰지 않는다.
- 히어로: 스크롤로 움직이는 영상(`heroVideo`, src/data/content.ts). 데스크톱은 스크롤이 재생 헤드, 터치 기기는 자동 반복, 움직임 줄이기는 한 장면. 끝에서 흰 바탕으로 녹아든다. 원본 영상은 GitHub 릴리스 `hero-video`에 두고 저장소에는 웹용으로 줄인 파일만 넣는다(README "히어로 영상"). **히어로 영상(베일 장면 `hero-1600`·`hero-960`)과 캡션은 바꾸지 않는다.** 로고·문구 교정이 와도 히어로는 그대로 둔다(2026-10-30 요청).
- 타일·카드: 모서리 `--radius-tile` 22px / `--radius-card` 18px. 그림자는 hover 때만.
- 서체: 본문·제목 프리텐다드, 히어로 캡션 Archivo Black, 국문 로고 지마켓 산스, 슬로건·영상 자막·배지만 카페24 동동. DRAGON 제품명과 "베면서 부순다."는 HS봄바람체(`--font-dragon`, 2026-10-28 교정, 무료·상업 사용 가능). 웹에는 쓰는 글자만 남긴 `public/fonts/HSBombaram-sub.woff2` 를 두고, DRAGON 워드마크는 글꼴 윤곽(`src/components/dragon-word.ts`, `scripts/dragon-word.py`)이다.
- 로고(2026-10-28 교정): 회사 기존 로고(삼색 심볼 + 붓글씨 "성원마끼나")를 홈페이지·인쇄물 모두에 쓴다. 파일은 `public/brand/sungwon-logo.webp`(밝은 바탕)·`sungwon-logo-white.webp`(어두운 바탕), 화면에서는 `src/components/Logo.tsx` 의 `CompanyLogo` 를 쓴다. 파비콘은 심볼만 잘라 `src/app/icon.png`·`apple-icon.png`·`favicon.ico` 로 둔다. 예전 「발톱」 안(`scripts/logo.mjs`)은 화면에서 쓰지 않는다.

## 계속 지켜야 할 브랜드 규칙

- Signal Orange `#E4572E`는 전화 상담 CTA 전용. 다른 곳에 쓰지 않는다.
- Hay Gold 위 글자는 반드시 Soil Black. 흰 글자 금지. 흰 바탕 위 금색 글자는 `--accent`(#8a5d00)를 쓴다.
- 본문 18px 이상(모바일 17px), 버튼 높이 56px 이상, 터치 타깃 48px 이상. 주 사용자가 고령 농가다.
- 전화번호 054-843-4000은 항상 `tel:` 링크 버튼으로.
- 페이지당 시그니처 모션은 히어로 하나. `prefers-reduced-motion`이면 히어로는 불 켜진 한 장면으로 고정.

## 자료 저장 위치

- 문서·기획·참고 자료: `docs/`
- 디자인 자료: `docs/design/`
- 대용량 영상·원본 사진: 저장소에 넣지 않는다. Google Drive 링크로 관리.
- API 키 등 비밀 값: 저장소에 넣지 않는다. 환경 변수로 관리.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
