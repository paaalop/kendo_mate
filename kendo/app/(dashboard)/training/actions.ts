"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { 
  promotionNotificationSchema, 
  attendanceToggleSchema, 
  techniquePassSchema 
} from "@/lib/validations/training";

/**
 * 수련 관리 화면을 위한 종합 데이터 조회
 */
export async function fetchTrainingData() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("인증되지 않은 사용자입니다.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("dojo_id, role")
    .eq("user_id", user.id)
    .single();

  if (!profile || (profile.role !== "owner" && profile.role !== "instructor")) {
    throw new Error("접근 권한이 없습니다.");
  }

  const dojoId = profile.dojo_id;
  
  // 한국 시간 기준 오늘의 시작/끝 시점 계산
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstNow = new Date(now.getTime() + kstOffset);
  const startOfDay = new Date(kstNow.setUTCHours(0, 0, 0, 0) - kstOffset).toISOString();
  const endOfDay = new Date(kstNow.setUTCHours(23, 59, 59, 999) - kstOffset).toISOString();

  // 1. 관원 및 관련 데이터 조회 (profiles 테이블에 deleted_at이 있을 수 있으므로 필터링)
  const { data: members, error: membersError } = await supabase
    .from("profiles")
    .select(`
      id,
      name,
      rank_name,
      rank_level,
      default_session_time,
      attendance_logs(id, attended_at),
      user_progress(id, item_id),
      payments(id, status)
    `)
    .eq("dojo_id", dojoId)
    .eq("role", "member")
    .is("deleted_at", null)
    .order("default_session_time", { ascending: true })
    .order("name", { ascending: true });

  if (membersError) throw membersError;

  // 2. 해당 도장의 전체 커리큘럼 조회
  const { data: curriculum, error: curriculumError } = await supabase
    .from("curriculum_items")
    .select("*")
    .eq("dojo_id", dojoId)
    .order("order_index", { ascending: true });

  if (curriculumError) throw curriculumError;

  // 3. 데이터 가공
  const processedMembers = members.map((member: any) => {
    // 오늘 출석 여부 (KST 날짜 범위 내 로그가 있는지 확인)
    const isAttendedToday = member.attendance_logs?.some((log: any) => 
      log.attended_at >= startOfDay && log.attended_at <= endOfDay
    );

    // 진도 계산 (급수 제한 없음)
    const completedItemIds = new Set(member.user_progress?.map((p: any) => p.item_id));
    const currentTechnique = curriculum?.find(item => !completedItemIds.has(item.id));

    let techniqueTitle = "커리큘럼 완료";
    if (!curriculum || curriculum.length === 0) {
      techniqueTitle = "기술 데이터 없음";
    } else if (currentTechnique) {
      techniqueTitle = currentTechnique.title;
    }

    const unpaidMonthsCount = member.payments?.filter((p: any) => p.status === "unpaid").length || 0;

    return {
      id: member.id,
      name: member.name,
      rank_name: member.rank_name,
      rank_level: member.rank_level,
      default_session_time: member.default_session_time || "미배정",
      isAttendedToday,
      currentTechnique: techniqueTitle,
      currentTechniqueId: currentTechnique?.id,
      unpaidMonthsCount,
    };
  });

  return { members: processedMembers, dojoId };
}

/**
 * 출석 토글 액션 (해제 기능 강화)
 */
export async function toggleAttendance(formData: { userId: string, dojoId: string }) {
  const supabase = await createClient();
  
  // 권한 확인: 현재 사용자가 도장 관리자인지 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("인증되지 않은 사용자입니다.");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("dojo_id, role")
    .eq("user_id", user.id)
    .single();

  if (!myProfile || (myProfile.role !== "owner" && myProfile.role !== "instructor")) {
    throw new Error("접근 권한이 없습니다.");
  }

  // 대상 관원의 정보 및 도장 ID 확인 (서버 데이터 우선)
  const { data: memberProfile } = await supabase
    .from("profiles")
    .select("dojo_id")
    .eq("id", formData.userId)
    .single();

  if (!memberProfile) throw new Error("관원 정보를 찾을 수 없습니다.");
  
  // 관리자와 관원의 도장이 일치하는지 확인 (보안 강화)
  if (memberProfile.dojo_id !== myProfile.dojo_id) {
    throw new Error("해당 관원에 대한 권한이 없습니다.");
  }

  const validated = attendanceToggleSchema.parse({
    userId: formData.userId,
    dojoId: memberProfile.dojo_id,
  });
  
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstNow = new Date(now.getTime() + kstOffset);
  const startOfDay = new Date(kstNow.setUTCHours(0, 0, 0, 0) - kstOffset).toISOString();
  const endOfDay = new Date(kstNow.setUTCHours(23, 59, 59, 999) - kstOffset).toISOString();

  // 오늘 날짜의 출석 로그가 있는지 조회
  const { data: existingLogs } = await supabase
    .from("attendance_logs")
    .select("id")
    .eq("user_id", validated.userId)
    .gte("attended_at", startOfDay)
    .lte("attended_at", endOfDay);

  if (existingLogs && existingLogs.length > 0) {
    // 이미 있으면 해당 날짜의 모든 로그 삭제 (해제)
    const idsToDelete = existingLogs.map(log => log.id);
    await supabase
      .from("attendance_logs")
      .delete()
      .in("id", idsToDelete);
  } else {
    // 없으면 추가
    await supabase
      .from("attendance_logs")
      .insert({
        user_id: validated.userId,
        dojo_id: validated.dojoId,
        attended_at: new Date().toISOString() // 현재 시간을 UTC로 저장
      });
  }

  // 대시보드 및 수련 관리 페이지 모두 갱신
  revalidatePath("/", "layout");
}

/**
 * 기술 통과 처리 액션
 */
export async function passTechnique(formData: { userId: string, itemId: string }) {
  const validated = techniquePassSchema.parse(formData);
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("user_progress")
    .select("id")
    .eq("user_id", validated.userId)
    .eq("item_id", validated.itemId)
    .maybeSingle();

  if (existing) {
    await supabase.from("user_progress").delete().eq("id", existing.id);
  } else {
    await supabase.from("user_progress").insert({
      user_id: validated.userId,
      item_id: validated.itemId,
    });
  }

  revalidatePath("/", "layout");
}

/**
 * 승급 심사 알림 전송 액션
 */
export async function sendPromotionNotification(formData: { month: string, dojoId: string }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("인증이 필요합니다.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, dojo_id, role")
    .eq("user_id", user.id)
    .single();

  if (!profile || (profile.role !== "owner" && profile.role !== "instructor")) {
    throw new Error("접근 권한이 없습니다.");
  }

  // 요청된 dojoId가 자신의 도장인지 확인 (보안)
  if (profile.dojo_id !== formData.dojoId) {
    throw new Error("해당 도장에 대한 권한이 없습니다.");
  }

  const validated = promotionNotificationSchema.parse({
    month: formData.month,
    dojoId: profile.dojo_id,
  });

  await supabase.from("notices").insert({
    dojo_id: validated.dojoId,
    author_id: profile.id,
    title: `[공지] ${validated.month}월 승급 심사 일정 안내`,
    content: `${validated.month}월 승급 심사가 진행될 예정입니다. 수련생 여러분은 준비에 만전을 기해 주시기 바랍니다.`,
  });

  revalidatePath("/", "layout");
}