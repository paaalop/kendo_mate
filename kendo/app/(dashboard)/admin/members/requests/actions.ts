'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveLinkRequest(requestId: string) {
  const supabase = await createClient()
  
  const { data: request, error: reqError } = await supabase
    .from('link_requests')
    .select('*, profiles!inner(name, birthdate, dojo_id, dojos!inner(owner_id))')
    .eq('id', requestId)
    .single()
    
  if (reqError || !request) {
    console.error('Request fetch error:', reqError)
    return { error: '요청을 찾을 수 없거나 데이터 로드에 실패했습니다.' }
  }
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Cast to any to safely access nested properties if TypeScript types are ambiguous
  const profile = request.profiles as any
  const ownerId = profile?.dojos?.owner_id
  
  if (!user || user.id !== ownerId) {
    return { error: '이 작업을 수행할 권한이 없습니다.' }
  }

  // 1. Get guardian's user info to update profile
  // Loosen role check as some guardians might have 'member' role if they also train
  const { data: guardianUser, error: guardianUserError } = await supabase
    .from('profiles')
    .select('id, name, phone, dojo_id')
    .eq('user_id', request.guardian_id)
    .order('role', { ascending: false }) // Prefer 'owner' > 'member' > 'guardian' ? No, maybe just pick one
    .limit(1)
    .maybeSingle()

  // Update profile with guardian info
  const { error: profileUpdateError } = await supabase
    .from('profiles')
    .update({
      guardian_name: guardianUser?.name || null,
      guardian_phone: guardianUser?.phone || null,
      updated_at: new Date().toISOString()
    } as any)
    .eq('id', request.profile_id)

  if (profileUpdateError) {
    console.error('Update profile with guardian info error:', profileUpdateError)
  }

  // Update guardian's dojo_id if they don't have one
  if (guardianUser && !guardianUser.dojo_id && profile.dojo_id) {
    await supabase
      .from('profiles')
      .update({ dojo_id: profile.dojo_id } as any)
      .eq('id', guardianUser.id)
  }

  // 2. Insert into profile_guardians
  const { error: insertError } = await supabase
    .from('profile_guardians')
    .insert({
      profile_id: request.profile_id,
      guardian_id: request.guardian_id,
      relationship: request.relationship,
      is_primary: false
    })
    .select()

  // Ignore unique violation (if already linked) but we should proceed to update request anyway.
  if (insertError && insertError.code !== '23505') { 
     console.error('Insert profile_guardians error:', insertError)
     return { error: `연결 생성 실패: ${insertError.message}` }
  }

  // Update request status
  const { error: updateError } = await supabase
    .from('link_requests')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', requestId)

  if (updateError) {
    console.error('Update link_requests error:', updateError)
    return { error: `요청 상태 업데이트 실패: ${updateError.message}` }
  }

  // Cleanup Shadow Profiles
  const profileName = profile?.name
  const profileBirthdate = profile?.birthdate

  if (profileName) {
    await supabase.rpc('cleanup_shadow_profiles', {
      target_guardian_id: request.guardian_id,
      target_name: profileName,
      target_birthdate: profileBirthdate || null
    })
  }

  revalidatePath('/admin/members/requests')
  return { success: true }
}

export async function rejectLinkRequest(requestId: string) {
  const supabase = await createClient()
  // Ideally verify ownership again
  const { error } = await supabase
    .from('link_requests')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', requestId)

  if (error) return { error: error.message }
  
  revalidatePath('/admin/members/requests')
  return { success: true }
}
