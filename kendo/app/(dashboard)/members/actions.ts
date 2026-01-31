"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

async function checkIsStaff(supabase: any, userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, dojo_id")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!profile || (profile.role !== "owner" && profile.role !== "instructor")) {
    return null;
  }
  return profile;
}

export async function approveRequest(requestId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "인증되지 않았습니다." };

  const staff = await checkIsStaff(supabase, user.id);
  if (!staff) return { error: "권한이 없습니다." };

  // 1. 신청 내역 조회 (도장 일치 확인)
  const { data: request } = await supabase
    .from("signup_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (!request || request.dojo_id !== staff.dojo_id) {
    return { error: "해당 신청을 찾을 수 없거나 접근 권한이 없습니다." };
  }

  // 2. 승인 처리 (트리거가 프로필 생성/복구 처리함)
  const { error } = await supabase
    .from("signup_requests")
    .update({ status: "approved" })
    .eq("id", requestId);

  if (error) return { error: "승인 처리 중 오류가 발생했습니다: " + error.message };

  revalidatePath("/members");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function rejectRequest(requestId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "인증되지 않았습니다." };

  const staff = await checkIsStaff(supabase, user.id);
  if (!staff) return { error: "권한이 없습니다." };

  const { error } = await supabase
    .from("signup_requests")
    .update({ status: "rejected" })
    .eq("id", requestId);

  if (error) return { error: "거절 처리 중 오류가 발생했습니다." };

  revalidatePath("/members");
  return { success: true };
}

export async function updateMemberRole(profileId: string, newRole: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "인증되지 않았습니다." };

  const staff = await checkIsStaff(supabase, user.id);
  // 역할 변경은 관장(owner)만 가능하도록 함
  if (!staff || staff.role !== 'owner') return { error: "관장님만 역할을 변경할 수 있습니다." };

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", profileId)
    .eq("dojo_id", staff.dojo_id);

  if (error) return { error: "역할 변경 중 오류가 발생했습니다." };

  revalidatePath("/members");
  return { success: true };
}

export async function deleteMember(profileId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) return { error: "인증되지 않았습니다." };
  
    const staff = await checkIsStaff(supabase, user.id);
    if (!staff || staff.role !== 'owner') return { error: "관장님만 관원을 삭제할 수 있습니다." };
  
    // Soft Delete
    const { error } = await supabase
      .from("profiles")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", profileId)
      .eq("dojo_id", staff.dojo_id);
  
    if (error) return { error: "삭제 중 오류가 발생했습니다." };
  
    revalidatePath("/members");
    return { success: true };
}
