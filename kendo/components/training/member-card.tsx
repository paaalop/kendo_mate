"use client";

import { AttendanceButton } from "./attendance-button";
import { PassButton } from "./pass-button";
import { UnpaidBadge } from "./unpaid-badge";
import { cn } from "@/lib/utils";

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
  const isFinished = member.currentTechnique === "커리큘럼 완료";

  return (
    <div className={cn(
      "bg-white p-4 rounded-2xl shadow-sm border transition-all",
      isFinished ? "border-yellow-200 bg-yellow-50/30" : "border-gray-100"
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">{member.name}</span>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium border border-gray-200">
              {member.rank_name}
            </span>
            <UnpaidBadge count={member.unpaidMonthsCount} />
          </div>
          <p className="text-xs text-gray-500 mt-1 font-medium italic">
            Session: {member.default_session_time}
          </p>
        </div>
      </div>

      <div className={cn(
        "p-3 rounded-xl border mb-4 relative overflow-hidden group transition-all",
        isFinished 
          ? "bg-yellow-100 border-yellow-300" 
          : "bg-blue-50 border-blue-100 hover:border-blue-300"
      )}>
        <p className={cn(
          "text-[10px] font-black uppercase tracking-widest mb-1",
          isFinished ? "text-yellow-700" : "text-blue-500"
        )}>
          Current Technique
        </p>
        <p className={cn(
          "text-sm font-extrabold truncate",
          isFinished ? "text-yellow-800" : "text-gray-800"
        )}>
          {member.currentTechnique}
        </p>
        {!isFinished && (
          <div className="absolute top-0 right-0 w-1 h-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        )}
      </div>

      <div className="flex gap-2">
        <AttendanceButton 
          memberId={member.id} 
          dojoId={dojoId} 
          initialAttended={member.isAttendedToday} 
        />
        <PassButton 
          memberId={member.id}
          techniqueId={member.currentTechniqueId}
          techniqueName={member.currentTechnique}
        />
      </div>
    </div>
  );
}
