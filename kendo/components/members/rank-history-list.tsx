"use client";

import { RankHistoryWithProfile } from "@/lib/types/member";
import { Award, Calendar } from "lucide-react";

interface RankHistoryListProps {
  history: RankHistoryWithProfile[];
}

export function RankHistoryList({ history }: RankHistoryListProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        승급 이력이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <div key={item.id} className="flex gap-4 items-start">
          <div className="mt-1 w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 flex-shrink-0">
            <Award size={16} />
          </div>
          <div className="flex-1 border-b border-gray-50 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-gray-900">{item.new_rank}</p>
                <p className="text-xs text-gray-500">
                  {item.previous_rank ? `${item.previous_rank}에서 승급` : '초기 등급'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 flex items-center gap-1 justify-end">
                  <Calendar size={10} /> {item.promoted_at ? new Date(item.promoted_at).toLocaleDateString() : '날짜 없음'}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  by {item.promoted_by_profile?.name || '시스템'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
