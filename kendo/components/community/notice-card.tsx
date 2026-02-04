import { Pin } from 'lucide-react';
import { NoticeWithAuthor } from '@/lib/types/community';

interface NoticeCardProps {
  notice: NoticeWithAuthor;
}

export function NoticeCard({ notice }: NoticeCardProps) {
  return (
    <div className={`p-5 rounded-xl border transition-all ${
      notice.is_pinned 
        ? "border-blue-100 bg-blue-50/30 hover:bg-blue-50/50 shadow-sm" 
        : "border-gray-100 bg-white shadow-sm hover:shadow-md"
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {notice.is_pinned && <Pin className="w-3.5 h-3.5 text-blue-500" />}
          <h3 className={`font-bold leading-tight ${notice.is_pinned ? "text-blue-900" : "text-gray-900"}`}>
            {notice.title}
          </h3>
        </div>
        {notice.is_pinned && (
           <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500 text-white rounded-full uppercase tracking-wider">
             NOTICE
           </span>
        )}
      </div>
      <div className="text-[12px] text-gray-400 flex items-center gap-2 mb-3">
        <span className="font-medium text-gray-600">{notice.author?.name || '관리자'}</span>
        <span className="text-gray-200">•</span>
        <span>{new Date(notice.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
      <div className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
        {notice.content}
      </div>
    </div>
  );
}

