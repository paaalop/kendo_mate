import { NoticeForm } from '@/components/community/notice-form';

export default function CreateNoticePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">공지사항 작성</h1>
      <NoticeForm />
    </div>
  );
}
