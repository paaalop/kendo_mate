import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ChevronLeft, Building2 } from 'lucide-react'
import Link from 'next/link'

interface ProfileSettingsPageProps {
  params: Promise<{ id: string }>
}

export default async function ProfileSettingsPage({ params }: ProfileSettingsPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, is_shadow, dojo_id, dojos(name)')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!profile) {
    notFound()
  }

  const dojoName = (profile.dojos as unknown as { name: string })?.name

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
        <h1 className="text-2xl font-bold text-gray-900">{profile.name} 설정</h1>
        <p className="text-gray-600 mt-2">
          프로필 정보 및 도장 연결을 관리합니다.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">도장 연결 정보</h2>
          
          {profile.dojo_id ? (
            <div className="space-y-6">
              <div className="flex items-center p-4 bg-blue-50 rounded-xl">
                <Building2 className="w-5 h-5 text-blue-600 mr-3" />
                <span className="font-bold text-blue-900">{dojoName}</span>
              </div>
              
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-4">현재 연결된 도장이 없습니다.</p>
              <Link 
                href="/family/link"
                className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition min-h-[44px]"
              >
                도장 연결하러 가기
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
