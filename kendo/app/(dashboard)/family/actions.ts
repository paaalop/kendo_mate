'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function findMyChildren() {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('find_potential_children')
  
  if (error) {
    console.error('find_potential_children error', error)
    return { error: error.message }
  }
  
  return { data }
}

export async function linkChild(profileId: string, relationship: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.rpc('link_child', { 
    child_profile_id: profileId,
    relation: relationship
  })
  
  if (error) {
    console.error('link_child error', error)
    return { error: error.message }
  }
  
  revalidatePath('/dashboard')
  revalidatePath('/family')
  return { success: true }
}
