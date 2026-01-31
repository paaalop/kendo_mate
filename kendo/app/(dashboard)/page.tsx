import { createClient } from "@/utils/supabase/server";
import { SignupRequestsList } from "@/components/dashboard/signup-requests-list";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*, dojos(name)")
    .eq("user_id", user?.id || "")
    .is("deleted_at", null);

  // 관리자 권한(owner, instructor)이 있는 프로필을 우선 선택
  const profile = profiles?.find(p => ['owner', 'instructor'].includes(p.role || '')) || profiles?.[0];

  if (!profile) return null;

  const isStaff = profile.role === 'owner' || profile.role === 'instructor';
  const dojoId = profile.dojo_id;

  // 한국 시간 기준 오늘의 시작/끝 시점 계산
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstNow = new Date(now.getTime() + kstOffset);
  const startOfDay = new Date(kstNow.setUTCHours(0, 0, 0, 0) - kstOffset).toISOString();
  const endOfDay = new Date(kstNow.setUTCHours(23, 59, 59, 999) - kstOffset).toISOString();

  // 이번 달의 시작 시점 계산 (KST 기준)
  const startOfMonth = new Date(kstNow.setUTCFullYear(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), 1));
  startOfMonth.setUTCHours(0, 0, 0, 0);
  const startOfMonthISO = new Date(startOfMonth.getTime() - kstOffset).toISOString();

  let todayAttendanceCount = 0;
  let monthlyAttendanceCount = 0;
  let pendingRequestsCount = 0;

  if (isStaff) {
    // 1. 오늘 출석한 고유 관원 수 조회 (활성 관원만 포함)
    const { data: todayAttendance } = await supabase
      .from("attendance_logs")
      .select(`
        user_id,
        profiles!inner(deleted_at)
      `)
      .eq("dojo_id", dojoId || "")
      .is("profiles.deleted_at", null)
      .gte("attended_at", startOfDay)
      .lte("attended_at", endOfDay);
    
    // 중복 제거 (다른 시간에 출석했어도 1명으로 카운트)
    const uniqueAttendees = new Set(todayAttendance?.map(a => a.user_id));
    todayAttendanceCount = uniqueAttendees.size;

    // 2. 대기 중인 가입 신청 수
    const { count: pendingCount } = await supabase
      .from("signup_requests")
      .select("*", { count: "exact", head: true })
      .eq("dojo_id", dojoId || "")
      .eq("status", "pending");
    pendingRequestsCount = pendingCount || 0;
  } else {
    // 관원용: 이번 달 내 출석 횟수
    const { count: monthlyCount } = await supabase
      .from("attendance_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .gte("attended_at", startOfMonthISO);
    monthlyAttendanceCount = monthlyCount || 0;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">환영합니다, {profile?.name}님!</h1>
        <p className="text-gray-600">{profile?.dojos?.name} {isStaff ? '관리자 대시보드' : '수련 대시보드'}입니다.</p>
      </header>

      {isStaff ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500">오늘 출석</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{todayAttendanceCount}명</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500">대기 중인 신청</h3>
              <p className="text-3xl font-bold text-orange-600 mt-2">{pendingRequestsCount}명</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500">이번 달 수납</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">0원</p>
            </div>
          </div>

          <SignupRequestsList />

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[300px] flex flex-col items-center justify-center text-center">
            {todayAttendanceCount > 0 ? (
                <div className="w-full text-left">
                    <h3 className="font-semibold text-gray-900 mb-4">최근 활동</h3>
                    <p className="text-sm text-gray-600">오늘 {todayAttendanceCount}명의 관원이 수련을 마쳤습니다.</p>
                </div>
            ) : (
                <>
                    <div className="bg-gray-50 p-4 rounded-full mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                    <p className="text-gray-500 font-medium">아직 활동 내역이 없습니다.</p>
                    <p className="text-sm text-gray-400 mt-1">수련 관리 페이지에서 출석을 체크해보세요.</p>
                </>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500">이번 달 출석</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{monthlyAttendanceCount}회</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500">현재 승급</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">{profile?.rank_name || '무급'}</p>
            </div>
          </div>
          {/* ... 진도 현황 (생략) ... */}
        </>
      )}
    </div>
  );
}