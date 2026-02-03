"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { createDojoSchema, joinDojoSchema, guardianProfileSchema } from "@/lib/validations/onboarding";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sanitizePhoneNumber } from "@/lib/utils/phone";
import { getUserId } from "@/lib/utils/auth";

export async function createDojo(formData: z.infer<typeof createDojoSchema>) {
  const supabase = await createClient();
  const userId = await getUserId();

  if (!userId) {
    return { error: "인증되지 않은 사용자입니다." };
  }

  // Validate form data
  const validatedFields = createDojoSchema.safeParse(formData);
  if (!validatedFields.success) {
    return { error: "입력값이 올바르지 않습니다." };
  }

  const { name, ownerName, phone: rawPhone } = validatedFields.data;
  const phone = sanitizePhoneNumber(rawPhone);

  // 1. 이미 프로필이 존재하는지 체크 (1인 1도장 정책)
  const { data: profiles, error: profileCheckError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .is("deleted_at", null);

  if (profileCheckError) {
    console.error("Profile check error:", profileCheckError);
    return { error: "내 정보를 확인하는 중 오류가 발생했습니다." };
  }

  if (profiles && profiles.length > 0) {
    return { error: "이미 소속된 도장이 있습니다." };
  }

  // 2. 기존 가입 신청 자동 삭제 (FR-002)
  await supabase
    .from("signup_requests")
    .delete()
    .eq("user_id", userId);

  // 3. 도장 생성
  const { data: dojo, error: dojoError } = await supabase
    .from("dojos")
    .insert({
      name,
      owner_id: userId,
    })
    .select()
    .single();

  if (dojoError) {
    if (dojoError.message.includes("unique constraint") || dojoError.code === "23505") {
        return { error: "이미 존재하는 도장 이름입니다." };
    }
    return { error: "도장 생성 중 오류가 발생했습니다: " + dojoError.message };
  }

  // 4. 관장 프로필 생성
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      user_id: userId,
      dojo_id: dojo.id,
      role: "owner",
      name: ownerName,
      phone,
      is_adult: true,
    });

  if (profileError) {
    return { error: "프로필 생성 중 오류가 발생했습니다: " + profileError.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function createGuardianProfile(formData: z.infer<typeof guardianProfileSchema>) {
  const supabase = await createClient();
  const userId = await getUserId();

  if (!userId) {
    return { error: "인증되지 않은 사용자입니다." };
  }

  const validatedFields = guardianProfileSchema.safeParse(formData);
  if (!validatedFields.success) {
    return { error: "입력값이 올바르지 않습니다." };
  }

  const { name, phone: rawPhone } = validatedFields.data;
  const phone = sanitizePhoneNumber(rawPhone);

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      user_id: userId,
      role: "guardian",
      name,
      phone,
      is_adult: true,
    });

  if (profileError) {
    return { error: "프로필 생성 중 오류가 발생했습니다: " + profileError.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function searchDojos(query: string) {
  const supabase = await createClient();
  
  if (!query || query.length < 2) return [];

  const { data, error } = await supabase
    .from("dojos")
    .select("id, name, owner_id, profiles!inner(name)")
    .ilike("name", `%${query}%`)
    .eq("profiles.role", "owner")
    .limit(10);

  if (error) {
    console.error("Search error:", error);
    return [];
  }

  return data.map(dojo => ({
    id: dojo.id,
    name: dojo.name,
    ownerName: (dojo.profiles as unknown as { name: string }[])[0]?.name || "관장 미지정"
  }));
}

export async function submitSignupRequest(dojoId: string, formData: z.infer<typeof joinDojoSchema>) {
    const supabase = await createClient();
    const userId = await getUserId();
  
    if (!userId) {
      return { error: "인증되지 않은 사용자입니다." };
    }

    const validatedFields = joinDojoSchema.safeParse(formData);
    if (!validatedFields.success) {
      return { error: "입력값이 올바르지 않습니다." };
    }

    const { name, phone: rawPhone, isAdult, guardianPhone: rawGuardianPhone } = validatedFields.data;
    const phone = sanitizePhoneNumber(rawPhone);
    const guardianPhone = rawGuardianPhone ? sanitizePhoneNumber(rawGuardianPhone) : null;

    // 1. 이미 소속된 도장이 있는지 확인
    const { data: profiles, error: profileCheckError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .is("deleted_at", null);

    if (profileCheckError) {
      console.error("Profile check error:", profileCheckError);
      return { error: "내 정보를 확인하는 중 오류가 발생했습니다." };
    }

    if (profiles && profiles.length > 0) {
      return { error: "이미 소속된 도장이 있습니다." };
    }

    // 2. 이미 대기 중인 신청이 있는지 확인
    const { data: pendingRequests } = await supabase
      .from("signup_requests")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "pending");

    if (pendingRequests && pendingRequests.length > 0) {
      return { error: "이미 처리 중인 가입 신청이 있습니다." };
    }

    // 3. 신청서 제출
    const { error } = await supabase
      .from("signup_requests")
      .insert({
        dojo_id: dojoId,
        user_id: userId,
        name,
        phone,
        is_adult: isAdult,
        guardian_phone: guardianPhone,
      });

    if (error) {
      return { error: "가입 신청 중 오류가 발생했습니다: " + error.message };
    }

    revalidatePath("/onboarding/status", "page");
    redirect("/onboarding/status");
}

export async function cancelSignupRequest() {
  const supabase = await createClient();
  const userId = await getUserId();

  if (!userId) {
    return { error: "인증되지 않은 사용자입니다." };
  }

  const { error } = await supabase
    .from("signup_requests")
    .delete()
    .eq("user_id", userId)
    .eq("status", "pending");

  if (error) {
    return { error: "신청 취소 중 오류가 발생했습니다." };
  }

  revalidatePath("/onboarding", "layout");
  redirect("/onboarding");
}

export async function deleteAccount() {
  const supabase = await createClient();
  const userId = await getUserId();

  if (!userId) return { error: "인증되지 않았습니다." };

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, dojo_id, role")
    .eq("user_id", userId)
    .is("deleted_at", null);

  const profile = profiles?.find(p => p.role === 'owner') || profiles?.[0];

  if (profile?.role === 'owner') {
      const { error } = await supabase
        .from("dojos")
        .delete()
        .eq("id", profile.dojo_id || "");
      
      if (error) return { error: "계정 삭제 중 오류가 발생했습니다." };
  } else if (profile) {
      await supabase
        .from("profiles")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", profile.id);
  }

  // Note: auth.users deletion usually requires service_role or a custom function
  // We focus on cleaning up the application data (Tenant data)

  revalidatePath("/", "layout");
  redirect("/login");
}
