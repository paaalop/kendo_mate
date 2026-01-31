import * as z from "zod";

/**
 * 비밀번호 정책: 8자 이상, 영문+숫자 혼용 필수
 */
export const passwordSchema = z
  .string()
  .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]*$/,
    "비밀번호는 영문과 숫자를 모두 포함해야 합니다."
  );

/**
 * 로그인 스키마
 */
export const loginSchema = z.object({
  email: z.string().email("유효한 이메일을 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

/**
 * 회원가입 스키마 (기본 계정 생성)
 */
export const signupSchema = z.object({
  email: z.string().email("유효한 이메일을 입력해주세요."),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["confirmPassword"],
});

/**
 * 도장 생성 스키마 (관장 온보딩)
 */
export const createDojoSchema = z.object({
  name: z.string().min(2, "도장 이름은 2자 이상이어야 합니다."),
  ownerName: z.string().min(2, "이름은 2자 이상이어야 합니다."),
  phone: z.string().regex(/^010\d{8}$/, "올바른 휴대폰 번호 형식이 아닙니다 (010XXXXXXXX)."),
});

/**
 * 도장 가입 신청 스키마 (관원/사범 온보딩)
 */
export const joinDojoSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상이어야 합니다."),
  phone: z.string().regex(/^010\d{8}$/, "올바른 휴대폰 번호 형식이 아닙니다 (010XXXXXXXX)."),
  isAdult: z.boolean(),
  guardianPhone: z.string().optional(),
}).refine((data) => {
  if (!data.isAdult && !data.guardianPhone) {
    return false;
  }
  return true;
}, {
  message: "미성년자인 경우 보호자 연락처가 필수입니다.",
  path: ["guardianPhone"],
});