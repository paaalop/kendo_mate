/**
 * 전화번호에서 숫자를 제외한 모든 문자를 제거합니다.
 * 예: 010-1234-5678 -> 01012345678
 */
export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

/**
 * 숫자로 된 전화번호에 하이픈을 추가하여 포맷팅합니다.
 * 예: 01012345678 -> 010-1234-5678
 */
export function formatPhoneNumber(phone: string): string {
  const digits = sanitizePhoneNumber(phone);
  if (digits.length !== 11) return phone;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}