import { CreateProfileForm } from '@/components/onboarding/create-profile-form'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreateFamilyProfilePage() {
  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <div className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          돌아가기
        </Link>
      </div>

      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900">가상 프로필 생성</h1>
        <p className="text-gray-600 mt-2">
          자녀 또는 관리할 구성원의 프로필을 생성합니다.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <CreateProfileForm />
      </div>
      
      <p className="mt-6 text-xs text-gray-400 text-center">
        생성 후 도장에 연결 요청을 보낼 수 있습니다.
      </p>
    </div>
  )
}
