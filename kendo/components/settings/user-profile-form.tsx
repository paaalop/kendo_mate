'use client'

import { useState } from 'react'
import { updateMyProfile } from '@/app/(dashboard)/settings/profile/actions'
import { useRouter } from 'next/navigation'

interface UserProfileFormProps {
  initialData: {
    name: string
    phone: string
  }
}

export function UserProfileForm({ initialData }: UserProfileFormProps) {
  const [formData, setFormData] = useState(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await updateMyProfile(formData)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: '프로필이 성공적으로 수정되었습니다.' })
        router.refresh()
      }
    } catch (err) {
      setMessage({ type: 'error', text: '예기치 않은 오류가 발생했습니다.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">이름</label>
          <input
            type="text"
            className="w-full border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 transition-all"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">연락처</label>
          <input
            type="tel"
            placeholder="010-0000-0000"
            className="w-full border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 transition-all"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            자녀 연결을 위해 도장에 등록된 보호자 연락처와 일치해야 합니다.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold disabled:opacity-50 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
      >
        {isLoading ? '저장 중...' : '프로필 정보 저장'}
      </button>

      {message && (
        <div className={`p-4 rounded-xl text-center text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}
    </form>
  )
}
