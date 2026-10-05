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

## 저장소 구조

```
docs/design/          디자인 시스템 원본 (브랜드북, 토큰, 시안 HTML, 폰트 컨셉)
src/app/              Next.js 라우트. layout.tsx(메타데이터), page.tsx(메인), globals.css
src/styles/tokens.css 디자인 토큰 → CSS 변수 (docs/design/tokens.json 과 동기화)
src/styles/fonts.css  웹폰트 @font-face (self-host → CDN → 시스템 폴백)
src/data/site.ts      전화번호·주소·메뉴 등 사이트 공통 정보
src/data/content.ts   제품·작업 흐름·마력표·영상·소모품·고객지원 콘텐츠
src/components/       메인 화면 섹션 컴포넌트 (각각 .tsx + .module.css)
src/components/placeholders/  사진·누끼·지도 자리표시 SVG. 실제 자료가 오면 교체
public/fonts/         웹폰트 파일 넣는 곳 (README 참고)
public/images/        제품 누끼·현장 사진 넣는 곳
```

## 메인 화면 구성

| 섹션 | 컴포넌트 | 비고 |
| --- | --- | --- |
| 유틸 바 + GNB | `Header` | 모바일은 햄버거 메뉴 |
| 히어로 | `Hero` | 현장 영상 자리표시, 슬로건, 슬라이드 번호 |
| 플로팅 버튼 4개 | `FloatingButtons` | 데스크톱 전용 |
| 조사료 작업 흐름 | `WorkFlow` | 단계 클릭 시 활성 전환 |
| 대표 작업기 | `Products` | 알약 탭으로 분류 필터 |
| 내 트랙터 마력으로 찾기 | `HpFinder` | 마력 선택 → 연결 가능 작업기 |
| 작업 영상 | `Videos` | 검색·해시태그·정렬 |
| 소모품 빠른 주문 | `Consumables` | 수량 스테퍼, 전화 주문 |
| 고객지원 | `Support` | 아코디언 5개 |
| 오시는 길 | `Directions` | 지도 자리표시 |
| 푸터 | `Footer` | |
| 하단 고정 버튼 3개 | `MobileDock` | 모바일 전용 |

## 교체가 필요한 자리표시

- 히어로 현장 영상, 사진 띠 2곳(마력 찾기, 고객지원), 영상 썸네일
- 제품 누끼 사진 → `public/images/` 에 넣고 `src/data/content.ts` 의 `image` 필드에 경로 지정
- 지도 → 카카오맵 임베드
- 웹폰트 파일 → `public/fonts/` (없으면 CDN 사용)
- 상세 주소, 대표자, 사업자등록번호, 팩스, 카카오톡 채널 링크, 유튜브 링크 → `src/data/site.ts`
