/** 메인 화면 콘텐츠. 제품·영상·소모품이 늘어나면 이 파일만 고친다. */

/**
 * 히어로 영상. 스크롤에 맞춰 장면이 움직인다(데스크톱).
 * 원본 4K 영상은 저장소가 아니라 GitHub 릴리스 `hero-video` 에 있다. 다시 만드는 법은 README "히어로 영상".
 * (2026-10-28 에 DRAGON 사진 장면으로 바꿨다가, 2026-10-30 요청으로 원래 영상으로 되돌렸다)
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
    copy: "트랙터 마력과 작업 면적만 알려 주시면 맞는 DRAGON 모델과 지원사업을 안내해 드립니다.",
    link: "구매 상담 남기기",
    href: "#inquiry",
    inquiry: "구매 상담",
  },
  {
    kicker: "ORDER",
    title: "소모품 빠른 주문",
    copy: "칼날·전용벨트는 평일 오후 3시 이전 주문하시면 다음 날 받으실 수 있습니다.",
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
 * 글과 사양은 회사 "DRAGON 제품소개서"(2026.8) 기준. 2026-10-28 고객 교정(60마력, 1,500~2,000rpm, 가격 삭제, DRAGON314 추가, 문구)을 반영했다.
 * 사진: 구글 드라이브 "성원마끼나 소스" + 소개서에서 잘라 낸 도면·작업 광경 → public/images/dragon/
 */
export const dragon = {
  name: "DRAGON",
  label: "하이브리드 모우어 컨디셔너",
  /** 2026-10-28 교정: "K-모우어" 라는 말을 넣는다 */
  kmower: "우리 들판을 위한 K-모우어",
  range: "60마력부터 150마력까지 선택적으로 사용",
  catch: "베면서 부순다.",
  copy: "아래에서 치고 올라오는 칼날이 작물을 베면서 파쇄합니다. 빨리 마르고, 소가 남기지 않고 먹습니다.",
  heroImage: "/images/dragon/field-cut.webp",
  heroAlt: "트랙터에 단 DRAGON 이 키 큰 수수밭을 베는 모습",
  render: "/images/dragon/dr280.webp",
  renderAlt: "DRAGON 280 하이브리드 모우어 컨디셔너",
  /** 밭에서 축사까지 — 소개서 "사용 효과"·"급여효과" */
  story: [
    {
      step: "벤다",
      title: "쓰러진 작물도 막힘없이.",
      copy: "아래에서 치고 올라오는 칼날이 작물을 파쇄하며 내보내, 축에 감기거나 막히지 않습니다. 쓰러진 작물 예취에 가장 알맞습니다.",
      image: "/images/dragon/work-sudan-2.webp",
      alt: "DRAGON230 으로 수단그라스를 베는 모습",
    },
    {
      step: "마른다",
      title: "빨리 마르니 일이 줄어듭니다.",
      copy: "파쇄된 작물은 다른 컨디셔너보다 빨리 말라 작업 시간이 줄어듭니다. 엔진 1,500~2,000rpm, 중속 주행으로 빠르게 작업합니다.",
      image: "/images/dragon/forage-close.webp",
      alt: "잘게 파쇄되어 마른 조사료",
    },
    {
      step: "먹인다",
      title: "소가 남기지 않습니다.",
      copy: "굵은 줄기도 파쇄되어 기호성이 좋아지고, 남기는 것이 없어 축사 청소가 수월합니다. 냄새가 적어 맨손 급여도 할 만큼 질이 좋아집니다.",
      image: "/images/dragon/barn-feed.webp",
      alt: "축사에서 한우들이 DRAGON 으로 만든 조사료를 먹는 모습",
    },
  ],
  /** 소개서 "제품특징" — 도면은 소개서에서 잘라 냈다 */
  features: [
    { name: "고정밀 밸런싱 샤프트", copy: "H.M.C 밸런싱 샤프트를 고정밀로 맞춰 진동 없이 안정적으로 작업합니다.", image: "/images/dragon/feat-balance.webp" },
    { name: "더블 조인트 구동", copy: "더블 조인트 구동형으로 PTO 동력을 100% 전달합니다.", image: "/images/dragon/feat-doublejoint.webp" },
    { name: "강력한 텐션 조절 장치", copy: "벨트가 미끄러지지 않는 작업을 보장합니다.", image: "/images/dragon/feat-tension.webp" },
    { name: "회전 타이어", copy: "바퀴가 돌아가 선회 작업이 원활합니다.", image: "/images/dragon/feat-wheel.webp" },
    { name: "상하 롤링 링크", copy: "울퉁불퉁한 지형에도 대비합니다.", image: "/images/dragon/feat-rolling.webp" },
    { name: "펜듈럼(좌우 진자) 기능", copy: "좌우로 기울어 지면을 따라갑니다.", image: "/images/dragon/feat-pendulum.webp" },
  ],
  /** 소개서 "사용 효과"에서 위 이야기에 없는 것 */
  more: [
    "부품 하나부터 다릅니다. 한 단계 위의 프리미엄 부품으로 차원이 다른 내구성과 수명을 자랑합니다.",
    "조사료 작업뿐 아니라 주변 환경 정화 작업에도 씁니다.",
    "질 좋은 사료는 축사 환경 개선과 바닥 상태 유지에 도움이 됩니다.",
  ],
  /** 소개서 "개발배경"·"국내시장의 문제점" (수입사·모델명은 홈페이지에 싣지 않는다) */
  why: {
    title: "수입 예취기가 못 하던 일.",
    copy: [
      "국내 예취기 시장은 수입 기계가 장악하고 있습니다. 하지만 우리 농지의 특성을 충분히 반영하지 못해, 쓰러진 작물은 수확조차 어렵고 좁은 면적에서 크게 키운 작물은 작업이 힘들거나 아예 못 하는 경우가 많습니다.",
      "화려한 디자인과 편의 기능은 눈길을 끌지만, 정작 예취기의 핵심인 수확 작업에서 어려움을 겪는 농가가 많습니다.",
      "성원마끼나는 이 고충을 해결하기 위해 예취와 건초 생산이라는 본연의 기능에 집중해 DRAGON 시리즈를 개발했습니다. 독자적인 특허 기술(하이브리드 모우어 컨디셔너 메커니즘)을 적용하여 수입 기계가 놓친 국내 환경의 특수성을 극복했으며, 예취 성능과 작업 효율만큼은 수입 기계를 확실히 압도합니다.",
    ],
  },
  /** 소개서 "작업광경" */
  gallery: [
    { image: "/images/dragon/work-triticale-1.webp", caption: "DRAGON210 · 트리티케일" },
    { image: "/images/dragon/work-sudan-1.webp", caption: "DRAGON230 · 수단그라스" },
    { image: "/images/dragon/work-sorghum-1.webp", caption: "DRAGON280 · 극동6호" },
    { image: "/images/dragon/work-sorghum-2.webp", caption: "DRAGON280 · 극동6호" },
  ],
  /** 현장 사진 — 구글 드라이브 "261026" 폴더(2026-10-26). 모델이 확인되지 않은 사진은 작물만 적는다 */
  field: [
    { image: "/images/dragon/site-sudan-rows.webp", caption: "수단그라스", alt: "수단그라스를 베고 지나간 자리에 가지런히 놓인 줄" },
    { image: "/images/dragon/site-sudan-close.webp", caption: "수단그라스", alt: "키 큰 수단그라스를 베는 DRAGON 가까이" },
    { image: "/images/dragon/site-triticale.webp", caption: "트리티케일", alt: "트리티케일 밭에서 작업하는 DRAGON" },
    { image: "/images/dragon/site-rye.webp", caption: "라이그라스", alt: "라이그라스 밭에서 작업하는 DRAGON" },
    { image: "/images/dragon/site-sudan-blue.webp", caption: "수단그라스", alt: "쓰러진 수단그라스를 베는 DRAGON" },
    { image: "/images/dragon/site-sudan-red.webp", caption: "수단그라스", alt: "수단그라스 밭 가장자리를 베는 DRAGON" },
    { image: "/images/dragon/site-sudan-green.webp", caption: "수단그라스", alt: "산 아래 수단그라스 밭에서 작업하는 DRAGON" },
    { image: "/images/dragon/site-sudan-wide.webp", caption: "수단그라스", alt: "넓은 수단그라스 밭을 베어 나가는 트랙터" },
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
  /** 농업기계목록집 가격 — 2026-10-28 교정으로 홈페이지·인쇄물에는 싣지 않는다 */
  price?: string;
  /** 라인업 맨 끝에 한 줄 전체로 크게 보여 주는 플래그십 */
  flagship?: boolean;
  isNew?: boolean;
  /** public/images 의 사진 경로. 없으면 자리표시 */
  image?: string;
};

/** 가격은 싣지 않는다(2026-10-28 교정). 융자 안내만 남긴다 */
export const priceNote = "DRAGON210·230·280은 농기계 융자지원 한도 1,200만원.";

/** DRAGON 라인업 — 2026-10-28 수정사항 제원표 (단위: 작업 폭 cm, 무게 kg) */
export const products: Product[] = [
  {
    id: "dr210",
    name: "DRAGON 210",
    category: "mower",
    categoryLabel: "하이브리드 모우어 컨디셔너",
    catch: "농가를 위한 알짜배기 파트너.",
    copy: "DRAGON 가운데 가장 가볍습니다. 트리티케일·수단그라스 작업에 씁니다.",
    specs: { pto: "540", hp: "60마력 이상", blades: "44개", weight: "825kg", width: "209cm" },
    image: "/images/dragon/dr210.webp",
  },
  {
    id: "dr230",
    name: "DRAGON 230",
    category: "mower",
    categoryLabel: "하이브리드 모우어 컨디셔너",
    catch: "국민규격의 표준.",
    copy: "작업 폭 228cm, 칼날 48개로 베면서 파쇄합니다.",
    specs: { pto: "540", hp: "80마력 이상", blades: "48개", weight: "870kg", width: "228cm" },
    image: "/images/dragon/dr230.webp",
  },
  {
    id: "dr250",
    name: "DRAGON 250",
    category: "mower",
    categoryLabel: "하이브리드 모우어 컨디셔너",
    catch: "고성능 중형 작업의 대세.",
    copy: "작업 폭 247cm, PTO 540·1000 겸용. 100마력 트랙터에 맞습니다.",
    specs: { pto: "540 / 1000", hp: "100마력 이상", blades: "52개", weight: "955kg", width: "247cm" },
  },
  {
    id: "dr280",
    name: "DRAGON 280",
    category: "mower",
    categoryLabel: "하이브리드 모우어 컨디셔너",
    catch: "필드 위를 압도하는 강력함.",
    copy: "PTO 540·1000 겸용. 키 큰 수수(극동6호)도 거뜬히 벱니다.",
    specs: { pto: "540 / 1000", hp: "120마력 이상", blades: "58개", weight: "1,050kg", width: "276cm" },
    image: "/images/dragon/dr280.webp",
  },
  {
    id: "dr314",
    name: "DRAGON 314",
    category: "mower",
    categoryLabel: "하이브리드 모우어 컨디셔너",
    catch: "압도적 규모, 플래그십 대형 작업의 완성.",
    copy: "DRAGON 라인업의 플래그십 대형 모델입니다. 작업 폭 314cm, 칼날 66개로 넓은 들판을 한 번에 끝냅니다.",
    specs: { pto: "540 / 1000", hp: "120마력 이상", blades: "66개", weight: "1,250kg", width: "314cm" },
    flagship: true,
  },
];

/** DRAGON 말고도 만드는 작업기 — 간단히만 소개한다 */
export const otherMachines = [
  { name: "비무꼬", label: "일체형 원형베일러", copy: "베고, 부수고, 묶는 일을 한 대가 끝냅니다.", image: "/images/other/bimukko.webp" },
  { name: "블랙홀", label: "드럼모우어", copy: "들어간 풀은 돌아 나오지 않습니다.", image: "/images/other/blackhole.webp" },
  { name: "모조리", label: "제초 파쇄기", copy: "리모컨 하나로 풀을 모조리 정리합니다.", image: "/images/other/mojori.webp" },
];

/** 축사에서 차이가 납니다 — 소개서 "급여효과" (2026-10-28 교정으로 "작업 흐름" 자리를 대신한다) */
export const feeding = {
  title: "축사에서 차이가 납니다.",
  copy: "파쇄된 조사료는 빨리 건초가 되고, 소가 남기지 않습니다. 냄새가 적어 맨손으로 급여할 수 있을 만큼 질이 좋아집니다.",
  image: "/images/dragon/forage-smell.webp",
  imageAlt: "축사에서 DRAGON 으로 만든 조사료를 살펴보는 농가",
  side: "/images/dragon/barn-calf.webp",
  sideAlt: "조사료를 먹는 한우",
  effects: [
    { title: "급여가 편합니다", copy: "작물이 파쇄된 뒤 베일로 만들어져, 급여할 때 쉽게 풀립니다." },
    { title: "남기지 않습니다", copy: "굵은 작물도 파쇄되어 기호성이 좋아지고, 소가 남기는 것이 없어 청소와 뒷정리가 수월합니다." },
    { title: "냄새가 적습니다", copy: "빠르게 건초가 되어 베일 특유의 나쁜 냄새가 줄고, 맨손으로 급여할 만큼 질이 좋아집니다." },
    { title: "축사가 깨끗합니다", copy: "질 좋은 사료를 먹이면 축사 환경이 좋아지고 바닥 상태를 유지하는 데 도움이 됩니다." },
    { title: "키우는 보람", copy: "사육 성장이 좋아져 축산 경영의 보람이 커집니다." },
  ],
};

export type HpRange = {
  id: string;
  label: string;
  shortLabel: string;
  machines: string[];
};

/** 마력대별 DRAGON 모델 — 2026-10-28 수정사항 (60마력 미만은 문의) */
export const hpRanges: HpRange[] = [
  { id: "lt60", label: "60마력 미만", shortLabel: "60 미만", machines: [] },
  { id: "60-79", label: "60 ~ 79마력", shortLabel: "60~79", machines: ["DRAGON 210"] },
  { id: "80-99", label: "80 ~ 99마력", shortLabel: "80~99", machines: ["DRAGON 210", "DRAGON 230"] },
  { id: "100-119", label: "100 ~ 119마력", shortLabel: "100~119", machines: ["DRAGON 230", "DRAGON 250"] },
  { id: "120-150", label: "120 ~ 150마력", shortLabel: "120~150", machines: ["DRAGON 250", "DRAGON 280", "DRAGON 314"] },
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
    tags: ["DRAGON", "DRAGON250", "트리티케일"],
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
    tags: ["DRAGON", "DRAGON250", "호밀"],
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
    tags: ["박람회", "DRAGON"],
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
    tags: ["DRAGON", "DRAGON230", "수단그라스"],
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
    tags: ["DRAGON", "DRAGON280", "수단그라스"],
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
    tags: ["DRAGON", "DRAGON280", "수단그라스"],
    tone: "#7c6a3c",
    views: 871,
    likes: 7,
  },
  {
    id: "yt-LUsEx4Elmak",
    youtubeId: "LUsEx4Elmak",
    title: "DRAGON 시리즈를 소개합니다",
    caption: "DRAGON 시리즈를\n{소개합니다}",
    kind: "제품 소개",
    date: "2024.11.22",
    tags: ["DRAGON", "제품소개"],
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
    tags: ["DRAGON", "DRAGON280", "극동6호", "수단그라스"],
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
    tags: ["DRAGON", "DRAGON230", "수단그라스"],
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
    tags: ["DRAGON", "DRAGON210", "호밀"],
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

export const videoTags = ["#DRAGON", "#수단그라스", "#호밀", "#트리티케일", "#극동6호", "#비무꼬"];
export const videoSorts = [
  { label: "최신순", short: "최신순" },
  { label: "조회수 높은 순", short: "조회수순" },
  { label: "좋아요 많은 순", short: "좋아요순" },
];

export type Consumable = {
  id: "blade" | "belt";
  name: string;
  spec: string;
  /** 단위 (개·줄) */
  unit: string;
  defaultQty: number;
  /** 실제 사진이 오기 전에는 DRAGON 부품 사진으로 대신한다 */
  image: string;
};

/** 소모품 — 2026-10-28 교정: 네트·랩 대신 DRAGON 파쇄 칼날·전용 벨트 */
export const consumables: Consumable[] = [
  {
    id: "blade",
    name: "파쇄 칼날",
    spec: "DRAGON 전 모델 · 모델별로 맞춰 보내 드립니다",
    unit: "개",
    defaultQty: 10,
    image: "/images/dragon/part-flail.webp",
  },
  {
    id: "belt",
    name: "전용 벨트",
    spec: "DRAGON 동력 전달용 · 모델별로 맞춰 보내 드립니다",
    unit: "개",
    defaultQty: 2,
    image: "/images/dragon/feat-tension.webp",
  },
];

export const supportItems = [
  { title: "작업기를\n구매하고 싶어요", sub: "구매 상담 · 견적 · 지원사업 안내", short: "작업기를 구매하고 싶어요" },
  { title: "사용법과 점검\n방법을 알고 싶어요", sub: "사용 설명서 · 점검 영상", short: "사용법·점검 방법을 알고 싶어요" },
  { title: "작업기에\n이상이 있어요", sub: "A/S 접수 · 출장 정비", short: "작업기에 이상이 있어요" },
  { title: "칼날·벨트를\n주문하고 싶어요", sub: "소모품 주문 · 배송 조회", short: "칼날·벨트를 주문하고 싶어요" },
  { title: "공장에\n직접 가보고 싶어요", sub: "오시는 길 · 시연 예약", short: "공장에 직접 가보고 싶어요" },
];
