/** 메인 화면 콘텐츠. 제품·영상·소모품이 늘어나면 이 파일만 고친다. */

/**
 * 히어로 영상. 스크롤에 맞춰 장면이 움직인다(데스크톱).
 * 원본 4K 영상은 저장소가 아니라 GitHub 릴리스 `hero-video` 에 있다. 다시 만드는 법은 README "히어로 영상".
 * null 이면 SVG 자리표시 장면(heroImages / HeroScene)을 쓴다.
 */
export type HeroSource = { mp4: string; webm: string };
export type HeroVideo = {
  /** 데스크톱: 스크롤로 되감고 넘길 수 있게 키프레임을 촘촘히 넣은 판 */
  desktop: HeroSource;
  /** 터치 기기: 가볍게 줄여 자동 반복 재생 */
  mobile: HeroSource;
  /** 영상이 뜨기 전 첫 장면 */
  poster: string;
  /** 움직임 줄이기 설정일 때 보여 줄 한 장면 */
  still: string;
  /** 영상이 끝나는 스크롤 지점(0~1). 그 뒤는 흰 바탕으로 녹아드는 구간 */
  end: number;
};

export const heroVideo: HeroVideo | null = {
  desktop: { mp4: "/videos/hero-1600.mp4", webm: "/videos/hero-1600.webm" },
  mobile: { mp4: "/videos/hero-960.mp4", webm: "/videos/hero-960.webm" },
  poster: "/images/hero/hero-poster.webp",
  still: "/images/hero/hero-still.webp",
  end: 0.9,
};

/**
 * 히어로 캡션. 영상의 카메라가 베일 한 덩이에서 물러나 들판 전체를 내려다볼 때까지.
 * from/to 는 히어로 구간 스크롤 진행률(0~1)에서 이 캡션이 보이는 범위.
 */
export const heroStory = [
  { word: "BALE", ko: "한 덩이, 단단하게", from: 0.05, to: 0.22 },
  { word: "MACHINE", ko: "이름처럼 일하는 기계", from: 0.22, to: 0.42 },
  { word: "FIELD", ko: "남김없이 베고, 고르게 모으고", from: 0.42, to: 0.64 },
  { word: "HARVEST", ko: "줄지어 선 오늘의 수확", from: 0.64, to: 0.9 },
];

/** 영상이 없을 때 SVG 자리표시 장면용 캡션 */
export const heroSketchStory = [
  { word: "DAWN", ko: "새벽 다섯 시, 서후면", from: 0.08, to: 0.26 },
  { word: "LIGHT", ko: "작업등이 켜지면", from: 0.26, to: 0.44 },
  { word: "LINE", ko: "이름처럼 일하는 기계", from: 0.44, to: 0.66 },
  { word: "BALE", ko: "한 덩이, 단단하게", from: 0.66, to: 0.96 },
];

/**
 * 히어로 실제 사진. 비어 있으면 SVG 자리표시 장면을 그린다.
 * 겹마다 새벽(불 꺼짐)·작업등(불 켜짐) 두 장. 가운데·앞 겹은 투명 배경 webp.
 * 예) bg: { dawn: "/images/hero/bg-dawn.webp", lit: "/images/hero/bg-lit.webp" }
 * 촬영·생성 가이드는 README "히어로 이미지" 참고.
 */
export type HeroLayerImage = { dawn: string; lit: string };
export const heroImages: Partial<Record<"bg" | "mid" | "fg", HeroLayerImage>> = {};

/** 히어로 아래 "바로 가기" 문. inquiry 가 있으면 문의 양식을 그 종류로 열어 관리자 "문의"로 받는다 */
export const quickDoors: { kicker: string; title: string; copy: string; link: string; href: string; inquiry?: string }[] = [
  {
    kicker: "BUY",
    title: "작업기 구매 상담",
    copy: "트랙터 마력과 작업 면적만 알려 주시면 맞는 드래곤 모델과 지원사업을 안내해 드립니다.",
    link: "구매 상담 남기기",
    href: "#inquiry",
    inquiry: "구매 상담",
  },
  {
    kicker: "ORDER",
    title: "소모품 빠른 주문",
    copy: "네트·랩 필름은 평일 오후 3시 이전 주문하시면 다음 날 받으실 수 있습니다.",
    link: "소모품 주문하기",
    href: "#consumables",
  },
  {
    kicker: "CARE",
    title: "A/S · 출장 정비",
    copy: "수확철 고장은 하루가 급합니다. 접수하시면 가까운 정비 기사가 바로 연락드립니다.",
    link: "정비 접수하기",
    href: "#inquiry",
    inquiry: "A/S · 정비",
  },
];

/**
 * 주력 제품 DRAGON — 하이브리드 모우어 컨디셔너 (트랙터 3점 부착, 베면서 줄기를 파쇄한다).
 * 글과 사양은 회사 "DRAGON 제품소개서"(2026.8) 그대로. 고칠 때도 소개서를 기준으로 한다.
 * 사진: 구글 드라이브 "성원마끼나 소스" + 소개서에서 잘라 낸 도면·작업 광경 → public/images/dragon/
 */
export const dragon = {
  name: "DRAGON",
  label: "하이브리드 모우어 컨디셔너",
  range: "50마력부터 150마력까지 선택적으로 사용",
  catch: "베면서 부순다.",
  copy: "아래에서 치고 올라오는 칼날이 작물을 베면서 파쇄합니다. 빨리 마르고, 소가 남기지 않고 먹습니다.",
  heroImage: "/images/dragon/field-cut.webp",
  heroAlt: "트랙터에 단 드래곤이 키 큰 수수밭을 베는 모습",
  render: "/images/dragon/dr280.webp",
  renderAlt: "DRAGON 280 하이브리드 모우어 컨디셔너",
  /** 밭에서 축사까지 — 소개서 "사용 효과"·"급여효과" */
  story: [
    {
      step: "벤다",
      title: "쓰러진 작물도 막힘없이.",
      copy: "아래에서 치고 올라오는 칼날이 작물을 파쇄하며 내보내, 축에 감기거나 막히지 않습니다. 쓰러진 작물 예취에 가장 알맞습니다.",
      image: "/images/dragon/work-sudan-2.webp",
      alt: "DRAGON210 으로 수단그라스를 베는 모습",
    },
    {
      step: "마른다",
      title: "빨리 마르니 일이 줄어듭니다.",
      copy: "파쇄된 작물은 다른 컨디셔너보다 빨리 말라 작업 시간이 줄어듭니다. 엔진 1,500~1,800rpm, 중속 주행으로 빠르게 작업합니다.",
      image: "/images/dragon/forage-close.webp",
      alt: "잘게 파쇄되어 마른 조사료",
    },
    {
      step: "먹인다",
      title: "소가 남기지 않습니다.",
      copy: "굵은 줄기도 파쇄되어 기호성이 좋아지고, 남기는 것이 없어 축사 청소가 수월합니다. 냄새가 적어 맨손 급여도 할 만큼 질이 좋아집니다.",
      image: "/images/dragon/barn-feed.webp",
      alt: "축사에서 한우들이 드래곤으로 만든 조사료를 먹는 모습",
    },
  ],
  /** 소개서 "제품특징" — 도면은 소개서에서 잘라 냈다 */
  features: [
    { name: "고정밀 밸런싱 축", copy: "H.M.C 바란싱 축의 고정밀 밸런싱으로 진동 없이 안정적으로 작업합니다.", image: "/images/dragon/feat-balance.webp" },
    { name: "더블 조인트 구동", copy: "더블 조인트 구동형으로 PTO 동력을 100% 전달합니다.", image: "/images/dragon/feat-doublejoint.webp" },
    { name: "강력한 텐션 조절 장치", copy: "벨트가 미끄러지지 않는 작업을 보장합니다.", image: "/images/dragon/feat-tension.webp" },
    { name: "회전 타이어", copy: "바퀴가 돌아가 선회 작업이 원활합니다.", image: "/images/dragon/feat-wheel.webp" },
    { name: "상하 롤링 링크", copy: "울퉁불퉁한 지형에도 대비합니다.", image: "/images/dragon/feat-rolling.webp" },
    { name: "펜듈럼(좌우 진자) 기능", copy: "좌우로 기울어 지면을 따라갑니다.", image: "/images/dragon/feat-pendulum.webp" },
  ],
  /** 소개서 "사용 효과"에서 위 이야기에 없는 것 */
  more: [
    "기존 제품보다 한 단계 높은 부품을 써서 수명과 내구성이 다릅니다.",
    "조사료 작업뿐 아니라 주변 환경 정화 작업에도 씁니다.",
    "질 좋은 사료는 축사 환경 개선과 바닥 상태 유지에 도움이 됩니다.",
  ],
  /** 소개서 "개발배경"·"국내시장의 문제점" (수입사·모델명은 홈페이지에 싣지 않는다) */
  why: {
    title: "수입 예취기가 못 하던 일.",
    copy: [
      "국내 예취기 시장은 수입 기계가 장악하고 있습니다. 하지만 우리 농지의 특성을 충분히 반영하지 못해, 쓰러진 작물은 수확조차 어렵고 좁은 땅에서 크게 키운 작물은 작업이 힘들거나 못 하는 경우가 많습니다.",
      "드래곤은 예취와 건초 생산이라는 예취기 본연의 기능에 집중해 만들었습니다. 국내 환경의 특수성을 고려해, 예취 작업만큼은 수입 기계를 압도합니다.",
    ],
  },
  /** 소개서 "작업광경" */
  gallery: [
    { image: "/images/dragon/work-triticale-1.webp", caption: "DRAGON210 · 트리티케일" },
    { image: "/images/dragon/work-sudan-1.webp", caption: "DRAGON210 · 수단그라스" },
    { image: "/images/dragon/work-sorghum-1.webp", caption: "DRAGON280 · 극동6호" },
    { image: "/images/dragon/work-sorghum-2.webp", caption: "DRAGON280 · 극동6호" },
  ],
};

export type ProductCategory = "mower";

/** 소개서 "제품규격" */
export type ProductSpecs = {
  pto: string;
  hp: string;
  blades: string;
  weight: string;
  width: string;
};

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  categoryLabel: string;
  /** 카페24 동동으로 표시되는 한 줄 캐치카피 */
  catch: string;
  copy: string;
  specs?: ProductSpecs;
  /** 농업기계목록집 가격 */
  price?: string;
  isNew?: boolean;
  /** public/images 의 사진 경로. 없으면 자리표시 */
  image?: string;
};

/** 가격 출처 — 소개서의 농업기계목록집 기준 */
export const priceNote = "가격은 농업기계목록집 2025년 7월 기준입니다. DRAGON210·230·280은 융자지원 한도 1,200만원.";

/** 드래곤 라인업 — 소개서 "제품규격" */
export const products: Product[] = [
  {
    id: "dr210",
    name: "DRAGON 210",
    category: "mower",
    categoryLabel: "하이브리드 모우어 컨디셔너",
    catch: "50마력부터.",
    copy: "드래곤 가운데 가장 가볍습니다. 트리티케일·수단그라스 작업에 씁니다.",
    specs: { pto: "540", hp: "50마력 이상", blades: "50개", weight: "650kg", width: "197cm" },
    price: "2,250만원",
    image: "/images/dragon/dr210.webp",
  },
  {
    id: "dr230",
    name: "DRAGON 230",
    category: "mower",
    categoryLabel: "하이브리드 모우어 컨디셔너",
    catch: "더 넓게 한 번에.",
    copy: "작업 폭 222cm, 칼날 52개로 베면서 파쇄합니다.",
    specs: { pto: "540", hp: "80마력 이상", blades: "52개", weight: "730kg", width: "222cm" },
    price: "2,500만원",
    image: "/images/dragon/dr230.webp",
  },
  {
    id: "dr250",
    name: "DRAGON 250",
    category: "mower",
    categoryLabel: "하이브리드 모우어 컨디셔너",
    catch: "같은 마력, 더 넓게.",
    copy: "80마력 트랙터로 작업 폭 247cm를 씁니다.",
    specs: { pto: "540", hp: "80마력 이상", blades: "56개", weight: "950kg", width: "247cm" },
    price: "2,900만원",
  },
  {
    id: "dr280",
    name: "DRAGON 280",
    category: "mower",
    categoryLabel: "하이브리드 모우어 컨디셔너",
    catch: "드래곤의 맏형.",
    copy: "PTO 540·1000 겸용. 키 큰 수수(극동6호)도 거뜬히 벱니다.",
    specs: { pto: "540 / 1000", hp: "100마력 이상", blades: "60개", weight: "950kg", width: "272cm" },
    price: "3,380만원",
    image: "/images/dragon/dr280.webp",
  },
];

/** 드래곤 말고도 만드는 작업기 — 간단히만 소개한다 */
export const otherMachines = [
  { name: "비무꼬", label: "일체형 원형베일러", copy: "베고, 부수고, 묶는 일을 한 대가 끝냅니다." },
  { name: "블랙홀", label: "드럼모우어", copy: "들어간 풀은 돌아 나오지 않습니다." },
  { name: "모조리", label: "제초 파쇄기", copy: "리모컨 하나로 풀을 모조리 정리합니다." },
];

/** 조사료 작업 흐름. 1단계(베기)가 드래곤의 일이다 */
export const workflow = [
  {
    step: 1,
    title: "베기",
    desc: "베면서 부숩니다",
    detail: "드래곤의 로터가 풀을 베는 동시에 줄기를 두드려 부숩니다. 부순 풀은 빨리 마르고 소가 먹기 좋아집니다.",
    machine: "DRAGON 하이브리드 모어 컨디셔너",
    href: "#dragon",
    tone: "#56603d",
    image: "/images/dragon/field-cut.webp",
  },
  {
    step: 2,
    title: "모으기",
    desc: "고르게 모읍니다",
    detail: "벤 풀을 뒤집어 말리고, 베일러가 먹기 좋은 한 줄로 모읍니다.",
    machine: "레이크 · 집초기",
    href: "#support",
    tone: "#6b6a43",
    image: "/images/dragon/field-rows.webp",
  },
  {
    step: 3,
    title: "묶기",
    desc: "단단히 묶습니다",
    detail: "모은 풀을 둥글게 감아 네트로 단단히 묶습니다.",
    machine: "비무꼬 일체형 원형베일러",
    href: "#support",
    tone: "#7c6a3c",
  },
  {
    step: 4,
    title: "감싸기",
    desc: "오래 지킵니다",
    detail: "랩 필름으로 빈틈없이 감싸 공기를 막습니다. 겨울까지 사료가 상하지 않습니다.",
    machine: "베일 래퍼",
    href: "#support",
    tone: "#5f6670",
    image: "/images/dragon/bale-open.webp",
  },
  {
    step: 5,
    title: "소모품",
    desc: "멈추지 않게",
    detail: "네트와 랩이 떨어지면 작업이 멈춥니다. 평일 오후 3시 전 주문은 다음 날 도착합니다.",
    machine: "네트 · 랩 필름",
    href: "#consumables",
    tone: "#8a7d5a",
  },
] as { step: number; title: string; desc: string; detail: string; machine: string; href: string; tone: string; image?: string }[];

export type HpRange = {
  id: string;
  label: string;
  shortLabel: string;
  machines: string[];
};

/** 마력대별 드래곤 모델 — 소개서 적용마력(210: 50HP↑, 230·250: 80HP↑, 280: 100HP↑) */
export const hpRanges: HpRange[] = [
  { id: "lt50", label: "50마력 미만", shortLabel: "50 미만", machines: [] },
  { id: "50-79", label: "50 ~ 79마력", shortLabel: "50~79", machines: ["DRAGON 210"] },
  { id: "80-99", label: "80 ~ 99마력", shortLabel: "80~99", machines: ["DRAGON 230", "DRAGON 250", "DRAGON 210"] },
  {
    id: "100-150",
    label: "100 ~ 150마력",
    shortLabel: "100~150",
    machines: ["DRAGON 280", "DRAGON 250", "DRAGON 230", "DRAGON 210"],
  },
];

export type Video = {
  id: string;
  title: string;
  /** 썸네일 위 자막. {강조} 로 감싼 부분이 노란색으로 표시된다 */
  caption: string;
  kind: string;
  date: string;
  /** 유튜브 영상 ID가 정해지면 넣는다 */
  youtubeId?: string;
  /** 해시태그 검색용 (# 없이) */
  tags: string[];
  tone: string;
  /** 유튜브 조회수·좋아요 (기본 목록만. 정렬에 쓴다) */
  views?: number;
  likes?: number;
};

/**
 * 성원마끼나 유튜브 채널(@성원마끼나)의 영상. 관리자 "유튜브 영상"에 하나도 올리지 않았을 때 이 목록이 보인다.
 * 조회수·좋아요는 2026-10 기준 (정렬용).
 */
export const videos: Video[] = [
  {
    id: "yt-Bh-fo8DqfgU",
    youtubeId: "Bh-fo8DqfgU",
    title: "DRAGON250 트리티케일 작업",
    caption: "DRAGON250\n{트리티케일} 작업",
    kind: "작업 영상",
    date: "2026.06.29",
    tags: ["드래곤", "DRAGON250", "트리티케일"],
    tone: "#5f6a44",
    views: 847,
    likes: 7,
  },
  {
    id: "yt-FviWKN1D26k",
    youtubeId: "FviWKN1D26k",
    title: "DRAGON250 호밀 작업",
    caption: "DRAGON250\n{호밀} 작업",
    kind: "작업 영상",
    date: "2026.06.29",
    tags: ["드래곤", "DRAGON250", "호밀"],
    tone: "#7c7a52",
    views: 320,
    likes: 5,
  },
  {
    id: "yt-C3klTtGAGeU",
    youtubeId: "C3klTtGAGeU",
    title: "2025 익산 농업기계박람회 성원마끼나 참가",
    caption: "2025 익산\n{농업기계박람회}",
    kind: "행사",
    date: "2025.11.20",
    tags: ["박람회", "드래곤"],
    tone: "#8a7d5a",
    views: 495,
    likes: 7,
  },
  {
    id: "yt--dHz-A_fibw",
    youtubeId: "-dHz-A_fibw",
    title: "DRAGON230 수단그라스 작업 — 경북 청송군",
    caption: "경북 청송\n{수단그라스} 작업",
    kind: "작업 영상",
    date: "2025.11.06",
    tags: ["드래곤", "DRAGON230", "수단그라스"],
    tone: "#56603d",
    views: 1325,
    likes: 11,
  },
  {
    id: "yt-HkzLuvpXZhU",
    youtubeId: "HkzLuvpXZhU",
    title: "DRAGON280 수단그라스 작업 — 전북 무주군",
    caption: "전북 무주\n{수단그라스} 작업",
    kind: "작업 영상",
    date: "2025.11.06",
    tags: ["드래곤", "DRAGON280", "수단그라스"],
    tone: "#6b6a43",
    views: 501,
    likes: 8,
  },
  {
    id: "yt-Go3jIHCsjI8",
    youtubeId: "Go3jIHCsjI8",
    title: "DRAGON280 수단그라스 작업 — 경남 거창군",
    caption: "경남 거창\n{수단그라스} 작업",
    kind: "작업 영상",
    date: "2025.11.05",
    tags: ["드래곤", "DRAGON280", "수단그라스"],
    tone: "#7c6a3c",
    views: 871,
    likes: 7,
  },
  {
    id: "yt-LUsEx4Elmak",
    youtubeId: "LUsEx4Elmak",
    title: "드래곤 시리즈를 소개합니다",
    caption: "드래곤 시리즈를\n{소개합니다}",
    kind: "제품 소개",
    date: "2024.11.22",
    tags: ["드래곤", "제품소개"],
    tone: "#5f6a44",
    views: 2480,
    likes: 12,
  },
  {
    id: "yt-LxNTo-xzrNY",
    youtubeId: "LxNTo-xzrNY",
    title: "DRAGON280 작업 — 극동6호·수단그라스",
    caption: "DRAGON280\n{극동6호} 수수",
    kind: "작업 영상",
    date: "2024.11.22",
    tags: ["드래곤", "DRAGON280", "극동6호", "수단그라스"],
    tone: "#7c7a52",
    views: 2887,
    likes: 15,
  },
  {
    id: "yt-It7pOWT6deM",
    youtubeId: "It7pOWT6deM",
    title: "DRAGON230 수단그라스 작업",
    caption: "DRAGON230\n{수단그라스} 작업",
    kind: "작업 영상",
    date: "2024.11.22",
    tags: ["드래곤", "DRAGON230", "수단그라스"],
    tone: "#8a7d5a",
    views: 2770,
    likes: 13,
  },
  {
    id: "yt-nUTNbcnJcMw",
    youtubeId: "nUTNbcnJcMw",
    title: "DRAGON210 봄 호밀 작업",
    caption: "DRAGON210\n봄 {호밀} 작업",
    kind: "작업 영상",
    date: "2024.05.23",
    tags: ["드래곤", "DRAGON210", "호밀"],
    tone: "#56603d",
    views: 1229,
    likes: 6,
  },
  {
    id: "yt-UFO6WtSauio",
    youtubeId: "UFO6WtSauio",
    title: "블랙홀 케나프 수확 장비 소개",
    caption: "블랙홀\n{케나프} 수확",
    kind: "제품 소개",
    date: "2023.08.18",
    tags: ["블랙홀", "케나프"],
    tone: "#6b6a43",
    views: 1799,
    likes: 8,
  },
  {
    id: "yt-7SqlZrUyfmY",
    youtubeId: "7SqlZrUyfmY",
    title: "비무꼬 — 베면서 바로 묶는 일체형 베일러",
    caption: "비무꼬\n{베면서} 묶기",
    kind: "제품 소개",
    date: "2019.06.14",
    tags: ["비무꼬", "베일러"],
    tone: "#7c6a3c",
    views: 16553,
    likes: 65,
  },
];

export const videoTags = ["#드래곤", "#수단그라스", "#호밀", "#트리티케일", "#극동6호", "#비무꼬"];
export const videoSorts = [
  { label: "최신순", short: "최신순" },
  { label: "조회수 높은 순", short: "조회수순" },
  { label: "좋아요 많은 순", short: "좋아요순" },
];

export type Consumable = {
  id: "net" | "wrap";
  name: string;
  spec: string;
  specShort: string;
  defaultQty: number;
};

export const consumables: Consumable[] = [
  {
    id: "net",
    name: "베일 네트",
    spec: "폭 1.23m · 길이 3,000m · 1롤",
    specShort: "1.23m × 3,000m · 1롤",
    defaultQty: 2,
  },
  {
    id: "wrap",
    name: "베일 랩 필름",
    spec: "폭 750mm · 길이 1,500m · 1롤",
    specShort: "750mm × 1,500m · 1롤",
    defaultQty: 10,
  },
];

export const supportItems = [
  { title: "작업기를\n구매하고 싶어요", sub: "구매 상담 · 견적 · 지원사업 안내", short: "작업기를 구매하고 싶어요" },
  { title: "사용법과 점검\n방법을 알고 싶어요", sub: "사용 설명서 · 점검 영상", short: "사용법·점검 방법을 알고 싶어요" },
  { title: "작업기에\n이상이 있어요", sub: "A/S 접수 · 출장 정비", short: "작업기에 이상이 있어요" },
  { title: "네트·랩을\n주문하고 싶어요", sub: "소모품 주문 · 배송 조회", short: "네트·랩을 주문하고 싶어요" },
  { title: "공장에\n직접 가보고 싶어요", sub: "오시는 길 · 시연 예약", short: "공장에 직접 가보고 싶어요" },
];
