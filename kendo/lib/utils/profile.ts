import { cookies } from "next/headers";
import { cache } from "react";
import { createClient } from "@/utils/supabase/server";

export const getActiveProfileContext = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("*, dojos(name)")
    .or(`user_id.eq.${user.id},owner_id.eq.${user.id}`)
    .is("deleted_at", null);

  const userProfile = allProfiles?.find(p => p.user_id === user.id);
  const isGuardian = userProfile?.role === 'guardian' || (allProfiles?.some(p => p.owner_id === user.id && p.user_id !== user.id) ?? false);

  const cookieStore = await cookies();
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
