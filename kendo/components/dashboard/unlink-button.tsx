'use client'

import { useTransition } from 'react'
import { requestUnlink } from '@/lib/actions/family-actions'
import { toast } from 'sonner'
import { Loader2, Link2Off } from 'lucide-react'

interface UnlinkButtonProps {
  profileId: string
  profileName: string
  dojoName: string
}

export function UnlinkButton({ profileId, profileName, dojoName }: UnlinkButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleUnlink = () => {
    if (confirm(`${profileName}님을 ${dojoName}에서 연결 해제 요청하시겠습니까?`)) {
      startTransition(async () => {
        const result = await requestUnlink(profileId)

        if (result?.error) {
          toast.error(result.error)
        } else {
          toast.success('연결 해제 요청이 전송되었습니다. 관리자 승인 후 완료됩니다.')
        }
      })
    }
  }

  return (
    <button
      onClick={handleUnlink}
      disabled={isPending}
      className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition disabled:opacity-50 min-h-[44px]"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Link2Off className="w-4 h-4 mr-2" />
      )}
      도장 연결 해제 요청
    </button>
  )
}
