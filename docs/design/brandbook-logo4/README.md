# 로고 시안 4 「발톱」 브랜드북 (2026-10-30)

2026-10-24 2차 로고 시안의 D안 「발톱」(비스듬한 칼날 세 개 + 모서리를 깎은 10° 기울임 MAKKINA)만 따로 정리한 브랜드북이다.
A4 가로 12쪽.

- `makkina-brandbook-logo4-screen.pdf`: 화면용(RGB)
- `makkina-brandbook-logo4-print-CMYK.pdf`: 인쇄용(CMYK, 글자 아웃라인). 도련 없이 A4로 출력한다.
- `preview-1~3.jpg`: 미리보기(1–4쪽, 5–8쪽, 9–12쪽)

## 구성

1. 표지
2. 브랜드 한 줄 · 차례
3. 01 로고 이야기
4. 02 로고 구성: A 가로, B 국문 병기, C 세로, D 단독
5. 03 구조와 비율: 칼날 15·25·90/72, 가로 조합 1.6H·0.44H
6. 04 여백과 최소 크기
7. 05 색: HEX·RGB·CMYK
8. 06 색 버전 6가지
9. 07 잘못된 사용 8가지
10. 08 서체
11. 09 적용 예: 기계 명판, 명함, 홈페이지 메뉴, 앱 아이콘
12. 뒤표지

## 주의

- 현재 홈페이지와 인쇄물에는 2026-10-28 교정에 따라 회사 기존 로고(삼색 심볼 + 붓글씨 성원마끼나)를 쓴다. 이 책은 시안 4를 채택할 경우의 사용 기준이다.
- 도형은 `src/components/logo-paths.ts`(`scripts/logo.mjs`)와 같은 윤곽이다.
- 지마켓 산스 Bold 파일이 없어서 서체 견본만 Medium으로 넣었다. 규칙은 Bold다.
- 8·11쪽의 빨간 판(`#C8202A`)은 기계 명판 예시일 뿐이다. 브랜드 색이 아니다.
- 다시 만들 때 쓰는 명령:
  `node brandbook.mjs <logo-paths.ts> <Pretendard 폴더> cmyk.json <출력 html>` → Playwright PDF → Ghostscript CMYK(`-dNoOutputFonts`).
