"use client";

import { useState } from "react";
import { Member } from "@/lib/types/member";
import { updateMemberDetails } from "@/app/(dashboard)/members/actions";
import { Loader2, Save, X } from "lucide-react";

interface EditMemberFormProps {
  member: Member;
  onClose: () => void;
}

export function EditMemberForm({ member, onClose }: EditMemberFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: member.name,
    phone: member.phone || "",
    default_session_time: member.default_session_time || "",
    guardian_name: member.guardian_name || "",
    guardian_phone: member.guardian_phone || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateMemberDetails(member.id, formData);
      onClose();
    } catch (error) {
      alert("정보 수정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">관원 정보 수정</h3>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">
                  이름
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-blue-500 focus:bg-white focus:outline-none font-bold transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">
                  전화번호
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-blue-500 focus:bg-white focus:outline-none font-bold transition-all"
                  placeholder="01012345678"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">
                기본 수련 시간 (예: 18:30)
              </label>
              <input
                type="text"
                value={formData.default_session_time}
                onChange={(e) => setFormData(prev => ({ ...prev, default_session_time: e.target.value }))}
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-blue-500 focus:bg-white focus:outline-none font-bold transition-all"
                placeholder="18:30"
              />
            </div>

            {!member.is_adult && (
              <div className="p-4 bg-blue-50/50 rounded-2xl space-y-4">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">보호자 정보</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">성함</label>
                    <input
                      type="text"
                      value={formData.guardian_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, guardian_name: e.target.value }))}
                      className="w-full p-3 bg-white rounded-xl border border-gray-100 focus:border-blue-500 focus:outline-none font-bold transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">연락처</label>
                    <input
                      type="tel"
                      value={formData.guardian_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, guardian_phone: e.target.value }))}
                      className="w-full p-3 bg-white rounded-xl border border-gray-100 focus:border-blue-500 focus:outline-none font-bold transition-all"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-2xl font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
