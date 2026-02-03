'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createShadowProfileSchema, CreateShadowProfileValues } from '@/lib/validations/family'
import { useState, useTransition } from 'react'
import { createShadowProfile } from '@/lib/actions/family-actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function CreateProfileForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateShadowProfileValues>({
    resolver: zodResolver(createShadowProfileSchema),
    defaultValues: {
      name: '',
      birthdate: '',
    },
  })

  const onSubmit = async (data: CreateShadowProfileValues) => {
    setServerError(null)
    
    startTransition(async () => {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('birthdate', data.birthdate)

      const result = await createShadowProfile(null, formData)

      if (result?.error) {
        setServerError(result.error)
        toast.error(result.error)
      } else {
        toast.success('프로필이 생성되었습니다.')
        router.push('/') // Redirect to dashboard to see the profile
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {serverError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          자녀 이름
        </label>
        <input
          {...register('name')}
          className="w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="실명을 입력해주세요"
          disabled={isPending}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          생년월일
        </label>
        <input
          {...register('birthdate')}
          type="date"
          className="w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isPending}
        />
        <p className="mt-1 text-[10px] text-gray-400">자녀의 생년월일을 선택해주세요.</p>
        {errors.birthdate && (
          <p className="mt-1 text-xs text-red-500">{errors.birthdate.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 font-bold min-h-[44px]"
      >
        {isPending ? '생성 중...' : '프로필 생성하기'}
      </button>
    </form>
  )
}
