import { createClient } from "@/utils/supabase/server";
import { SignupRequestsList } from "@/components/dashboard/signup-requests-list";
import { GuardianSummaryView } from "@/components/dashboard/guardian-summary";
import { ProgressCard } from "@/components/dashboard/progress-card";
import { getCurrentCurriculumItem } from "@/lib/utils/curriculum";
import { getActiveProfileContext } from "@/lib/utils/profile";
import { redirect } from "next/navigation";
import type { GuardianSummary } from "@/lib/types/family";
import { Suspense } from "react";

export default async function DashboardPage() {
  const context = await getActiveProfileContext();
  
  if (!context) redirect("/login");

  const { user, activeProfileId } = context;
  const supabase = await createClient();

  // 1. Guardian Summary View
  if (activeProfileId === 'guardian_summary') {
    const { data: summaries } = await supabase.rpc('get_guardian_summary', { 
      guardian_uuid: user.id 
    });

    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">보호자 요약</h1>
          <p className="text-gray-600">연결된 모든 관원의 상태를 한눈에 확인하세요.</p>
        </header>

        <GuardianSummaryView summaries={(summaries as GuardianSummary[]) || []} />
      </div>
    );
  }

  // 2. Specific Profile View
  const profile = context.allProfiles.find(p => p.id === activeProfileId) as any;

  if (!profile) {
    return (
      <div className="p-20 text-center text-gray-500">
        프로필을 선택해 주세요.
      </div>
    );
  }

  const isStaff = profile.role === 'owner' || profile.role === 'instructor';
  const dojoId = profile.dojo_id;

  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstDate = new Date(now.getTime() + kstOffset);
  
  const kstMidnight = new Date(kstDate);
  kstMidnight.setUTCHours(0, 0, 0, 0);
  const startOfDay = new Date(kstMidnight.getTime() - kstOffset).toISOString();
  
  const kstEndOfDay = new Date(kstDate);
  kstEndOfDay.setUTCHours(23, 59, 59, 999);
  const endOfDay = new Date(kstEndOfDay.getTime() - kstOffset).toISOString();
  
  const kstStartOfMonth = new Date(kstDate);
  kstStartOfMonth.setUTCDate(1);
  kstStartOfMonth.setUTCHours(0, 0, 0, 0);
  const startOfMonthISO = new Date(kstStartOfMonth.getTime() - kstOffset).toISOString();

  if (isStaff) {
    const [attendanceResult, pendingResult] = await Promise.all([
      supabase
        .from("attendance_logs")
        .select(`user_id, profiles!inner(deleted_at)`)
        .eq("dojo_id", dojoId || "")
        .is("profiles.deleted_at", null)
        .gte("attended_at", startOfDay)
        .lte("attended_at", endOfDay),
      supabase
        .from("signup_requests")
        .select("*", { count: "exact", head: true })
        .eq("dojo_id", dojoId || "")
        .eq("status", "pending")
    ]);

    const todayAttendanceCount = new Set(attendanceResult.data?.map(a => a.user_id)).size;
    const pendingRequestsCount = pendingResult.count || 0;

    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">{profile.name}님 (관리자)</h1>
          <p className="text-gray-600">{profile.dojos?.name} 도장 현황입니다.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">오늘 출석</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{todayAttendanceCount}명</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">대기 중인 신청</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">{pendingRequestsCount}명</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">이번 달 수납</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">0원</p>
          </div>
        </div>

        <Suspense fallback={<div className="h-48 w-full bg-gray-50 animate-pulse rounded-3xl border border-dashed border-gray-200" />}>
          <SignupRequestsList />
        </Suspense>
      </div>
    );
  } else {
    // Member View
    const [attendanceResult, currentCurriculum, progressResult, totalResult] = await Promise.all([
      supabase
        .from("attendance_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .gte("attended_at", startOfMonthISO),
      getCurrentCurriculumItem(profile.id),
      supabase
        .from("user_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id),
      supabase
        .from("curriculum_items")
        .select("*", { count: "exact", head: true })
        .eq("dojo_id", profile.dojo_id || "")
    ]);

    const monthlyAttendanceCount = attendanceResult.count || 0;
    const completedCount = progressResult.count || 0;
    const totalCount = totalResult.count || 0;
    const progressRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">{profile.name}님의 진도</h1>
          <p className="text-gray-600">{profile.dojos?.name || '미연결 프로필'}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mr-4">
              <span className="text-xl font-bold text-blue-600">{monthlyAttendanceCount}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">이번 달 출석</p>
              <p className="text-lg font-bold text-gray-900">{monthlyAttendanceCount}회 수련</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mr-4">
              <span className="text-purple-600 text-lg">🥋</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">현재 승급</p>
              <p className="text-lg font-bold text-gray-900">{profile.rank_name || '무급'}</p>
            </div>
          </div>
        </div>

        <ProgressCard currentItem={currentCurriculum} progressRate={progressRate} />
      </div>
    );
  }
}