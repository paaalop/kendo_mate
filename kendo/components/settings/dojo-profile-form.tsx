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
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h2 className="text-xl font-bold mb-4">도장 정보</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">도장 이름</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full p-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="도장 이름을 입력하세요"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading || name === initialName}
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center"
        >
          {loading ? <Loader2 className="animate-spin" /> : "저장"}
        </button>
      </form>
    </div>
  );
}
