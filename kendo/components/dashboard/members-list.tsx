"use client";

import { changeMemberRole, softDeleteMember } from "@/app/(dashboard)/members/actions";
import { useState } from "react";
import { User, Shield, UserMinus, Phone } from "lucide-react";
import { formatPhoneNumber } from "@/lib/utils/phone";

interface Member {
  id: string;
  name: string;
  role: string;
  phone: string;
  is_adult: boolean;
  guardian_phone?: string;
}

export function MembersList({ members, currentUserRole }: { members: Member[], currentUserId: string, currentUserRole: string }) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleRoleChange = async (id: string, newRole: string) => {
    setProcessingId(id);
    try {
      await changeMemberRole(id, newRole);
    } catch (error) {
      alert(error instanceof Error ? error.message : "오류가 발생했습니다.");
    }
    setProcessingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말로 이 관원을 삭제(탈퇴 처리)하시겠습니까?")) return;
    setProcessingId(id);
    try {
      await softDeleteMember(id);
    } catch (error) {
      alert(error instanceof Error ? error.message : "오류가 발생했습니다.");
    }
    setProcessingId(null);
  };

  if (members.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 text-sm">등록된 관원이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white border border-gray-100 rounded-xl shadow-sm">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관원명</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">역할</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {members.map((member) => (
            <tr key={member.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 whitespace-now8 text-sm">
                <div className="flex items-center">
                  <div className="font-medium text-gray-900">{member.name}</div>
                  {!member.is_adult && (
                      <span className="ml-2 text-[10px] text-orange-500 border border-orange-200 px-1.5 py-0.5 rounded">미성년</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center">
                  <Phone className="w-3 h-3 mr-1 text-gray-400" />
                  {formatPhoneNumber(member.phone)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {currentUserRole === 'owner' && member.role !== 'owner' ? (
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    disabled={processingId === member.id}
                    className="text-xs border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="member">관원</option>
                    <option value="instructor">사범</option>
                    <option value="guardian">학부모</option>
                  </select>
                ) : (
                  <span className="text-xs flex items-center capitalize">
                    {member.role === 'owner' && <Shield className="w-3 h-3 mr-1 text-blue-600" />}
                    {member.role === 'owner' ? '관장' : member.role === 'instructor' ? '사범' : member.role === 'guardian' ? '학부모' : '관원'}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {currentUserRole === 'owner' && member.role !== 'owner' && (
                  <button
                    onClick={() => handleDelete(member.id)}
                    disabled={processingId === member.id}
                    className="text-red-400 hover:text-red-600 transition p-2 rounded-lg hover:bg-red-50"
                  >
                    <UserMinus className="w-5 h-5" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
