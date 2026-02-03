"use client";

import { useState, useEffect, useTransition } from "react";
import { Check } from "lucide-react";
import { toggleAttendance } from "@/app/(dashboard)/training/actions";
import { cn } from "@/lib/utils";

interface AttendanceButtonProps {
  memberId: string;
  dojoId: string;
  initialAttended: boolean;
  compact?: boolean;
}

export function AttendanceButton({ 
  memberId, 
  dojoId, 
  initialAttended,
  compact
}: AttendanceButtonProps) {
  const [isAttended, setIsAttended] = useState(initialAttended);
  const [isPending, startTransition] = useTransition();

  // 서버 데이터와 상태 동기화
  useEffect(() => {
    setIsAttended(initialAttended);
  }, [initialAttended]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isPending) return;

    // Optimistic UI Update
    const previousState = isAttended;
    const newState = !previousState;
    setIsAttended(newState);

    startTransition(async () => {
      try {
        await toggleAttendance({ userId: memberId, dojoId });
      } catch (error) {
        // Rollback on error
        setIsAttended(previousState);
        alert("출석 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold transition-all active:scale-95",
        compact ? "min-h-[32px] min-w-0 flex-1 text-[10px] sm:text-sm" : "min-h-[44px] min-w-[100px]",
        isAttended 
          ? "bg-green-100 text-green-700 border-2 border-green-500" 
          : "bg-blue-600 text-white hover:bg-blue-700 shadow-md",
        isPending && "opacity-70 cursor-not-allowed"
      )}
    >
      {isAttended ? (
        <>
          <Check className={cn("w-3 h-3 sm:w-5 sm:h-5", isPending && "animate-spin")} />
          <span>{compact ? "출석" : "출석완료"}</span>
        </>
      ) : (
        <span>{isPending ? (compact ? "..." : "처리 중...") : "출석"}</span>
      )}
    </button>
  );
}
