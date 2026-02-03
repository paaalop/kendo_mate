import { getReports } from '@/lib/actions/community';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { ReportWithDetails } from '@/lib/types/community';

export default async function ReportManagementPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role, dojo_id').eq('user_id', user.id).single();
  if (!profile || !profile.role || !['owner', 'instructor'].includes(profile.role)) {
    redirect('/'); 
  }

  const { data: reports, success, error } = await getReports();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">신고 관리</h1>

      {!success ? (
        <div className="text-red-500">{error}</div>
      ) : reports?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 border rounded-lg bg-gray-50">
          <CheckCircle className="w-12 h-12 mb-4 text-green-500" />
          <p>처리할 신고 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {(reports as ReportWithDetails[])?.map((report) => (
             <div key={report.id} className="p-4 border rounded-lg bg-white shadow-sm flex flex-col gap-2">
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-2 text-sm text-gray-500">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span>{formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: ko })}</span>
                      <span>•</span>
                      <span>신고자: {report.reporter?.name || '익명'}</span>
                   </div>
                   <div className="flex gap-2">
                      <Link 
                        href={`/community/${report.post_id}`} 
                        className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        게시글 보기
                      </Link>
                   </div>
                </div>
                
                <div className="p-3 bg-red-50 rounded-md text-sm text-red-800 border border-red-100">
                   <span className="font-semibold">신고 사유:</span> {report.reason}
                </div>

                <div className="mt-2 pt-2 border-t">
                   <p className="text-xs text-gray-500 mb-1">대상 게시글:</p>
                   <p className="font-medium text-sm line-clamp-1">{report.post?.title || '삭제된 게시글'}</p>
                   <p className="text-sm text-gray-600 line-clamp-2">{report.post?.content || ''}</p>
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
