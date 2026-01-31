import * as z from "zod";

/**
 * 승급 심사 알림 전송 스키마
 */
export const promotionNotificationSchema = z.object({
  month: z.string().regex(/^\d{1,2}$/, "월은 1에서 12 사이의 숫자여야 합니다."),
  dojoId: z.string().uuid("유효하지 않은 도장 ID입니다."),
});

/**
 * 출석 토글 스키마
 */
export const attendanceToggleSchema = z.object({
  userId: z.string().uuid("유효하지 않은 사용자 ID입니다."),
  dojoId: z.string().uuid("유효하지 않은 도장 ID입니다."),
  date: z.string().datetime().optional(), // 기본값은 서버에서 처리
});

/**
 * 기술 통과 처리 스키마
 */
export const techniquePassSchema = z.object({
  userId: z.string().uuid("유효하지 않은 사용자 ID입니다."),
  itemId: z.string().uuid("유효하지 않은 기술 ID입니다."),
});
