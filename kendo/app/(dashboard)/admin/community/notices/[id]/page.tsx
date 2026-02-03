import { NoticeForm } from '@/components/community/notice-form';
import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditNoticePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  
  // Verify ownership/role
  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
  if (!profile || !profile.role || !['owner', 'instructor'].includes(profile.role)) {
    redirect('/'); 
  }

  // Fetch notice
  const { data: notice } = await supabase
    .from('notices')
    .select('*')
    .eq('id', id)
    .single();

  if (!notice) notFound();

  // Ensure notice belongs to user's dojo
  if (notice.dojo_id !== profile.dojo_id) {
    notFound();
  }

  // Cast to NoticeWithAuthor (author name not needed for edit form initial values)
  // We need to match the type expected by NoticeForm
  const noticeData = { ...notice, author: null }; 

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">공지사항 수정</h1>
      <NoticeForm initialData={noticeData} />
    </div>
  );
}
