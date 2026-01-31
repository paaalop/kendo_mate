"use client";

import { useState } from "react";
import { changeMemberRole } from "@/app/(dashboard)/members/actions";
import { MemberRole } from "@/lib/types/member";
import { Shield, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleManagerProps {
  memberId: string;
  currentRole: MemberRole;
  isOwner: boolean;
}

export function RoleManager({ memberId, currentRole, isOwner }: RoleManagerProps) {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(currentRole);

  if (!isOwner) return null;

  const handleChange = async (newRole: string) => {
    setLoading(true);
    try {
      await changeMemberRole(memberId, newRole);
      setRole(newRole as MemberRole);
    } catch (error) {
      alert(error instanceof Error ? error.message : "권한 변경 중 오류가 발생했습니다.");
      setRole(currentRole); // Reset
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center gap-1">
      <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
        <Shield size={12} className={cn(
          role === 'owner' ? "text-red-500" : role === 'instructor' ? "text-blue-500" : "text-gray-400"
        )} />
        <select
          value={role}
          onChange={(e) => handleChange(e.target.value)}
          disabled={loading}
          className="bg-transparent text-[11px] font-bold focus:outline-none disabled:opacity-50 appearance-none pr-4"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '10px' }}
        >
          <option value="member">일반관원</option>
          <option value="instructor">사범</option>
          <option value="owner">관장</option>
          <option value="guardian">보호자</option>
        </select>
      </div>
      {loading && <Loader2 size={12} className="animate-spin text-blue-500" />}
    </div>
  );
}
