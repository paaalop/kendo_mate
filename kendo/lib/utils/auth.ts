import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

/**
 * 인증된 사용자의 ID를 가져옵니다. 
 * 미들웨어에서 주입한 x-user-id 헤더를 우선적으로 확인하여 성능을 최적화합니다.
 */
export async function getUserId() {
  const headersList = await headers();
  const userIdFromHeader = headersList.get("x-user-id");

  if (userIdFromHeader) {
    return userIdFromHeader;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

export async function checkOwnerRole() {
  const userId = await getUserId();

  if (!userId) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (!profile || profile.role !== "owner") {
    redirect("/");
  }
}
