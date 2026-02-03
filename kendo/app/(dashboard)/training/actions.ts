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

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, dojo_id, role")
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (profileError) {
    console.error('Profile Fetch Error:', profileError);
    throw new Error(`프로필 조회 중 오류: ${profileError.message}`);
  }

  // 관리자 권한이 있는 프로필 우선 선택
  const profile = profiles?.find(p => ["owner", "instructor"].includes(p.role || "")) || profiles?.[0];

  // 서버 로그 출력
  console.log('--- Training Access Debug ---');
  console.log('User ID:', user.id);
  console.log('Total Profiles found:', profiles?.length || 0);
  if (profile) {
    console.log('Selected Role:', profile.role);
    console.log('Selected Dojo ID:', profile.dojo_id);
  }
  console.log('-----------------------------');

  if (!profile) {
    throw new Error("도장 관리자 프로필을 찾을 수 없습니다. 도장에 먼저 가입 승인이 되었는지 확인해주세요.");
  }

  const allowedRoles = ["owner", "instructor"];
  if (!allowedRoles.includes(profile.role || "")) {
    throw new Error(`접근 권한이 없습니다. (현재 역할: ${profile.role || '없음'})`);
  }

  if (!profile.dojo_id) {
    throw new Error("소속된 도장이 없습니다. 도장 관리자에게 문의하세요.");
  }

  const dojoId = profile.dojo_id;
  
  // 한국 시간 기준 오늘의 시작/끝 시점 계산
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  
  // Create a new Date object for KST calculations
  const kstDate = new Date(now.getTime() + kstOffset);
  
  // Set to midnight KST
  const kstMidnight = new Date(kstDate);
  kstMidnight.setUTCHours(0, 0, 0, 0);
  
  // Convert back to UTC ISO string for DB query
  const startOfDay = new Date(kstMidnight.getTime() - kstOffset).toISOString();
  
  // Set to end of day KST
  const kstEndOfDay = new Date(kstDate);
  kstEndOfDay.setUTCHours(23, 59, 59, 999);
  
  // Convert back to UTC ISO string
  const endOfDay = new Date(kstEndOfDay.getTime() - kstOffset).toISOString();

  // 1 & 2. 관원 및 커리큘럼 데이터 병렬 조회
  console.log('Fetching members and curriculum for Dojo:', dojoId);
  
  const [membersResult, curriculumResult] = await Promise.all([
    supabase
      .from("profiles")
      .select(`
        id,
        name,
        phone,
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
      .order("name", { ascending: true }),
    
    supabase
      .from("curriculum_items")
      .select("*")
      .eq("dojo_id", dojoId)
      .order("order_index", { ascending: true })
  ]);

  const { data: members, error: membersError } = membersResult;
  const { data: curriculum, error: curriculumError } = curriculumResult;

  if (membersError) {
    console.error('Members Fetch Error:', membersError);
    throw new Error(`관원 목록 조회 실패: ${membersError.message}`);
  }

  if (curriculumError) {
    console.error('Curriculum Fetch Error:', curriculumError);
    throw new Error(`커리큘럼 조회 실패: ${curriculumError.message}`);
  }

  // 3. 데이터 가공
  const processedMembers = (members || []).map((member) => {
    const isAttendedToday = (member.attendance_logs as unknown as { attended_at: string }[])?.some((log) => 
      log.attended_at >= startOfDay && log.attended_at <= endOfDay
    );

    const completedItemIds = new Set((member.user_progress as unknown as { item_id: string }[])?.map((p) => p.item_id));
    const currentTechnique = curriculum?.find(item => !completedItemIds.has(item.id));

    let techniqueTitle = "커리큘럼 완료";
    if (!curriculum || curriculum.length === 0) {
      techniqueTitle = "기술 데이터 없음";
    } else if (currentTechnique) {
      techniqueTitle = currentTechnique.title;
    }

    const unpaidMonthsCount = (member.payments as unknown as { status: string }[])?.filter((p) => p.status === "unpaid").length || 0;

    return {
      id: member.id,
      name: member.name,
      phone: member.phone,
      rank_name: member.rank_name,
      rank_level: member.rank_level,
      default_session_time: member.default_session_time || "미배정",
      isAttendedToday,
      currentTechnique: techniqueTitle,
      currentTechniqueId: currentTechnique?.id,
      unpaidMonthsCount,
    };
  });

  console.log(`Successfully processed ${processedMembers.length} members.`);
  return { members: processedMembers, dojoId };
}

/**
 * 출석 토글 액션
 */
export async function toggleAttendance(formData: { userId: string, dojoId: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("인증되지 않은 사용자입니다.");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("dojo_id, role")
    .eq("user_id", user.id)
    .is("deleted_at", null);

  const myProfile = profiles?.find(p => ["owner", "instructor"].includes(p.role || "")) || profiles?.[0];

  if (!myProfile || !["owner", "instructor"].includes(myProfile.role || "")) {
    throw new Error("출석 체크 권한이 없습니다.");
  }

  const { data: memberProfile } = await supabase
    .from("profiles")
    .select("dojo_id")
    .eq("id", formData.userId)
    .single();

  if (!memberProfile || memberProfile.dojo_id !== myProfile.dojo_id) {
    throw new Error("해당 관원에 대한 권한이 없습니다.");
  }

  const validated = attendanceToggleSchema.parse({
    userId: formData.userId,
    dojoId: memberProfile.dojo_id,
  });
  
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  
  const kstDate = new Date(now.getTime() + kstOffset);
  
  const kstMidnight = new Date(kstDate);
  kstMidnight.setUTCHours(0, 0, 0, 0);
  const startOfDay = new Date(kstMidnight.getTime() - kstOffset).toISOString();
  
  const kstEndOfDay = new Date(kstDate);
  kstEndOfDay.setUTCHours(23, 59, 59, 999);
  const endOfDay = new Date(kstEndOfDay.getTime() - kstOffset).toISOString();

  const { data: existingLogs } = await supabase
    .from("attendance_logs")
    .select("id")
    .eq("user_id", validated.userId)
    .gte("attended_at", startOfDay)
    .lte("attended_at", endOfDay);

  if (existingLogs && existingLogs.length > 0) {
    await supabase.from("attendance_logs").delete().in("id", existingLogs.map(l => l.id));
  } else {
    await supabase.from("attendance_logs").insert({
      user_id: validated.userId,
      dojo_id: validated.dojoId,
      attended_at: new Date().toISOString()
    });
  }

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

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, dojo_id, role")
    .eq("user_id", user.id)
    .is("deleted_at", null);

  const profile = profiles?.find(p => ["owner", "instructor"].includes(p.role || "")) || profiles?.[0];

  if (!profile || !["owner", "instructor"].includes(profile.role || "")) {
    throw new Error("공지 권한이 없습니다.");
  }

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
