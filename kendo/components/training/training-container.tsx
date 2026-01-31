"use client";

import { useState, useMemo } from "react";
import { TrainingSearch } from "./training-search";
import { MemberCard } from "./member-card";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  name: string;
  phone?: string | null;
  rank_name: string | null;
  rank_level: number | null;
  default_session_time: string;
  isAttendedToday: boolean;
  currentTechnique: string;
  currentTechniqueId?: string;
  unpaidMonthsCount: number;
}

interface TrainingContainerProps {
  initialMembers: Member[];
  dojoId: string;
}

export function TrainingContainer({ initialMembers, dojoId }: TrainingContainerProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("전체");

  // 1. 검색 필터링
  const filteredMembers = useMemo(() => {
    return initialMembers.filter(m => 
      m.name.includes(search) || 
      m.phone?.endsWith(search)
    );
  }, [initialMembers, search]);

  // 2. 시간표별 탭 생성
  const tabs = useMemo(() => {
    const times = new Set(initialMembers.map(m => m.default_session_time || "미배정"));
    return ["전체", ...Array.from(times).sort()];
  }, [initialMembers]);

  // 3. 탭별 필터링
  const displayedMembers = useMemo(() => {
    if (activeTab === "전체") return filteredMembers;
    return filteredMembers.filter(m => (m.default_session_time || "미배정") === activeTab);
  }, [filteredMembers, activeTab]);

  // 4. 통계 계산
  const attendanceStats = useMemo(() => {
    const attendedCount = filteredMembers.filter(m => m.isAttendedToday).length;
    return { attended: attendedCount, total: filteredMembers.length };
  }, [filteredMembers]);

  return (
    <div className="space-y-6">
      {/* 검색 및 통계 */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl shadow-md flex items-center gap-2">
            <span className="text-sm font-bold opacity-80">오늘 출석</span>
            <span className="text-xl font-black">{attendanceStats.attended}/{attendanceStats.total}</span>
          </div>
        </div>
        <TrainingSearch value={search} onChange={setSearch} />
      </div>

      {/* 시간표 탭 (가로 스크롤 가능) */}
      <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-5 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all text-sm",
              activeTab === tab
                ? "bg-blue-600 text-white shadow-lg scale-105"
                : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
            )}
          >
            {tab === "전체" ? "전체보기" : tab}
          </button>
        ))}
      </div>

      {/* 관원 리스트 */}
      {displayedMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayedMembers.map(member => (
            <MemberCard key={member.id} member={member} dojoId={dojoId} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 font-medium">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
