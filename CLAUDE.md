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

## 작업 전에 읽을 것

- `docs/design/brand-guide.md`: 브랜드북. 컬러·타이포·레이아웃·모션·접근성 규칙의 원본.
- `docs/design/tokens.json`: 색상·서체·간격·모서리 토큰. 하드코딩하지 말고 이 값을 쓴다.
- `docs/design/components/HomePage/README.md`, `HomePageMobile/README.md`: 메인 화면 구성과 교체할 자리표시 목록.

## 지켜야 할 디자인 규칙 (brand-guide.md 요약)

- Signal Orange `#E4572E`는 전화 상담 CTA 전용. 다른 곳에 쓰지 않는다.
- Hay Gold 위 글자는 반드시 Soil Black. 흰 글자 금지.
- 카페24 동동은 슬로건·캐치카피·배지에만. 본문·버튼·숫자에는 쓰지 않는다.
- 본문 18px 이상, 버튼 높이 56px 이상, 터치 타깃 48px 이상. 주 사용자가 고령 농가다.
- 전화번호 054-843-4000은 항상 `tel:` 링크 버튼으로.
- 섹션 번호, 눈썹 라벨, 거대한 영문 숫자, 추상 도형 같은 장식은 피한다. 사진이 주인공이다.
- 페이지당 시그니처 모션은 1개. `prefers-reduced-motion`이 켜져 있으면 정적 전환.

## 자료 저장 위치

- 문서·기획·참고 자료: `docs/`
- 디자인 자료: `docs/design/`
- 대용량 영상·원본 사진: 저장소에 넣지 않는다. Google Drive 링크로 관리.
- API 키 등 비밀 값: 저장소에 넣지 않는다. 환경 변수로 관리.
