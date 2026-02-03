import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { LinkRequestCard } from '@/components/admin/link-request-card'

export default async function AdminLinksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get current staff profile and dojo_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, dojo_id')
    .eq('user_id', user.id)
    .in('role', ['owner', 'instructor'])
    .single()

  if (!profile || !profile.dojo_id) {
    redirect('/')
  }

  // Fetch pending link/unlink requests for this dojo
  const { data: requests } = await supabase
    .from('link_requests')
    .select('*')
    .eq('target_dojo_id', profile.dojo_id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">연결 요청 관리</h1>
        <p className="text-gray-600 mt-2">
          보호자의 관원 연결 및 해제 요청을 처리합니다.
        </p>
      </div>

      <div className="space-y-4">
        {requests && requests.length > 0 ? (
          requests.map((request) => (
            <LinkRequestCard key={request.id} request={request} />
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">대기 중인 요청이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}
