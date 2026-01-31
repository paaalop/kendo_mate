"use client";

import { useState } from "react";
import { promoteMember } from "@/app/(dashboard)/members/actions";
import { Award, X, Loader2 } from "lucide-react";

interface RankPromotionModalProps {
  memberId: string;
  currentRank: string;
  onClose: () => void;
}

const RANKS = [
  "무급", "9급", "8급", "7급", "6급", "5급", "4급", "3급", "2급", "1급",
  "초단", "2단", "3단", "4단", "5단", "6단", "7단", "8단", "9단"
];

export function RankPromotionModal({ memberId, currentRank, onClose }: RankPromotionModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedRank, setSelectedRank] = useState(currentRank);

  const handlePromote = async () => {
    if (selectedRank === currentRank) {
      alert("현재 등급과 동일합니다.");
      return;
    }

    setLoading(true);
    try {
      await promoteMember(memberId, selectedRank);
      onClose();
    } catch (error) {
      alert("승급 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">승급 처리</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">
                현재 등급
              </label>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-600 font-bold">
                {currentRank}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">
                새 등급 선택
              </label>
              <select
                value={selectedRank}
                onChange={(e) => setSelectedRank(e.target.value)}
                className="w-full p-3 bg-white rounded-xl border-2 border-blue-100 focus:border-blue-500 focus:outline-none font-bold transition-all"
              >
                {RANKS.map((rank) => (
                  <option key={rank} value={rank}>{rank}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
            >
              취소
            </button>
            <button
              onClick={handlePromote}
              disabled={loading || selectedRank === currentRank}
              className="flex-1 py-3 px-4 rounded-2xl font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              승급 완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
