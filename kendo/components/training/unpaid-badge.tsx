"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnpaidBadgeProps {
  count: number;
}

export function UnpaidBadge({ count }: UnpaidBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (count <= 0) return null;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full font-black uppercase tracking-tighter animate-pulse shadow-sm hover:bg-red-600 transition-colors"
      >
        <AlertCircle className="w-3 h-3" />
        <span>UNPAID</span>
      </button>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-gray-900 text-white text-[11px] p-2 rounded-lg shadow-xl z-50 text-center animate-in fade-in zoom-in duration-200">
          <p className="font-bold">{count}개월 미납</p>
          <p className="text-gray-400 text-[9px] mt-0.5 font-medium">상세 내역은 관장님께 문의하세요.</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}
