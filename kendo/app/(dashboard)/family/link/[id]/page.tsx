import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { LinkDojoSearch } from '@/components/dashboard/link-dojo-search'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

interface LinkProfilePageProps {
  params: Promise<{ id: string }>
}

export default async function LinkProfilePage({ params }: LinkProfilePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, birthdate, is_shadow')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!profile) {
    notFound()
  }

  if (!profile.is_shadow) {
    // If it's already a formal member (linked), don't allow linking again?
    // Or maybe it is linked but we want to link to ANOTHER dojo? 
    // Spec says Shadow Profiles are for initial linking.
  }

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
        <h1 className="text-2xl font-bold text-gray-900">{profile.name} 연결하기</h1>
        <p className="text-gray-600 mt-2">
          연결할 도장을 검색해 주세요.
        </p>
      </div>

      <LinkDojoSearch 
        profileId={profile.id} 
        profileName={profile.name} 
        profileBirthdate={profile.birthdate || ''} 
      />
    </div>
  )
}
