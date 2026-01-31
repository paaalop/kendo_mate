"use client";

import { Member, MemberRole } from "@/lib/types/member";
import { User, Phone, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { RoleManager } from "./role-manager";

interface MemberCardProps {
  member: Member;
  isOwner: boolean;
}

export function MemberCard({ member, isOwner }: MemberCardProps) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
            <User size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900">{member.name}</h3>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full font-bold border border-gray-200">
                {member.rank_name || '무급'}
              </span>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <Phone size={10} /> {member.phone || '전화번호 없음'}
            </p>
          </div>
        </div>
        
        <RoleManager 
          memberId={member.id} 
          currentRole={member.role as MemberRole} 
          isOwner={isOwner} 
        />
      </div>

      <Link 
        href={`/members/${member.id}`}
        className="flex items-center justify-between mt-2 p-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 active:bg-gray-200 active:scale-[0.98] transition-all group"
      >
        <span className="text-xs font-bold">상세 정보 보기</span>
        <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}
