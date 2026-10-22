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

/** 히어로 바로 아래 "바로 가기" 문 세 개 */
export const quickDoors = [
  {
    kicker: "BUY",
    title: "작업기 구매 상담",
    copy: "트랙터 마력과 작업 면적만 알려 주시면 맞는 작업기와 지원사업을 안내해 드립니다.",
    link: "구매 상담 받기",
    href: "#support",
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
    href: "#support",
  },
];

/**
 * 주력 제품 DRAGON — 하이브리드 모어 컨디셔너 (트랙터 3점 부착, 베면서 줄기를 부순다).
 * 사진 원본은 구글 드라이브 "성원마끼나 소스" 폴더. 웹용으로 줄인 파일이 public/images/dragon/ 에 있다.
 */
export const dragon = {
  name: "DRAGON",
  label: "하이브리드 모어 컨디셔너",
  catch: "베면서 부순다.",
  copy: "로터의 날이 풀을 베는 동시에 줄기를 두드려 부숩니다. 부순 풀은 빨리 마르고, 부드러워 소가 잘 먹습니다.",
  heroImage: "/images/dragon/field-cut.webp",
  heroAlt: "트랙터에 단 드래곤이 키 큰 수수밭을 베는 모습",
  render: "/images/dragon/dr280.webp",
  renderAlt: "DRAGON 280 하이브리드 모어 컨디셔너",
  /** 밭에서 축사까지 — 실제 현장 사진 */
  story: [
    {
      step: "벤다",
      title: "한 번 지나가면 끝.",
      copy: "베고 부수는 일을 한 번에 합니다. 따로 압쇄기를 걸 필요가 없습니다.",
      image: "/images/dragon/field-rows.webp",
      alt: "드래곤이 베고 지나간 자리에 고르게 누운 풀",
    },
    {
      step: "부순다",
      title: "줄기까지 부드럽게.",
      copy: "딱딱한 줄기가 잘게 쪼개져, 베일을 풀었을 때 손으로 쉽게 뜯깁니다.",
      image: "/images/dragon/forage-close.webp",
      alt: "잘게 쪼개진 조사료 줄기를 가까이서 본 모습",
    },
    {
      step: "먹인다",
      title: "소가 남기지 않게.",
      copy: "줄기가 부드러운 조사료는 송아지도 잘 먹습니다.",
      image: "/images/dragon/barn-feed.webp",
      alt: "축사에서 한우들이 드래곤으로 만든 조사료를 먹는 모습",
    },
  ],
  /** 구조 — 3D 도면 */
  parts: [
    { name: "로터", copy: "촘촘히 박힌 날이 풀을 베고 두드립니다.", image: "/images/dragon/part-rotor.webp" },
    { name: "파쇄부", copy: "로터와 맞물려 줄기를 한 번 더 부숩니다.", image: "/images/dragon/part-flail.webp" },
    { name: "양쪽 동력 전달", copy: "가운데 기어박스에서 양 끝으로 힘을 나눠 넓은 폭도 고르게 돕니다.", image: "/images/dragon/part-drive.webp" },
  ],
};

export type ProductCategory = "mower";

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  categoryLabel: string;
  /** 카페24 동동으로 표시되는 한 줄 캐치카피 */
  catch: string;
  copy: string;
  /** 작업 폭·적정 마력 등. 확정되면 채운다 (비어 있으면 "전화 안내") */
  spec?: string;
  isNew?: boolean;
  /** public/images 의 사진 경로. 없으면 자리표시 실루엣 */
  image?: string;
};

/** 드래곤 라인업. 모델별 작업 폭·적정 마력은 회사 사양표를 받으면 spec 에 넣는다 */
export const products: Product[] = [
  {
    id: "dr210",
    name: "DRAGON 210",
    category: "mower",
    categoryLabel: "하이브리드 모어 컨디셔너",
    catch: "작은 밭도 빈틈없이.",
    copy: "드래곤 라인업에서 가장 작은 모델입니다.",
    image: "/images/dragon/dr210.webp",
  },
  {
    id: "dr230",
    name: "DRAGON 230",
    category: "mower",
    categoryLabel: "하이브리드 모어 컨디셔너",
    catch: "베면서 부순다.",
    copy: "로터와 파쇄부가 한 번에 베고 부숩니다.",
    image: "/images/dragon/dr230.webp",
  },
  {
    id: "dr250",
    name: "DRAGON 250",
    category: "mower",
    categoryLabel: "하이브리드 모어 컨디셔너",
    catch: "베면서 부순다.",
    copy: "로터와 파쇄부가 한 번에 베고 부숩니다.",
  },
  {
    id: "dr280",
    name: "DRAGON 280",
    category: "mower",
    categoryLabel: "하이브리드 모어 컨디셔너",
    catch: "넓게, 고르게.",
    copy: "양쪽으로 동력을 나눠 넓은 폭도 고르게 돌립니다.",
    image: "/images/dragon/dr280.webp",
  },
  {
    id: "dr314",
    name: "DRAGON 314",
    category: "mower",
    categoryLabel: "하이브리드 모어 컨디셔너",
    catch: "드래곤의 맏형.",
    copy: "드래곤 라인업에서 가장 큰 모델입니다.",
  },
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
    machine: "원형 베일러",
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

/** 마력대별 드래곤 모델. 모델별 적정 마력이 확정되면 machines 에 "DRAGON 230" 처럼 넣는다 */
export const hpRanges: HpRange[] = [
  { id: "le35", label: "35마력 이하", shortLabel: "35 이하", machines: [] },
  { id: "36-50", label: "36 ~ 50마력", shortLabel: "36~50", machines: [] },
  { id: "51-70", label: "51 ~ 70마력", shortLabel: "51~70", machines: [] },
  { id: "71-90", label: "71 ~ 90마력", shortLabel: "71~90", machines: [] },
  { id: "ge91", label: "91마력 이상", shortLabel: "91 이상", machines: [] },
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
};

/** 관리자에서 유튜브 영상을 올리기 전까지 보이는 예시 카드 */
export const videos: Video[] = [
  {
    id: "v1",
    title: "DRAGON 수수 베기 — 안동 현장",
    caption: "키 큰 수수도\n{한 번에} 베고 부수기",
    kind: "작업 영상",
    date: "2026.09.04",
    tags: ["드래곤", "수수", "수확철"],
    tone: "#5f6a44",
  },
  {
    id: "v2",
    title: "드래곤으로 만든 조사료, 축사에서 풀어 보기",
    caption: "손으로 뜯기는\n{부드러운} 줄기",
    kind: "작업 영상",
    date: "2026.01.15",
    tags: ["드래곤", "조사료", "한우"],
    tone: "#7c7a52",
  },
  {
    id: "v3",
    title: "DRAGON 연결과 작업 전 점검 — 사용 설명",
    caption: "작업 전에\n{이것만} 보세요",
    kind: "사용법",
    date: "2025.08.30",
    tags: ["드래곤", "사용법"],
    tone: "#8a7d5a",
  },
];

export const videoTags = ["#드래곤", "#수수", "#조사료", "#한우", "#사용법", "#수확철"];
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
