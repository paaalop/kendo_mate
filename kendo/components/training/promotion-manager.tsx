"use client";

import { useState } from "react";
import { Send, Calendar } from "lucide-react";
import { sendPromotionNotification } from "@/app/(dashboard)/training/actions";

interface PromotionManagerProps {
  dojoId: string;
}

export function PromotionManager({ dojoId }: PromotionManagerProps) {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (isLoading) return;

    if (!confirm(`${month}월 승급 심사 공지를 모든 관원에게 전송하시겠습니까?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await sendPromotionNotification({ 
        month: month.toString(), 
        dojoId 
      });
      alert(`${month}월 승급 심사 공지가 전송되었습니다.`);
    } catch (error) {
      alert("공지 전송 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Calendar className="h-4 w-4 text-blue-200" />
        </div>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="bg-white/10 border border-white/20 text-white text-sm rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none cursor-pointer hover:bg-white/20 transition-colors"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m} className="text-gray-900">
              {m}월 심사
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleSend}
        disabled={isLoading}
        className="flex items-center gap-2 bg-white text-blue-700 px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-blue-50 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all min-h-[44px]"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <Send className="w-4 h-4" />
        )}
        <span>알림 전송</span>
      </button>
    </div>
  );
}
