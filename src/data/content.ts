/** 메인 화면 콘텐츠. 제품·영상·소모품이 늘어나면 이 파일만 고친다. */

export type ProductCategory =
  | "baler"
  | "mower"
  | "rake-wrapper"
  | "weeding"
  | "consumable";

export const productTabs: { id: ProductCategory | "all"; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "baler", label: "베일러" },
  { id: "mower", label: "모우어" },
  { id: "rake-wrapper", label: "레이크 · 래퍼" },
  { id: "weeding", label: "제초 · 파쇄" },
  { id: "consumable", label: "소모품" },
];

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  categoryLabel: string;
  /** 카페24 동동으로 표시되는 한 줄 캐치카피 */
  catch: string;
  copy: string;
  isNew?: boolean;
  /** public/images 의 누끼 사진 경로. 없으면 자리표시 실루엣 */
  image?: string;
};

export const products: Product[] = [
  {
    id: "bimukko",
    name: "비무꼬",
    category: "baler",
    categoryLabel: "일체형 원형베일러",
    catch: "한 번에, 세 가지.",
    copy: "베고, 부수고, 묶는 일을 한 대가 끝냅니다.",
    isNew: true,
  },
  {
    id: "blackhole",
    name: "블랙홀",
    category: "mower",
    categoryLabel: "드럼모우어",
    catch: "거부할 수 없는 흡입력.",
    copy: "들어간 풀은 돌아 나오지 않습니다.",
  },
  {
    id: "mojori",
    name: "모조리",
    category: "weeding",
    categoryLabel: "제초 파쇄기",
    catch: "이름 그대로.",
    copy: "리모컨 하나로 풀을 모조리 정리합니다.",
  },
];

export const workflow = [
  { step: 0, title: "들판", desc: "논·밭, 어떤 작물이든", machine: "" },
  { step: 1, title: "베기", desc: "남김없이 벱니다", machine: "블랙홀 드럼모우어" },
  { step: 2, title: "모으기", desc: "고르게 모읍니다", machine: "LKHR 레이크" },
  { step: 3, title: "묶기", desc: "단단히 묶습니다", machine: "비무꼬 원형베일러" },
  { step: 4, title: "감싸기", desc: "오래 지킵니다", machine: "S350H 자동 접철 래퍼" },
  { step: 5, title: "소모품", desc: "멈추지 않게", machine: "네트 · 랩 익일 출고" },
];

export type HpRange = {
  id: string;
  label: string;
  shortLabel: string;
  machines: string[];
};

export const hpRanges: HpRange[] = [
  { id: "le35", label: "35마력 이하", shortLabel: "35 이하", machines: ["모조리", "소형 레이크"] },
  { id: "36-50", label: "36 ~ 50마력", shortLabel: "36~50", machines: ["블랙홀", "LKHR 레이크", "모조리"] },
  {
    id: "51-70",
    label: "51 ~ 70마력",
    shortLabel: "51~70",
    machines: ["비무꼬", "블랙홀", "LKHR 레이크", "S350H 래퍼"],
  },
  {
    id: "71-90",
    label: "71 ~ 90마력",
    shortLabel: "71~90",
    machines: ["비무꼬", "블랙홀", "LKHR 레이크", "S350H 래퍼"],
  },
  { id: "ge91", label: "91마력 이상", shortLabel: "91 이상", machines: ["비무꼬", "블랙홀", "S350H 래퍼"] },
];

export type Video = {
  id: string;
  title: string;
  /** 썸네일 위 자막. {강조} 로 감싼 부분이 노란색으로 표시된다 */
  caption: string;
  kind: "작업 영상" | "사용법";
  date: string;
  /** 유튜브 영상 ID가 정해지면 넣는다 */
  youtubeId?: string;
  tone: string;
};

export const videos: Video[] = [
  {
    id: "v1",
    title: "비무꼬 일체형 베일러 — 안동 서후면 수확 현장",
    caption: "무른 논에서\n{한 번에} 베고 묶기",
    kind: "작업 영상",
    date: "2026.09.24",
    tone: "#7c7a52",
  },
  {
    id: "v2",
    title: "블랙홀 드럼모우어 흡입 장면 (슬로모션)",
    caption: "들어간 풀은\n{돌아 나오지} 않습니다",
    kind: "작업 영상",
    date: "2026.09.12",
    tone: "#5f6a44",
  },
  {
    id: "v3",
    title: "비무꼬 네트 교체 방법 — 사용 설명 영상",
    caption: "네트 교체,\n{3분이면} 끝",
    kind: "사용법",
    date: "2026.08.30",
    tone: "#8a7d5a",
  },
];

export const videoTags = ["#비무꼬", "#블랙홀", "#모조리", "#무른논", "#사용법", "#수확철"];
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
