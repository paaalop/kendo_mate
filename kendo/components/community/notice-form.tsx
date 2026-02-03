'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createNoticeSchema } from '@/lib/validations/community';
import { z } from 'zod';
import { createNotice, updateNotice } from '@/lib/actions/community';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { NoticeWithAuthor } from '@/lib/types/community';
import { useState } from 'react';

interface NoticeFormProps {
  initialData?: NoticeWithAuthor;
}

export function NoticeForm({ initialData }: NoticeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof createNoticeSchema>>({
    resolver: zodResolver(createNoticeSchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      isPinned: initialData?.is_pinned || false,
    },
  });

  async function onSubmit(data: z.infer<typeof createNoticeSchema>) {
    setIsSubmitting(true);
    try {
      const result = initialData 
        ? await updateNotice(initialData.id, data)
        : await createNotice(data);

      if (result.success) {
        toast.success(initialData ? '공지사항이 수정되었습니다.' : '공지사항이 등록되었습니다.');
        router.push('/admin/community/notices');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
      <div className="space-y-2">
        <label className="text-sm font-medium block">제목</label>
        <input 
          {...form.register('title')} 
          placeholder="제목을 입력하세요" 
          className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        {form.formState.errors.title && (
          <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium block">내용</label>
        <textarea 
          {...form.register('content')} 
          placeholder="내용을 입력하세요" 
          className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black min-h-[200px]"
        />
        {form.formState.errors.content && (
          <p className="text-sm text-red-500">{form.formState.errors.content.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input 
          type="checkbox"
          id="isPinned" 
          {...form.register('isPinned')}
          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
        />
        <label htmlFor="isPinned" className="text-sm font-medium leading-none cursor-pointer">
          상단 고정
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <button 
          type="button" 
          onClick={() => router.back()}
          className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-100"
        >
          취소
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {initialData ? '수정' : '등록'}
        </button>
      </div>
    </form>
  );
}
