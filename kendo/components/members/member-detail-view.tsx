"use client";

import { useState, useTransition } from "react";
import { Member, RankHistoryWithProfile, AttendanceHistoryItem } from "@/lib/types/member";
import { RankHistoryList } from "./rank-history-list";
import { AttendanceHistoryList } from "./attendance-history-list";
import { RankPromotionModal } from "./rank-promotion-modal";
import { EditMemberForm } from "./edit-member-form";
import { User, Phone, MapPin, Calendar, Award, History, ArrowLeft, Trash2, Loader2, Edit2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { softDeleteMember } from "@/app/(dashboard)/members/actions";
import { useRouter } from "next/navigation";

interface MemberDetailViewProps {
  member: Member;
  rankHistory: RankHistoryWithProfile[];
  attendanceLogs: AttendanceHistoryItem[];
  hasMoreAttendance: boolean;
  isStaff: boolean;
}

export function MemberDetailView({ 
  member, 
  rankHistory, 
  attendanceLogs, 
  hasMoreAttendance,
  isStaff 
}: MemberDetailViewProps) {
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'rank' | 'attendance'>('info');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!confirm("정말 이 관원을 삭제하시겠습니까? 데이터는 보존되지만 목록에서는 제외됩니다.")) return;
    
    startTransition(async () => {
      try {
        await softDeleteMember(member.id);
        router.push('/members');
        router.refresh();
      } catch (error) {
        alert("삭제 중 오류가 발생했습니다.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/members" 
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 border border-gray-100 hover:text-gray-600 shadow-sm"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">관원 상세 정보</h1>
        </div>
        
        <div className="flex gap-2">
          {isStaff && (
            <button
              onClick={() => setShowEditForm(true)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              title="정보 수정"
            >
              <Edit2 size={20} />
            </button>
          )}
          
          {isStaff && member.role !== 'owner' && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              title="관원 삭제"
            >
              {isPending ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
            </button>
          )}
        </div>
      </header>

      {/* Profile Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-6">
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-bold",
            member.role === 'owner' ? "bg-red-100 text-red-600" : 
            member.role === 'instructor' ? "bg-blue-100 text-blue-600" : 
            "bg-gray-100 text-gray-600"
          )}>
            {member.role === 'owner' ? '관장' : member.role === 'instructor' ? '사범' : '관원'}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
          <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 border-4 border-white shadow-md">
            <User size={48} />
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <h2 className="text-3xl font-black text-gray-900">{member.name}</h2>
              <p className="text-blue-600 font-bold flex items-center justify-center md:justify-start gap-1">
                <Award size={16} /> {member.rank_name || '무급'}
              </p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Phone size={14} /> {member.phone || '전화번호 없음'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} /> {new Date(member.created_at || '').toLocaleDateString()} 가입
              </span>
            </div>
          </div>
          {isStaff && (
            <button 
              onClick={() => setShowPromotionModal(true)}
              className="mt-4 md:mt-0 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              승급 처리
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100/50 p-1 rounded-2xl">
        <button 
          onClick={() => setActiveTab('info')}
          className={cn(
            "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all",
            activeTab === 'info' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
          )}
        >
          기본 정보
        </button>
        <button 
          onClick={() => setActiveTab('rank')}
          className={cn(
            "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all",
            activeTab === 'rank' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
          )}
        >
          승급 이력
        </button>
        <button 
          onClick={() => setActiveTab('attendance')}
          className={cn(
            "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all",
            activeTab === 'attendance' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
          )}
        >
          출석 기록
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-h-[300px]">
        {activeTab === 'info' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">기본 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem label="이름" value={member.name} />
              <InfoItem label="전화번호" value={member.phone} />
              <InfoItem label="성인 여부" value={member.is_adult ? "성인" : "미성년자"} />
              <InfoItem label="기본 수련 시간" value={member.default_session_time || "미지정"} />
              {!member.is_adult && (
                <>
                  <InfoItem label="보호자 성함" value={member.guardian_name || "미지정"} />
                  <InfoItem label="보호자 연락처" value={member.guardian_phone || "미지정"} />
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'rank' && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">승급 이력</h3>
            <RankHistoryList history={rankHistory} />
          </div>
        )}

        {activeTab === 'attendance' && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">출석 기록</h3>
            <AttendanceHistoryList 
              memberId={member.id} 
              initialLogs={attendanceLogs} 
              initialHasMore={hasMoreAttendance} 
            />
          </div>
        )}
      </div>

      {showPromotionModal && (
        <RankPromotionModal 
          memberId={member.id} 
          currentRank={member.rank_name || '무급'} 
          onClose={() => setShowPromotionModal(false)} 
        />
      )}

      {showEditForm && (
        <EditMemberForm
          member={member}
          onClose={() => setShowEditForm(false)}
        />
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string, value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-base font-bold text-gray-800">{value || '-'}</p>
    </div>
  );
}
