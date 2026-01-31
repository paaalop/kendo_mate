"use client";

import { useState } from "react";
import { getAttendanceHistory } from "@/app/(dashboard)/members/actions";
import { Calendar, Loader2 } from "lucide-react";

import { AttendanceHistoryItem } from "@/lib/types/member";

interface AttendanceHistoryListProps {
  memberId: string;
  initialLogs: AttendanceHistoryItem[];
  initialHasMore: boolean;
}

export function AttendanceHistoryList({ memberId, initialLogs, initialHasMore }: AttendanceHistoryListProps) {
  const [logs, setLogs] = useState(initialLogs);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);

  const loadMore = async () => {
    setLoading(true);
    try {
      const nextPage = page + 1;
      const result = await getAttendanceHistory(memberId, nextPage);
      setLogs(prev => [...prev, ...result.logs]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (error) {
      alert("출석 기록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        출석 기록이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-500 shadow-sm">
              <Calendar size={14} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">
                {log.attended_at ? new Date(log.attended_at).toLocaleDateString() : '날짜 없음'}
              </p>
              <p className="text-[10px] text-gray-500">
                {log.attended_at ? new Date(log.attended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} • {log.check_type === 'manual' ? '수동' : log.check_type}
              </p>
            </div>
          </div>
        </div>
      ))}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="w-full py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          더 보기
        </button>
      )}
    </div>
  );
}
