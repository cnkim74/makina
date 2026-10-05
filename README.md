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
