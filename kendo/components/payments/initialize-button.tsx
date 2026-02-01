"use client";

import { useTransition } from "react";
import { initializeMonthlyPayments } from "@/app/(dashboard)/payments/actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function InitializeButton({ monthDate }: { monthDate: string }) {
  const [isPending, startTransition] = useTransition();

  const handleInitialize = () => {
    startTransition(async () => {
      try {
        await initializeMonthlyPayments(monthDate);
        toast.success("회비 내역이 생성되었습니다.");
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "생성에 실패했습니다.";
        toast.error(errorMessage);
      }
    });
  };

  return (
    <button 
      onClick={handleInitialize}
      disabled={isPending}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-semibold shadow-sm disabled:opacity-50 flex items-center"
    >
      {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      명단 생성
    </button>
  );
}
