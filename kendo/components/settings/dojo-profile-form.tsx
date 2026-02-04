"use client";

import { useState } from "react";
import { updateDojoProfile } from "@/app/(dashboard)/settings/actions";
import { Loader2 } from "lucide-react";

interface DojoProfileFormProps {
  initialName: string;
}

export function DojoProfileForm({ initialName }: DojoProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDojoProfile(name);
      alert("도장 정보가 수정되었습니다.");
    } catch (e) {
      console.error(e);
      alert("수정 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-lg font-bold text-gray-900">도장 정보 설정</h2>
        <p className="text-sm text-gray-500 mt-1">앱에 표시될 도장의 기본 정보를 관리합니다.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">도장 이름</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
            placeholder="도장 이름을 입력하세요"
          />
        </div>
        
        <div className="flex justify-end pt-2">
          <button 
            type="submit" 
            disabled={loading || name === initialName}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center gap-2 min-w-[100px]"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "변경사항 저장"}
          </button>
        </div>
      </form>
    </div>
  );
}
