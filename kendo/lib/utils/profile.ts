import { cookies, headers } from "next/headers";
import { cache } from "react";
import { createClient } from "@/utils/supabase/server";

export const getActiveProfileContext = cache(async () => {
  const supabase = await createClient();
  
  // Optimize: Check for User ID in headers injected by middleware
  const headersList = await headers();
  const userIdFromHeader = headersList.get('x-user-id');
  
  let user: { id: string } | null = null;
  
  if (userIdFromHeader) {
    user = { id: userIdFromHeader };
  } else {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  if (!user) return null;

  // 병렬로 프로필과 쿠키 확인 (쿠키는 이미 가져왔으므로 순차적이어도 무방하나 프로필 쿼리는 필수)
  const [{ data: allProfiles }, cookieStore] = await Promise.all([
    supabase
      .from("profiles")
      .select("*, dojos(name)")
      .or(`user_id.eq.${user.id},owner_id.eq.${user.id}`)
      .is("deleted_at", null),
    cookies()
  ]);

  const userProfile = allProfiles?.find(p => p.user_id === user.id);
  const isGuardian = userProfile?.role === 'guardian' || (allProfiles?.some(p => p.owner_id === user.id && p.user_id !== user.id) ?? false);

  let activeProfileId = cookieStore.get('active_profile_id')?.value;

  if (!activeProfileId) {
    const ownerProfile = allProfiles?.find(p => p.owner_id === null);
    if (ownerProfile) {
      activeProfileId = ownerProfile.id;
    } else if (isGuardian) {
      activeProfileId = 'guardian_summary';
    } else if (allProfiles && allProfiles.length > 0) {
      activeProfileId = allProfiles[0].id;
    }
  }

  return {
    user,
    allProfiles: allProfiles || [],
    activeProfileId,
    isGuardian,
  };
});

/**
 * 액션 등에서 현재 스태프 권한이 있는 프로필을 빠르게 가져오기 위한 헬퍼
 */
export async function getActiveStaffProfile() {
  const context = await getActiveProfileContext();
  if (!context) return null;

  const activeProfile = context.allProfiles.find(p => p.id === context.activeProfileId);
  if (activeProfile && ['owner', 'instructor'].includes(activeProfile.role || '')) {
    return activeProfile;
  }

  // 만약 현재 활성 프로필이 스태프가 아니더라도, 스태프 권한이 있는 다른 프로필이 있는지 확인
  return context.allProfiles.find(p => ['owner', 'instructor'].includes(p.role || '')) || null;
}
