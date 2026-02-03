'use client'

import { GuardianSummary } from '@/lib/types/family'
import { Calendar, CreditCard, ChevronRight, AlertCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface GuardianSummaryViewProps {
  summaries: GuardianSummary[]
}

export function GuardianSummaryView({ summaries }: GuardianSummaryViewProps) {
  if (summaries.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
        <p className="text-gray-500">등록된 자녀 또는 연결된 프로필이 없습니다.</p>
        <Link 
          href="/family/create"
          className="mt-4 inline-flex items-center text-blue-600 font-bold hover:underline"
        >
          새 프로필 만들기
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {summaries.map((child) => {
        const isPendingLink = child.link_status === 'pending' && child.link_request_type === 'link'
        const isRejected = child.link_status === 'rejected'
        const isPendingUnlink = child.link_status === 'pending' && child.link_request_type === 'unlink'

        return (
          <Link
            key={child.member_id}
            href={`/family/settings/${child.member_id}`}
            className="block bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900">{child.name}</h3>
                  {isPendingLink && (
                    <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-full border border-orange-100 flex items-center">
                      <Clock className="w-2.5 h-2.5 mr-1" /> 연결 대기 중
                    </span>
                  )}
                  {isRejected && (
                    <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-full border border-red-100 flex items-center">
                      <AlertCircle className="w-2.5 h-2.5 mr-1" /> 거절됨 (확인 필요)
                    </span>
                  )}
                  {isPendingUnlink && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full border border-gray-200 flex items-center">
                      <Clock className="w-2.5 h-2.5 mr-1" /> 해제 대기 중
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{child.dojo_name || '도장 미연결'}</p>
              </div>
              <ChevronRight className="text-gray-300 group-hover:text-gray-500 transition" />
            </div>

            {child.dojo_name ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center p-3 bg-gray-50 rounded-2xl">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">최근 출석</p>
                    <p className="text-sm font-bold text-gray-700">
                      {child.last_attendance_date 
                        ? new Date(child.last_attendance_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
                        : '기록 없음'
                      }
                    </p>
                  </div>
                </div>

                <div className={cn(
                  "flex items-center p-3 rounded-2xl",
                  child.unpaid_amount > 0 ? "bg-red-50" : "bg-green-50"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                    child.unpaid_amount > 0 ? "bg-red-100" : "bg-green-100"
                  )}>
                    <CreditCard className={cn(
                      "w-4 h-4",
                      child.unpaid_amount > 0 ? "text-red-600" : "text-green-600"
                    )} />
                  </div>
                  <div>
                    <p className={cn(
                      "text-[10px] font-bold uppercase tracking-widest",
                      child.unpaid_amount > 0 ? "text-red-400" : "text-green-400"
                    )}>미납금</p>
                    <p className={cn(
                      "text-sm font-bold",
                      child.unpaid_amount > 0 ? "text-red-700" : "text-green-700"
                    )}>
                      {child.unpaid_amount > 0 
                        ? `${child.unpaid_amount.toLocaleString()}원`
                        : '없음'
                      }
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-2xl text-center">
                 <p className="text-xs text-gray-400">도장과 연결되면 출석 및 회비 정보를 볼 수 있습니다.</p>
              </div>
            )}
          </Link>
        )
      })}
    </div>
  )
}