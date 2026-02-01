import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, ClipboardList, LogOut, CreditCard, Settings } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*, dojos(name)")
    .eq("user_id", user.id)
    .is("deleted_at", null);

  // 관리자 권한이 있는 프로필 우선 선택
  const profile = profiles?.find(p => ['owner', 'instructor'].includes(p.role || '')) || profiles?.[0];

  if (!profile || !profile.dojo_id) {
    // 도장 프로필이 없는 경우 가입 신청 내역 확인
    const { data: signupRequests } = await supabase
      .from('signup_requests')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('status', 'pending');

    if (signupRequests && signupRequests.length > 0) {
      redirect("/onboarding/status");
    }
    
    redirect("/onboarding");
  }

  const dojoName = (profile.dojos as unknown as { name: string })?.name || "내 도장";
  const isStaff = profile.role === 'owner' || profile.role === 'instructor';
  const isOwner = profile.role === 'owner';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-blue-600">{dojoName}</h1>
          <p className="text-xs text-gray-500 mt-1">{profile.name} ({profile.role === 'owner' ? '관장' : profile.role === 'instructor' ? '사범' : '관원'})</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/" className="flex items-center p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition group">
            <LayoutDashboard className="w-5 h-5 mr-3" />
            <span>대시보드</span>
          </Link>
          {isStaff && (
            <>
              <Link href="/members" className="flex items-center p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition">
                <Users className="w-5 h-5 mr-3" />
                <span>관원 관리</span>
              </Link>
              <Link href="/training" className="flex items-center p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition">
                <ClipboardList className="w-5 h-5 mr-3" />
                <span>수련 관리</span>
              </Link>
            </>
          )}
          {isOwner && (
            <>
              <Link href="/payments" className="flex items-center p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition">
                <CreditCard className="w-5 h-5 mr-3" />
                <span>회비 관리</span>
              </Link>
              <Link href="/settings" className="flex items-center p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition">
                <Settings className="w-5 h-5 mr-3" />
                <span>도장 설정</span>
              </Link>
            </>
          )}
        </nav>
        <div className="p-4 border-t">
          <form action="/api/auth/signout" method="post">
            <button className="flex items-center w-full p-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition">
              <LogOut className="w-5 h-5 mr-3" />
              <span>로그아웃</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b p-4 flex justify-between items-center">
          <h1 className="font-bold text-blue-600">{dojoName}</h1>
          <form action="/api/auth/signout" method="post">
            <button className="p-2 text-gray-600">
              <LogOut className="w-6 h-6" />
            </button>
          </form>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>

        {/* Mobile Nav */}
        <nav className="md:hidden bg-white border-t flex justify-around p-2">
            <Link href="/" className="flex flex-col items-center p-2 text-gray-500">
                <LayoutDashboard className="w-6 h-6" />
                <span className="text-[10px] mt-1">홈</span>
            </Link>
            {isStaff ? (
              <>
                <Link href="/members" className="flex flex-col items-center p-2 text-gray-500">
                    <Users className="w-6 h-6" />
                    <span className="text-[10px] mt-1">관원</span>
                </Link>
                <Link href="/training" className="flex flex-col items-center p-2 text-gray-500">
                    <ClipboardList className="w-6 h-6" />
                    <span className="text-[10px] mt-1">수련</span>
                </Link>
                {isOwner && (
                  <>
                    <Link href="/payments" className="flex flex-col items-center p-2 text-gray-500">
                        <CreditCard className="w-6 h-6" />
                        <span className="text-[10px] mt-1">회비</span>
                    </Link>
                    <Link href="/settings" className="flex flex-col items-center p-2 text-gray-500">
                        <Settings className="w-6 h-6" />
                        <span className="text-[10px] mt-1">설정</span>
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Link href="/curriculum" className="flex flex-col items-center p-2 text-gray-500">
                    <ClipboardList className="w-6 h-6" />
                    <span className="text-[10px] mt-1">진도</span>
                </Link>
                <Link href="/community" className="flex flex-col items-center p-2 text-gray-500">
                    <Users className="w-6 h-6" />
                    <span className="text-[10px] mt-1">커뮤니티</span>
                </Link>
              </>
            )}
        </nav>
      </main>
    </div>
  );
}
