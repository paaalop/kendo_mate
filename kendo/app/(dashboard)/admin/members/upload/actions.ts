'use server'

import { createClient } from '@/utils/supabase/server'
import { bulkUploadSchema, BulkMemberInput } from '@/lib/validations/member'
import { revalidatePath } from 'next/cache'

export async function bulkCreateProfiles(data: BulkMemberInput[]) {
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Check if user is admin/owner of a dojo
  const { data: dojo } = await supabase
    .from('dojos')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!dojo) {
    return { error: 'Dojo not found for this user' }
  }

  // 2. Validate Data
  const parsed = bulkUploadSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Validation failed', details: parsed.error.format() }
  }

  // 3. Prepare Inserts
  const profilesToInsert = parsed.data.map(member => ({
    dojo_id: dojo.id,
    name: member.name,
    birthdate: member.birthdate instanceof Date ? member.birthdate.toISOString().split('T')[0] : member.birthdate,
    guardian_phone: member.guardian_phone || null,
    phone: member.phone || null,
    role: 'member',
    deleted_at: null,
    default_session_time: member.default_session_time || null,
    // user_id is null (unlinked)
  }))

  // 4. Use RPC for safe bulk upsert (preserves existing data if new data is null)
  const { error } = await supabase.rpc('bulk_upsert_profiles', {
    profiles_data: profilesToInsert
  })

  if (error) {
    console.error('Bulk upload error:', error)
    return { error: 'Failed to process profiles: ' + error.message }
  }

  revalidatePath('/admin/members')
  return { success: true, count: profilesToInsert.length }
}
