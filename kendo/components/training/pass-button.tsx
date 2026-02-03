"use client";

import { useState, useTransition } from "react";
import { Award } from "lucide-react";
import { passTechnique } from "@/app/(dashboard)/training/actions";
import { cn } from "@/lib/utils";

interface PassButtonProps {
  memberId: string;
  techniqueId?: string;
  techniqueName: string;
  compact?: boolean;
}

export function PassButton({ 
  memberId, 
  techniqueId, 
  techniqueName,
  compact
}: PassButtonProps) {
  const [isPending, startTransition] = useTransition();
  const isCompleted = techniqueName === "커리큘럼 완료";

  const handlePass = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!techniqueId || isCompleted || isPending) return;

    startTransition(async () => {
      try {
        await passTechnique({ userId: memberId, itemId: techniqueId });
      } catch (error) {
        alert("진도 처리 중 오류가 발생했습니다.");
      }
    });
  };

  if (isCompleted) {
    return (
      <div className={cn(
        "flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg sm:rounded-xl font-bold",
        compact ? "min-h-[32px] text-[10px] sm:text-sm" : "min-h-[44px]"
      )}>
        <Award className="w-3 h-3 sm:w-5 sm:h-5" />
        <span>{compact ? "심사" : "심사 대기"}</span>
      </div>
    );
  }

  return (
    <button
      onClick={handlePass}
      disabled={isPending || !techniqueId}
      className={cn(
        "flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold transition-all active:scale-95",
        compact ? "min-h-[32px] text-[10px] sm:text-sm" : "min-h-[44px]",
        isPending 
          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" 
          : "bg-white text-gray-700 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 shadow-sm"
      )}
    >
      <CheckIcon className={cn("w-3 h-3 sm:w-5 sm:h-5", isPending && "animate-spin")} />
      <span>{isPending ? (compact ? "..." : "처리 중...") : (compact ? "통과" : "기술 통과")}</span>
    </button>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
