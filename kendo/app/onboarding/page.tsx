import Link from "next/link";
import { ChevronRight, Home, Users } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
  // 이미 프로필이 있다면 홈으로 리다이렉트
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (profiles && profiles.length > 0) {
    redirect("/");
  }
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-gray-900">환영합니다!</h1>
        <p className="text-gray-600 mt-2">
          계정 설정이 완료되었습니다. 다음 단계를 선택해주세요.
        </p>
      </div>

      <div className="space-y-4">
        <Link
          href="/onboarding/create-dojo"
          className="flex items-center p-6 border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group"
        >
          <div className="bg-blue-100 p-3 rounded-lg mr-4 group-hover:bg-blue-200">
            <Home className="text-blue-600 w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">도장 개설하기</h2>
            <p className="text-sm text-gray-500">관장님이라면 새로운 도장을 만들고 관리하세요.</p>
          </div>
          <ChevronRight className="text-gray-400" />
        </Link>

        <Link
          href="/onboarding/join-dojo"
          className="flex items-center p-6 border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group"
        >
          <div className="bg-green-100 p-3 rounded-lg mr-4 group-hover:bg-green-200">
            <Users className="text-green-600 w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">기존 도장 가입하기</h2>
            <p className="text-sm text-gray-500">관원 또는 사범으로 등록하고 활동하세요.</p>
          </div>
          <ChevronRight className="text-gray-400" />
        </Link>

        <Link
          href="/onboarding/start-guardian"
          className="flex items-center p-6 border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group"
        >
          <div className="bg-purple-100 p-3 rounded-lg mr-4 group-hover:bg-purple-200">
            <Users className="text-purple-600 w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">학부모로 시작하기</h2>
            <p className="text-sm text-gray-500">자녀의 프로필을 생성하고 도장과 연결하세요.</p>
          </div>
          <ChevronRight className="text-gray-400" />
        </Link>
      </div>
    </div>
  );
}
