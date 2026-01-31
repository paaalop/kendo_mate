import { createClient } from "@/utils/supabase/server";
import { SignupRequestsList } from "@/components/dashboard/signup-requests-list";
import { MembersList } from "@/components/dashboard/members-list";
import { redirect } from "next/navigation";
import { UserPlus, Users } from "lucide-react";

export default async function MembersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, dojo_id")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (!profile || (profile.role !== 'owner' && profile.role !== 'instructor')) {
    return (
        <div className="text-center py-20">
            <p className="text-gray-500">권한이 없습니다. 관장님 또는 사범님만 접근 가능합니다.</p>
        </div>
    );
  }

  // 대기 중인 신청 목록 (FIFO 정렬)
  const { data: requests } = await supabase
    .from("signup_requests")
    .select("*")
    .eq("dojo_id", profile.dojo_id)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  // 전체 관원 목록
  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .eq("dojo_id", profile.dojo_id)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  return (
    <div className="space-y-10 pb-20">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">관원 관리</h1>
        <p className="text-gray-600">가입 신청 승인 및 관원 명단을 관리합니다.</p>
      </header>

      {/* 가입 신청 섹션 */}
      <section className="space-y-4">
        <div className="flex items-center text-orange-600 font-semibold">
          <UserPlus className="w-5 h-5 mr-2" />
          <h2>가입 신청 대기 ({requests?.length || 0})</h2>
        </div>
        <SignupRequestsList requests={requests || []} />
      </section>

      {/* 관원 명단 섹션 */}
      <section className="space-y-4">
        <div className="flex items-center text-blue-600 font-semibold">
          <Users className="w-5 h-5 mr-2" />
          <h2>전체 관원 명단 ({members?.length || 0})</h2>
        </div>
        
        {/* 클라이언트 사이드 필터링은 MembersList 내부에 구현하거나 
            여기서 래퍼 컴포넌트를 만들 수 있지만, 
            MVP에서는 단순 리스트 표시 후 필요시 확장합니다. */}
        <MembersList 
            members={members || []} 
            currentUserId={user.id} 
            currentUserRole={profile.role} 
        />
      </section>
    </div>
  );
}
