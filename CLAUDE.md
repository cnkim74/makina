# CLAUDE.md

이 저장소는 성원마끼나(MAKKINA) 브랜드 웹사이트 프로젝트입니다. 대화는 한국어로 합니다.

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
