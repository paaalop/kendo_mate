import * as z from 'zod'

export const createShadowProfileSchema = z.object({
  name: z.string().min(2, '이름은 2글자 이상이어야 합니다'),
  birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '생년월일 형식이 올바르지 않습니다 (YYYY-MM-DD)'),
})

export type CreateShadowProfileValues = z.infer<typeof createShadowProfileSchema>
