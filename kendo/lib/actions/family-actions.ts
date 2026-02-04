'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'



export async function setActiveProfile(profileId: string) {
  const cookieStore = await (await import('next/headers')).cookies()
  cookieStore.set('active_profile_id', profileId)
  revalidatePath('/')
}

export async function clearActiveProfile() {
  const cookieStore = await (await import('next/headers')).cookies()
  cookieStore.delete('active_profile_id')
}