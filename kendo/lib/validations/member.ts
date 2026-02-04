import { z } from 'zod';

// Schema for individual member row in Excel
export const bulkMemberSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다'),
  birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '생년월일은 YYYY-MM-DD 형식이어야 합니다').or(z.date()), 
  // Excel parsing might return Date object or string depending on parsing options, 
  // but sheet_to_json usually returns strings or numbers if raw: false.
  // We'll assume string input from UI or handle conversion before validation.
  guardian_phone: z.string().min(10, '보호자 연락처 형식이 올바르지 않습니다').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional(),
  default_session_time: z.string().optional(),
});

export const bulkUploadSchema = z.array(bulkMemberSchema);

export const linkRequestSchema = z.object({
  profile_id: z.string().uuid(),
  relationship: z.string().min(1, '관계를 입력해주세요'),
});

export const memberSearchSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식이어야 합니다'),
  dojo_id: z.string().uuid('도장을 선택해주세요'),
});

export type BulkMemberInput = z.infer<typeof bulkMemberSchema>;
export type LinkRequestInput = z.infer<typeof linkRequestSchema>;
export type MemberSearchInput = z.infer<typeof memberSearchSchema>;
