/**
 * 홈페이지 어디서든 "문의 남기기" 양식을 열 때 쓴다.
 * 링크는 href="#inquiry" 로 두고 onClick 에서 이 함수를 부르면, 양식으로 내려가면서 종류·내용이 미리 채워진다.
 * 보낸 문의는 관리자 화면 "문의"에 쌓인다.
 */
export type InquiryPrefill = { category: string; message?: string };

export function openInquiry(category: string, message?: string) {
  window.dispatchEvent(new CustomEvent<InquiryPrefill>("mk:inquiry", { detail: { category, message } }));
}
