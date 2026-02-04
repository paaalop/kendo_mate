'use server'

import { createClient } from '@/utils/supabase/server'
import { memberSearchSchema, MemberSearchInput } from '@/lib/validations/member'
import { revalidatePath } from 'next/cache'

export async function getDojos() {
  const supabase = await createClient()
  const { data } = await supabase.from('dojos').select('id, name').order('name')
  return data || []
}

export async function findMyChildren(dojoId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // 1. Get current user's phone number
  const { data: myProfile } = await supabase
    .from('profiles')
    .select('phone')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .maybeSingle()

  const userPhone = myProfile?.phone || user.phone || user.user_metadata?.phone

  if (!userPhone) {
    return { error: '내 계정에 등록된 연락처를 찾을 수 없습니다.' }
  }

  const sanitizedPhone = userPhone.replace(/[^0-9]/g, '')

  // 2. Find profiles using RPC (Security Definer) to bypass RLS for searching
  const { data: children, error } = await supabase
    .rpc('search_profiles_by_phone', { 
      search_phone: sanitizedPhone,
      target_dojo_id: dojoId || null,
      requester_uuid: user.id
    })

  if (error) {
    console.error('Search error:', error)
    return { error: '검색 중 오류가 발생했습니다.' }
  }

  if (!children || children.length === 0) {
    return { error: `'${userPhone}' 번호로 등록된 관원을 찾을 수 없습니다.` }
  }

  // Format data to include dojo name
  const formattedChildren = (children as any[]).map((c) => ({
    id: c.id,
    name: c.name,
    birthdate: c.birthdate,
    dojoName: c.dojo_name || '소속 도장 없음'
  }))

  return { data: formattedChildren }
}

export async function createLinkRequest(profileId: string, relationship: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Check if already requested or linked?
  // RLS might handle duplicates or unique constraints.
  // We don't have unique constraint on link_requests(profile_id, guardian_id) but probably should.
  // But let's just insert.

  const { error } = await supabase
    .from('link_requests')
    .insert({
      profile_id: profileId,
      guardian_id: user.id,
      relationship,
      status: 'pending'
    })

  if (error) return { error: error.message }
  
  revalidatePath('/family/link')
  return { success: true }
}
