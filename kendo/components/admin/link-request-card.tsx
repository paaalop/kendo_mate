'use client'

import { useTransition } from 'react'
import { handleLinkRequest, handleUnlinkRequest } from '@/lib/actions/admin-actions'
import { Check, X, Calendar, Link2, Link2Off } from 'lucide-react'
import { toast } from 'sonner'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface LinkRequestProps {
  request: {
    id: string
    guardian_id: string
    child_name: string
    child_birthdate: string
    request_type: string
    created_at: string
  }
}

export function LinkRequestCard({ request }: LinkRequestProps) {
  const [isPending, startTransition] = useTransition()
  const isUnlink = request.request_type === 'unlink'

  const onAction = async (action: 'approve' | 'reject' | 'approve_promote') => {
    startTransition(async () => {
      let result
      if (isUnlink) {
        result = await handleUnlinkRequest(request.id, action as 'approve' | 'reject')
      } else {
        result = await handleLinkRequest(request.id, action as 'approve_promote' | 'reject')
      }

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('처리가 완료되었습니다.')
      }
    })
  }

  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center",
            isUnlink ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
          )}>
            {isUnlink ? <Link2Off size={24} /> : <Link2 size={24} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900">{request.child_name}</h3>
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                isUnlink ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
              )}>
                {isUnlink ? '연결 해제 요청' : '도장 연결 요청'}
              </span>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <Calendar size={12} /> {request.child_birthdate} 생
            </p>
          </div>
        </div>
        <div className="text-[10px] text-gray-400 font-bold">
          {new Date(request.created_at).toLocaleDateString()}
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={() => onAction('reject')}
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 disabled:opacity-50 transition min-h-[44px]"
        >
          <X size={18} /> 거절
        </button>
        <button 
          onClick={() => onAction(isUnlink ? 'approve' : 'approve_promote')}
          disabled={isPending}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition shadow-sm min-h-[44px]",
            isUnlink ? "bg-red-600 hover:bg-red-700 shadow-red-100" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
          )}
        >
          <Check size={18} /> {isUnlink ? '연결 해제 승인' : '승인 (신규 등록)'}
        </button>
      </div>
      
      {!isUnlink && (
        <p className="mt-3 text-[10px] text-gray-400 text-center italic">
          * 기존 관원과 병합 기능은 상세 관리 메뉴에서 지원됩니다.
        </p>
      )}
    </div>
  )
}
