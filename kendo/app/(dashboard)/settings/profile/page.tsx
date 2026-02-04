import { createClient } from "@/utils/supabase/server";
import { getUserId } from "@/lib/utils/auth";
import { UserProfileForm } from "@/components/settings/user-profile-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProfileSettingsPage() {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, phone")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      <header className="flex items-center gap-4">
        <Link 
          href="/" 
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 border border-gray-100 hover:text-gray-600 shadow-sm"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">내 프로필 설정</h1>
      </header>

      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
        <p className="text-sm text-blue-700 font-medium">
          보호자 계정의 연락처가 도장에 등록된 보호자 연락처와 일치해야 자녀를 찾을 수 있습니다.
        </p>
      </div>
      
      <UserProfileForm 
        initialData={{ 
          name: profile?.name || "", 
          phone: profile?.phone || "" 
        }} 
      />
    </div>
  );
}
