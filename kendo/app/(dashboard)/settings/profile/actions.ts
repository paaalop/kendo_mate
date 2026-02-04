'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getUserId } from '@/lib/utils/auth'

export async function updateMyProfile(data: { name: string; phone: string }) {
  const supabase = await createClient()
  const userId = await getUserId()

  if (!userId) {
    return { error: '인증되지 않았습니다.' }
  }

  // Update all active profiles for this user (usually there's only one main user profile, but just in case)
  const { error } = await supabase
    .from('profiles')
    .update({
      name: data.name,
      phone: data.phone,
    })
    .eq('user_id', userId)
    .is('deleted_at', null)

  if (error) {
    console.error('Profile update error:', error)
    return { error: '프로필 수정 중 오류가 발생했습니다: ' + error.message }
  }

  revalidatePath('/settings/profile')
  revalidatePath('/(dashboard)', 'layout')
  
  return { success: true }
}
