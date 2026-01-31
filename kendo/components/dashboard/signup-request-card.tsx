"use client";

import { useState } from "react";
import { approveSignup, rejectSignup } from "@/app/(dashboard)/members/actions";
import { SignupRequest } from "@/lib/types/member";
import { Check, X, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignupRequestCardProps {
  request: SignupRequest;
}

export function SignupRequestCard({ request }: SignupRequestCardProps) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await approveSignup(request.id);
      // Success is handled by revalidation and state update
    } catch (error) {
      alert("승인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("정말 거절하시겠습니까?")) return;
    setLoading(true);
    try {
      await rejectSignup(request.id);
    } catch (error) {
      alert("거절 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <User size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{request.name}</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Phone size={10} /> {request.phone}
            </p>
          </div>
        </div>
        <div className="text-[10px] text-gray-400 font-medium">
          {new Date(request.created_at || '').toLocaleDateString()}
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={handleReject}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-red-100 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          <X size={16} /> 거절
        </button>
        <button 
          onClick={handleApprove}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          <Check size={16} /> 승인
        </button>
      </div>
    </div>
  );
}
