# 웹폰트 파일 넣는 곳

여기에 아래 파일을 넣으면 CDN 대신 직접 서빙합니다(더 빠르고 안정적).
파일이 없으면 자동으로 CDN에서 받고, 그것도 안 되면 Noto Sans KR / 시스템 서체로 대체됩니다.

| 파일명 | 서체 | 배포처 |
| --- | --- | --- |
| `GmarketSansBold.woff2` (또는 `.woff`) | 지마켓 산스 Bold | 지마켓 공식 배포 (무료, 상업 사용 가능) |
| `Cafe24Dongdong.woff2` (또는 `.woff`) | 카페24 동동 | 카페24 폰트 (무료, 상업 사용 가능) |
| `PretendardVariable.woff2` | 프리텐다드 가변 | https://github.com/orioncactus/pretendard (OFL) |
| `HSBombaram-sub.woff2` (저장소에 있음) | HS봄바람체 2.1 부분 글꼴 — 영문·숫자와 "베면서 부순다" 등 쓰는 글자만 | 산돌구름 무료 글꼴 (상업 사용 가능, 글꼴 파일 판매만 금지) |

참조 위치: `src/styles/fonts.css`
