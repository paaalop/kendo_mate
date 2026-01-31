"use server";

import { createClient } from "@/utils/supabase/server";
import { createDojoSchema, joinDojoSchema } from "@/lib/validations/onboarding";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sanitizePhoneNumber } from "@/lib/utils/phone";

export async function createDojo(formData: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
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
  const { data: existingProfile, error: profileCheckError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (profileCheckError) {
    console.error("Profile check error:", profileCheckError);
    return { error: "내 정보를 확인하는 중 오류가 발생했습니다." };
  }

  if (existingProfile) {
    return { error: "이미 소속된 도장이 있습니다." };
  }

  // 2. 기존 가입 신청 자동 삭제 (FR-002)
  await supabase
    .from("signup_requests")
    .delete()
    .eq("user_id", user.id);

  // 3. 도장 생성
  const { data: dojo, error: dojoError } = await supabase
    .from("dojos")
    .insert({
      name,
      owner_id: user.id,
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
      user_id: user.id,
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
    ownerName: (dojo.profiles as any)[0]?.name || "관장 미지정"
  }));
}

export async function submitSignupRequest(dojoId: string, formData: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) {
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
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (profileCheckError) {
      console.error("Profile check error:", profileCheckError);
      return { error: "내 정보를 확인하는 중 오류가 발생했습니다." };
    }

    if (existingProfile) {
      return { error: "이미 소속된 도장이 있습니다." };
    }

    // 2. 이미 대기 중인 신청이 있는지 확인
    const { data: existingRequest } = await supabase
      .from("signup_requests")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .maybeSingle();

    if (existingRequest) {
      return { error: "이미 처리 중인 가입 신청이 있습니다." };
    }

    // 3. 신청서 제출
    const { error } = await supabase
      .from("signup_requests")
      .insert({
        dojo_id: dojoId,
        user_id: user.id,
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
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증되지 않은 사용자입니다." };
  }

  const { error } = await supabase
    .from("signup_requests")
    .delete()
    .eq("user_id", user.id)
    .eq("status", "pending");

  if (error) {
    return { error: "신청 취소 중 오류가 발생했습니다." };
  }

  revalidatePath("/onboarding", "layout");
  redirect("/onboarding");
}

export async function deleteAccount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "인증되지 않았습니다." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("dojo_id, role")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (profile?.role === 'owner') {
      const { error } = await supabase
        .from("dojos")
        .delete()
        .eq("id", profile.dojo_id);
      
      if (error) return { error: "계정 삭제 중 오류가 발생했습니다." };
  } else if (profile) {
      await supabase
        .from("profiles")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", (profile as any).id);
  }

  // Note: auth.users deletion usually requires service_role or a custom function
  // We focus on cleaning up the application data (Tenant data)

  revalidatePath("/", "layout");
  redirect("/login");
}
