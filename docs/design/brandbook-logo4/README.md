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

## 적용 예시 (2026-10-30 추가)

실제 자리에 놓아 본 적용 예시 13쪽(A4 가로). 장면은 모두 벡터 일러스트이고, 사진은 부스·달력·디지털 장면에만 썼다.

- `makkina-applications-logo4-screen.pdf` (화면용), `makkina-applications-logo4-print-CMYK.pdf` (인쇄용)
- `apps-preview-1~4.jpg`: 미리보기
- 쪽: 표지, 사옥 간판, 지주 간판·안내판, 1톤 탑차, 탑차 뒷면·승합차, 명함, 레터헤드·봉투, 작업복·모자, 기계 명판·데칼, 박람회 부스, 판촉물(수건·달력·머그·볼펜·스티커), 디지털(유튜브 채널 아트·SNS 프로필·메일 서명·모바일), 뒤표지
- 크기·재질은 제안값이다. 시공사·인쇄소와 확인한 뒤 확정한다.
- 명판의 제조번호·마력·작업 폭·무게 칸은 비워 두었다(받지 않은 사양은 넣지 않는다).
- 다시 만들 때: `node apps.mjs <logo-paths.ts> <Pretendard 폴더> <이미지 폴더> <출력 html>`. 이미지 폴더에는 `flyer-cover-clear.jpg`, `site-314-yard.jpg`, `dragon-render.jpg`, `booth-machine.png`(표지 합성 사진을 배경 없이 잘라 낸 것)가 있어야 한다.

## 합본 (브랜드북 + 실사 적용 예시, 21쪽)

- `makkina-brandbook-logo4-full-screen.pdf`: 화면용
- `makkina-brandbook-logo4-full-print-CMYK.pdf`: 인쇄용
- 쪽 구성: 브랜드북 1–11쪽 → "10 실사 적용 예" 9쪽 → 뒤표지. 차례에 "10 실사 적용 예"를 더했다.

## 실사 적용 예시 (2026-10-30 추가)

`makkina-photo-mockups-logo4.pdf`: 표지와 실사 8장이 든 9쪽 책자. 낱장 사진은 `photo/*.jpg` (사옥 간판, 지주 간판, 1톤 탑차, 명함, 레터헤드·봉투, 작업복·모자, 박람회 부스, 판촉물)이다.

- 만든 방법:
  1. 장면 사진은 Canva AI로 만들었다(사용자 Canva 계정 업로드 폴더에 원본이 있다).
  2. AI가 대충 그린 로고는 지웠다(inpaint).
  3. 실제 로고 도형(`logo-paths.ts` → `scripts/logos.mjs` 로 만든 PNG)을 원근에 맞춰 다시 합성했다(`scripts/comp.py`, 장면별 `scripts/*.py`).
- 간판은 입체 채널 글자처럼 두께와 그림자를, 자수는 땀 결을 넣었다.
- 시안용 이미지다. 실제 시공·인쇄 결과와 다를 수 있다.

## 주의

- 현재 홈페이지와 인쇄물에는 2026-10-28 교정에 따라 회사 기존 로고(삼색 심볼 + 붓글씨 성원마끼나)를 쓴다. 이 책은 시안 4를 채택할 경우의 사용 기준이다.
- 도형은 `src/components/logo-paths.ts`(`scripts/logo.mjs`)와 같은 윤곽이다.
- 지마켓 산스 Bold 파일이 없어서 서체 견본만 Medium으로 넣었다. 규칙은 Bold다.
- 8·11쪽의 빨간 판(`#C8202A`)은 기계 명판 예시일 뿐이다. 브랜드 색이 아니다.
- 다시 만들 때 쓰는 명령:
  `node brandbook.mjs <logo-paths.ts> <Pretendard 폴더> cmyk.json <출력 html>` → Playwright PDF → Ghostscript CMYK(`-dNoOutputFonts`).
