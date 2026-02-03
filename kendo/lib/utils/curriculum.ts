import { createClient } from '@/utils/supabase/server'

export async function getCurrentCurriculumItem(memberId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_next_curriculum', {
    member_uuid: memberId
  })

  if (error) {
    console.error('Error fetching current curriculum:', error)
    return null
  }

  return data && data.length > 0 ? data[0] : null
}
