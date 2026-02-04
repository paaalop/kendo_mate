import { createClient } from '@/utils/supabase/server'
import { LinkRequestCard } from '@/components/admin/link-request-card'

export default async function RequestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>Unauthorized</div>

  // Fetch requests for dojos owned by user
  // We need requests where profile -> dojo -> owner = user
  const { data: requests, error } = await supabase
    .from('link_requests')
    .select(`
      *,
      profiles!inner(
        name,
        birthdate,
        dojo_id,
        dojos!inner(owner_id)
      )
    `)
    .eq('profiles.dojos.owner_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return <div>요청을 불러오는 중 오류가 발생했습니다.</div>
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">승인 대기 중인 연결 요청</h1>
      
      {requests && requests.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">대기 중인 요청이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests?.map(req => (
            <LinkRequestCard key={req.id} request={req} />
          ))}
        </div>
      )}
    </div>
  )
}
