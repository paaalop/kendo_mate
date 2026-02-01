"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function MonthPicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentMonth = searchParams.get('month') || new Date().toISOString().slice(0, 7); // YYYY-MM

  const handlePrev = () => {
    const date = new Date(currentMonth + "-01");
    date.setMonth(date.getMonth() - 1);
    updateMonth(date);
  };

  const handleNext = () => {
    const date = new Date(currentMonth + "-01");
    date.setMonth(date.getMonth() + 1);
    updateMonth(date);
  };

  const updateMonth = (date: Date) => {
    // Format YYYY-MM using local time components to avoid timezone shifts if possible,
    // but standard approach:
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const newMonth = `${year}-${month}`;
    
    const params = new URLSearchParams(searchParams);
    params.set('month', newMonth);
    router.push(`?${params.toString()}`);
  };

  const [year, month] = currentMonth.split('-');

  return (
    <div className="flex items-center space-x-4 bg-white p-1 rounded-lg border shadow-sm">
      <button onClick={handlePrev} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <span className="text-lg font-bold min-w-[100px] text-center text-gray-800">
        {year}년 {month}월
      </span>
      <button onClick={handleNext} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
