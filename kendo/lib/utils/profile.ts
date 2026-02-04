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

  // Fetch profiles: 1. Owned by user, 2. Linked via profile_guardians
  const [{ data: ownedProfiles }, { data: linkedProfilesData }, cookieStore] = await Promise.all([
    supabase
      .from("profiles")
      .select("*, dojos(name)")
      .eq("user_id", user.id)
      .is("deleted_at", null),
    supabase
      .from("profile_guardians")
      .select("profile_id")
      .eq("guardian_id", user.id),
    cookies()
  ]);

  let allProfiles = ownedProfiles || [];

  if (linkedProfilesData && linkedProfilesData.length > 0) {
    const linkedIds = linkedProfilesData.map(lp => lp.profile_id);
    const { data: linkedProfiles } = await supabase
      .from("profiles")
      .select("*, dojos(name)")
      .in("id", linkedIds)
      .is("deleted_at", null);
    
    if (linkedProfiles) {
      // Avoid duplicates
      const ownedIds = new Set(allProfiles.map(p => p.id));
      const uniqueLinked = linkedProfiles.filter(p => !ownedIds.has(p.id));
      allProfiles = [...allProfiles, ...uniqueLinked];
    }
  }

  const userProfile = allProfiles?.find(p => p.user_id === user.id);
  const hasLinkedProfiles = (linkedProfilesData && linkedProfilesData.length > 0) || (allProfiles?.some(p => p.owner_id === user.id && p.user_id !== user.id) ?? false);
  const isGuardian = userProfile?.role === 'guardian' || hasLinkedProfiles;

  let activeProfileId = cookieStore.get('active_profile_id')?.value;

  if (!activeProfileId) {
    const ownerProfile = allProfiles?.find(p => p.user_id === user.id); // Default to the user's primary profile
    if (ownerProfile) {
      activeProfileId = ownerProfile.id;
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
