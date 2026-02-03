import * as z from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Notice Schemas
export const createNoticeSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요."),
  content: z.string().min(1, "내용을 입력해주세요."),
  isPinned: z.boolean(),
});

export const updateNoticeSchema = createNoticeSchema.extend({
  id: z.string().uuid(),
});

// Post Schemas
export const createPostSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요."),
  content: z.string().min(1, "내용을 입력해주세요."),
  category: z.enum(["FREE", "QUESTION", "EXERCISE"]),
  // For file upload validation on client/server (if passed as File)
  image: z
    .any()
    .refine((file) => !file || file?.size <= MAX_FILE_SIZE, "파일 크기는 5MB 이하여야 합니다.")
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "지원되지 않는 이미지 형식입니다. (JPEG, PNG, WEBP)"
    )
    .optional(),
  // Alternatively, if we pass image_url string after upload
  imageUrl: z.string().optional(),
});

export const updatePostSchema = createPostSchema.extend({
  id: z.string().uuid(),
});

// Comment Schemas
export const createCommentSchema = z.object({
  content: z.string().min(1, "댓글 내용을 입력해주세요."),
  postId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
});

export const updateCommentSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1, "댓글 내용을 입력해주세요."),
});

// Report Schemas
export const createReportSchema = z.object({
  postId: z.string().uuid(),
  reason: z.string().min(1, "신고 사유를 입력해주세요."),
});
