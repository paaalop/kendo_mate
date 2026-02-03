import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getNotices } from '@/lib/actions/community';
import { NoticeCard } from '@/components/community/notice-card';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function AdminNoticesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  
  // Fetch profile to get dojo_id
  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
  if (!profile || !profile.role || !['owner', 'instructor'].includes(profile.role) || !profile.dojo_id) {
    redirect('/'); // Unauthorized
  }

  const { data: notices, success, error } = await getNotices(profile.dojo_id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">공지사항 관리</h1>
        <Link 
          href="/admin/community/notices/create"
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" />
          공지 작성
        </Link>
      </div>

      {!success ? (
        <div className="text-red-500">{error}</div>
      ) : notices?.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border rounded-lg">
          등록된 공지사항이 없습니다.
        </div>
      ) : (
        <div className="grid gap-4">
          {notices?.map((notice) => (
             <Link key={notice.id} href={`/admin/community/notices/${notice.id}`} className="block transition-opacity hover:opacity-80">
               <NoticeCard notice={notice} />
             </Link>
          ))}
        </div>
      )}
    </div>
  );
}
