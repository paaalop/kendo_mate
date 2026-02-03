import { Pin } from 'lucide-react';
import { NoticeWithAuthor } from '@/lib/types/community';

interface NoticeCardProps {
  notice: NoticeWithAuthor;
}

export function NoticeCard({ notice }: NoticeCardProps) {
  return (
    <div className={`p-4 rounded-lg border ${notice.is_pinned ? "border-blue-200 bg-blue-50/50" : "border-gray-200 bg-white shadow-sm"}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {notice.is_pinned && <Pin className="w-4 h-4 text-blue-500 rotate-45" />}
          <h3 className="font-semibold text-lg leading-tight">{notice.title}</h3>
        </div>
        {notice.is_pinned && (
           <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
             공지
           </span>
        )}
      </div>
      <div className="text-xs text-gray-500 flex gap-2 mb-2">
        <span>{notice.author?.name || '관리자'}</span>
        <span>•</span>
        <span>{new Date(notice.created_at).toLocaleDateString('ko-KR')}</span>
      </div>
      <div className="text-sm text-gray-700 whitespace-pre-wrap">
        {notice.content}
      </div>
    </div>
  );
}
