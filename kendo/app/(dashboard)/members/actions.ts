'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { Member, SignupRequest, RankHistoryWithProfile } from '@/lib/types/member';

/**
 * 복수 프로필 대응을 위한 헬퍼 함수
 */
async function getStaffProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, dojo_id, role')
    .eq('user_id', user.id)
    .is('deleted_at', null);

  // 사범/관장 권한이 있는 프로필을 우선 선택
  return profiles?.find(p => ['owner', 'instructor'].includes(p.role || '')) || profiles?.[0] || null;
}

/**
 * US1: 가입 요청 처리
 */
export async function getPendingSignupRequests() {
  const supabase = await createClient();
  const profile = await getStaffProfile();

  if (!profile || !['owner', 'instructor'].includes(profile.role || '')) {
    return [];
  }

  const { data, error } = await supabase
    .from('signup_requests')
    .select('*')
    .eq('dojo_id', profile.dojo_id || '')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching signup requests:', error);
    return [];
  }
  
  return data as SignupRequest[];
}

export async function approveSignup(requestId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('signup_requests')
    .update({ status: 'approved' })
    .eq('id', requestId);

  if (error) throw error;
  
  revalidatePath('/(dashboard)', 'layout');
  revalidatePath('/(dashboard)/members');
  return { success: true };
}

export async function rejectSignup(requestId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('signup_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId);

  if (error) throw error;
  
  revalidatePath('/(dashboard)', 'layout');
  return { success: true };
}

/**
 * US2: 관원 검색 및 목록 조회
 */
export async function getMembers(params: { 
  search?: string; 
  page?: number; 
  pageSize?: number; 
}) {
  const { search = '', page = 0, pageSize = 20 } = params;
  const supabase = await createClient();
  const profile = await getStaffProfile();

  if (!profile) throw new Error('Unauthorized');

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .eq('dojo_id', profile.dojo_id || '')
    .is('deleted_at', null)
    .order('name', { ascending: true })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) throw error;
  return { 
    members: data as Member[], 
    total: count || 0,
    hasMore: (count || 0) > (page + 1) * pageSize,
    viewerProfile: profile
  };
}

/**
 * US3: 사범 권한 관리
 */
export async function changeMemberRole(memberId: string, newRole: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc('update_member_role', {
    target_member_id: memberId,
    new_role: newRole
  });

  if (error) throw error;
  revalidatePath('/(dashboard)/members');
  return { success: true };
}

/**
 * US4: 관원 상세 정보 조회
 */
export async function getMemberDetails(memberId: string) {
  const supabase = await createClient();
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', memberId)
    .maybeSingle(); // 상세 정보는 대상이 한 명이어야 함

  if (profileError) throw profileError;
  if (!profile) throw new Error("Member not found");

  const { data: rankHistory, error: rankError } = await supabase
    .from('rank_history')
    .select('*, promoted_by_profile:profiles!rank_history_promoted_by_fkey(name)')
    .eq('user_id', memberId)
    .order('promoted_at', { ascending: false });

  if (rankError) throw rankError;

  return { 
    profile: profile as Member, 
    rankHistory: rankHistory as RankHistoryWithProfile[] 
  };
}

export async function promoteMember(memberId: string, newRank: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc('promote_member', {
    target_member_id: memberId,
    new_rank: newRank
  });

  if (error) throw error;
  revalidatePath('/(dashboard)/members');
  revalidatePath(`/(dashboard)/members/${memberId}`);
  return { success: true };
}

export async function getAttendanceHistory(memberId: string, page: number = 0) {
  const pageSize = 10;
  const supabase = await createClient();
  const { data, error, count } = await supabase
    .from('attendance_logs')
    .select('*', { count: 'exact' })
    .eq('user_id', memberId)
    .order('attended_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) throw error;
  return { 
    logs: data, 
    hasMore: (count || 0) > (page + 1) * pageSize 
  };
}

export async function updateMemberDetails(memberId: string, data: Partial<Member>) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', memberId);

  if (error) throw error;
  revalidatePath(`/(dashboard)/members/${memberId}`);
  revalidatePath('/(dashboard)/members');
  return { success: true };
}

/**
 * US5: 관원 삭제
 */
export async function softDeleteMember(memberId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', memberId);

  if (error) throw error;
  revalidatePath('/(dashboard)/members');
  return { success: true };
}