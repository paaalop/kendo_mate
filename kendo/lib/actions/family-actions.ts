'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createShadowProfile(prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const birthdate = formData.get('birthdate') as string

  if (!name || !birthdate) {
    return { error: 'Name and birthdate are required' }
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Check if the user is a dojo owner
  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('dojo_id')
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .single()

  const { error } = await supabase
    .from('profiles')
    .insert({
      name,
      birthdate,
      owner_id: user.id,
      is_shadow: true,
      role: 'member',
      dojo_id: ownerProfile?.dojo_id || null, // Automatically link if owner
    })

  if (error) {
    console.error('Create Profile Error:', error)
    return { error: 'Failed to create profile' }
  }

  revalidatePath('/')
  return { success: true }
}

export async function createLinkRequest(prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const supabase = await createClient()

  const shadowProfileId = formData.get('shadowProfileId') as string
  const targetDojoId = formData.get('targetDojoId') as string
  const childName = formData.get('childName') as string
  const childBirthdate = formData.get('childBirthdate') as string

  if (!shadowProfileId || !targetDojoId || !childName || !childBirthdate) {
    return { error: 'Missing required fields' }
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, birthdate')
    .eq('id', shadowProfileId)
    .eq('owner_id', user.id)
    .single()

  if (profileError || !profile) {
    return { error: 'Profile not found or access denied' }
  }

  const { data: existingRequest } = await supabase
    .from('link_requests')
    .select('id')
    .eq('guardian_id', user.id)
    .eq('target_dojo_id', targetDojoId)
    .eq('child_name', childName)
    .eq('request_type', 'link')
    .eq('status', 'pending')
    .single()

  if (existingRequest) {
    return { error: 'A pending link request already exists for this profile' }
  }

  const { error } = await supabase
    .from('link_requests')
    .insert({
      guardian_id: user.id,
      target_dojo_id: targetDojoId,
      child_name: childName,
      child_birthdate: childBirthdate,
      request_type: 'link',
      status: 'pending'
    })

  if (error) {
    console.error('Link Request Error:', error)
    return { error: 'Failed to send link request' }
  }

  revalidatePath('/')
  return { success: true }
}

export async function requestUnlink(profileId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, birthdate, dojo_id')
    .eq('id', profileId)
    .eq('owner_id', user.id)
    .single()

  if (profileError || !profile || !profile.dojo_id || !profile.birthdate) {
    return { error: 'Linked profile not found or missing information' }
  }

  const { data: existingRequest } = await supabase
    .from('link_requests')
    .select('id')
    .eq('guardian_id', user.id)
    .eq('target_dojo_id', profile.dojo_id)
    .eq('child_name', profile.name)
    .eq('request_type', 'unlink')
    .eq('status', 'pending')
    .single()

  if (existingRequest) {
    return { error: 'A pending unlink request already exists' }
  }

  const { error } = await supabase
    .from('link_requests')
    .insert({
      guardian_id: user.id,
      target_dojo_id: profile.dojo_id,
      child_name: profile.name,
      child_birthdate: profile.birthdate,
      request_type: 'unlink',
      status: 'pending'
    })

  if (error) {
    console.error('Unlink Request Error:', error)
    return { error: 'Failed to send unlink request' }
  }

  revalidatePath('/')
  return { success: true }
}

export async function setActiveProfile(profileId: string) {
  const cookieStore = await (await import('next/headers')).cookies()
  
  if (profileId === 'guardian') {
    cookieStore.set('active_profile_id', 'guardian_summary')
  } else {
    cookieStore.set('active_profile_id', profileId)
  }
  
  revalidatePath('/')
}

export async function clearActiveProfile() {
  const cookieStore = await (await import('next/headers')).cookies()
  cookieStore.delete('active_profile_id')
}