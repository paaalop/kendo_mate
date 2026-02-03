"use client";

import { AttendanceButton } from "./attendance-button";
import { PassButton } from "./pass-button";
import { UnpaidBadge } from "./unpaid-badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface MemberCardProps {
  member: {
    id: string;
    name: string;
    rank_name: string | null;
    default_session_time: string;
    isAttendedToday: boolean;
    currentTechnique: string;
    currentTechniqueId?: string;
    unpaidMonthsCount: number;
  };
  dojoId: string;
}

export function MemberCard({ member, dojoId }: MemberCardProps) {
  const router = useRouter();
  const isFinished = member.currentTechnique === "커리큘럼 완료";

  return (
    <div 
      onClick={() => router.push(`/members/${member.id}`)}
      className={cn(
        "bg-white p-2 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border transition-all cursor-pointer hover:shadow-md",
        isFinished ? "border-yellow-200 bg-yellow-50/30" : "border-gray-100"
      )}
    >
      <div className="flex justify-between items-start mb-2 sm:mb-4">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            <span className="text-sm sm:text-lg font-bold text-gray-900 truncate">{member.name}</span>
            <span className="px-1 sm:px-2 py-0.5 bg-gray-100 text-gray-600 text-[8px] sm:text-xs rounded-full font-medium border border-gray-200 truncate">
              {member.rank_name}
            </span>
            {member.unpaidMonthsCount > 0 && (
              <div className="sm:block hidden">
                <UnpaidBadge count={member.unpaidMonthsCount} />
              </div>
            )}
          </div>
          <p className="text-[8px] sm:text-xs text-gray-500 mt-0.5 font-medium italic truncate">
            {member.default_session_time}
          </p>
        </div>
      </div>

      <div className={cn(
        "p-1.5 sm:p-3 rounded-lg sm:rounded-xl border mb-2 sm:mb-4 relative overflow-hidden group transition-all",
        isFinished 
          ? "bg-yellow-100 border-yellow-300" 
          : "bg-blue-50 border-blue-100 hover:border-blue-300"
      )}>
        <p className={cn(
          "text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-0.5",
          isFinished ? "text-yellow-700" : "text-blue-500"
        )}>
          {isFinished ? "완료" : "기술"}
        </p>
        <p className={cn(
          "text-[10px] sm:text-sm font-extrabold truncate",
          isFinished ? "text-yellow-800" : "text-gray-800"
        )}>
          {member.currentTechnique}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2" onClick={(e) => e.stopPropagation()}>
        <AttendanceButton 
          memberId={member.id} 
          dojoId={dojoId} 
          initialAttended={member.isAttendedToday}
          compact 
        />
        <PassButton 
          memberId={member.id}
          techniqueId={member.currentTechniqueId}
          techniqueName={member.currentTechnique}
          compact
        />
      </div>
    </div>
  );
}
