/** 주소로 지도 퍼가기 주소를 만든다 (괄호 속 지번은 빼야 검색이 정확하다) */
export function mapEmbedSrc(address: string) {
  const q = address.replace(/\s*\(.*?\)\s*/g, " ").trim();
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&hl=ko&z=15&output=embed`;
}

/** 사이트 공통 정보. 확정되면 여기 한 곳만 고친다. */
export const site = {
  name: "성원마끼나",
  nameEn: "MAKKINA",
  tagline: "이름처럼 일하는 기계",
  slogan: "베고, 모으고, 묶고, 감싸다.",
  sloganSub: "조사료의 처음부터 끝까지, 안동에서 만든 기계가 함께합니다.",
  phone: "054-843-4000",
  phoneHref: "tel:0548434000",
  /** 두 번째 회선. 화면에는 "054-843-4000~1" 처럼 묶어 보여 준다 */
  phone2: "054-843-4001",
  phone2Href: "tel:0548434001",
  fax: "054-000-0000",
  address: "경상북도 안동시 서후면 풍산태사로 2780 (금계리 389)",
  hours: "평일 08:30 – 18:00 · 토요일 오전 · 수확철 연장",
  ceo: "○○○",
  bizNo: "000-00-00000",
  /** 카카오톡 채널 링크가 정해지면 교체 */
  kakaoHref: "#",
  /** 카카오맵에 등록된 공장 (장소 ID 7941605) */
  mapHref: "https://place.map.kakao.com/7941605",
  /** 카카오맵 길찾기 — 내 위치에서 공장까지 */
  routeHref: "https://map.kakao.com/link/to/7941605",
  naverMapHref: "https://map.naver.com/p/search/" + encodeURIComponent("경북 안동시 서후면 풍산태사로 2780"),
  /** 오시는 길 지도 (키 없이 쓰는 구글 지도 퍼가기) */
  mapEmbed: mapEmbedSrc("경북 안동시 서후면 풍산태사로 2780"),
  youtubeHref: "#",
};

export type NavLink = { label: string; href: string };

/** 상단 유리 내비. 묶음 사이에 얇은 구분선이 들어간다 */
export const navGroups: { title: string; links: NavLink[] }[] = [
  {
    title: "작업기",
    links: [
      { label: "드래곤", href: "#dragon" },
      { label: "라인업", href: "#products" },
      { label: "작업 흐름", href: "#workflow" },
      { label: "마력 찾기", href: "#hp-finder" },
    ],
  },
  {
    title: "소모품·영상",
    links: [
      { label: "소모품", href: "#consumables" },
      { label: "작업 영상", href: "#videos" },
    ],
  },
  {
    title: "고객지원",
    links: [
      { label: "고객지원", href: "#support" },
      { label: "오시는 길", href: "#directions" },
    ],
  },
];

export const utilLinks: NavLink[] = [
  { label: "회사소개", href: "#about" },
  { label: "대리점 안내", href: "#dealers" },
  { label: "카탈로그 다운로드", href: "#catalog" },
  { label: "채용", href: "#careers" },
];

export const footerGroups: { title: string; links: NavLink[] }[] = [
  {
    title: "작업기",
    links: [
      { label: "드래곤", href: "#dragon" },
      { label: "드래곤 라인업", href: "#products" },
      { label: "조사료 작업 흐름", href: "#workflow" },
      { label: "마력으로 찾기", href: "#hp-finder" },
      { label: "작업 영상", href: "#videos" },
    ],
  },
  {
    title: "주문·지원",
    links: [
      { label: "소모품 빠른 주문", href: "#consumables" },
      { label: "구매 상담", href: "#support" },
      { label: "A/S 접수", href: "#support" },
      { label: "오시는 길", href: "#directions" },
    ],
  },
  {
    title: "회사",
    links: [
      { label: "회사소개", href: "#about" },
      { label: "대리점 안내", href: "#dealers" },
      { label: "카탈로그 다운로드", href: "#catalog" },
      { label: "채용", href: "#careers" },
    ],
  },
];

export const legalLinks: NavLink[] = [
  { label: "개인정보처리방침", href: "#privacy" },
  { label: "이용약관", href: "#terms" },
];
