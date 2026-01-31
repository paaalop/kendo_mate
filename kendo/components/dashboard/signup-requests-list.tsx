"use client";

import { approveRequest, rejectRequest } from "@/app/(dashboard)/members/actions";
import { useState } from "react";
import { UserCheck, UserX, Phone, Calendar } from "lucide-react";
import { formatPhoneNumber } from "@/lib/utils/phone";

interface SignupRequest {
  id: string;
  name: string;
  phone: string;
  is_adult: boolean;
  guardian_phone?: string;
  created_at: string;
}

export function SignupRequestsList({ requests }: { requests: SignupRequest[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    if (!confirm("이 신청을 승인하시겠습니까?")) return;
    setProcessingId(id);
    const result = await approveRequest(id);
    if (result.error) {
      alert(result.error);
    }
    setProcessingId(null);
  };

  const handleReject = async (id: string) => {
    if (!confirm("이 신청을 거절하시겠습니까?")) return;
    setProcessingId(id);
    const result = await rejectRequest(id);
    if (result.error) {
      alert(result.error);
    }
    setProcessingId(null);
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <p className="text-gray-500 text-sm">대기 중인 가입 신청이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center">
              <span className="font-bold text-gray-900 mr-2">{request.name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${request.is_adult ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                {request.is_adult ? '성인' : '미성년자'}
              </span>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <Phone className="w-3 h-3 mr-1" />
              <span>{formatPhoneNumber(request.phone)}</span>
              {!request.is_adult && request.guardian_phone && (
                <>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="text-gray-400">보호자: {formatPhoneNumber(request.guardian_phone)}</span>
                </>
              )}
            </div>
            <div className="flex items-center text-[10px] text-gray-400">
              <Calendar className="w-3 h-3 mr-1" />
              <span>신청일: {new Date(request.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleReject(request.id)}
              disabled={processingId === request.id}
              className="flex-1 sm:flex-none flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
            >
              <UserX className="w-4 h-4 mr-1.5" />
              거절
            </button>
            <button
              onClick={() => handleApprove(request.id)}
              disabled={processingId === request.id}
              className="flex-1 sm:flex-none flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4 mr-1.5" />
              승인
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
