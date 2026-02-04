'use client'

import { useState } from 'react'
import { approveLinkRequest, rejectLinkRequest } from '@/app/(dashboard)/admin/members/requests/actions'
import type { Database } from '@/lib/types/database.types'

type LinkRequestWithProfile = Database['public']['Tables']['link_requests']['Row'] & {
  profiles: {
    name: string | null
    birthdate: string | null
  } | null
}

interface LinkRequestCardProps {
  request: LinkRequestWithProfile
}

export function LinkRequestCard({ request }: LinkRequestCardProps) {
  const [loading, setLoading] = useState(false)
  const profile = request.profiles

  const handleAction = async (action: 'approve' | 'reject') => {
    setLoading(true)
    try {
      const result = action === 'approve' 
        ? await approveLinkRequest(request.id)
        : await rejectLinkRequest(request.id)

      if (result.error) {
        alert(`작업 실패: ${result.error}`)
      }
    } catch (error) {
      console.error(error)
      alert('작업 중 예기치 않은 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow border flex justify-between items-center">
      <div>
        <h3 className="font-bold">{profile?.name || '알 수 없음'}</h3>
        <p className="text-sm text-gray-500">생년월일: {profile?.birthdate}</p>
        <p className="text-xs text-gray-400">관계: {request.relationship}</p>
        <p className="text-xs text-gray-400">요청일: {request.created_at ? new Date(request.created_at).toLocaleDateString() : '-'}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => handleAction('reject')}
          disabled={loading}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 disabled:opacity-50"
        >
          거절
        </button>
        <button
          onClick={() => handleAction('approve')}
          disabled={loading}
          className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          승인
        </button>
      </div>
    </div>
  )
}