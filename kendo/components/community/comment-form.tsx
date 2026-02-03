'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCommentSchema } from '@/lib/validations/community';
import { z } from 'zod';
import { createComment } from '@/lib/actions/community';
import { toast } from 'sonner';
import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSuccess?: () => void;
  onAddOptimistic?: (content: string, parentId?: string) => Promise<void>;
  placeholder?: string;
}

export function CommentForm({ postId, parentId, onSuccess, onAddOptimistic, placeholder = "댓글을 입력하세요..." }: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof createCommentSchema>>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      content: '',
      postId,
      parentId,
    },
  });

  async function onSubmit(data: z.infer<typeof createCommentSchema>) {
    const content = data.content.trim();
    if (!content) return;

    if (onAddOptimistic) {
      form.reset();
      onSuccess?.();
      await onAddOptimistic(content, parentId);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createComment(data);
      if (result.success) {
        form.reset();
        onSuccess?.();
        toast.success('댓글이 등록되었습니다.');
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
      <div className="flex-1">
        <textarea
          {...form.register('content')}
          placeholder={placeholder}
          className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black min-h-[40px] resize-none"
          onKeyDown={(e) => {
             if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                form.handleSubmit(onSubmit)();
             }
          }}
        />
        {form.formState.errors.content && (
          <p className="text-xs text-red-500 mt-1">{form.formState.errors.content.message}</p>
        )}
      </div>
      <button 
        type="submit" 
        disabled={isSubmitting || !form.watch('content').trim()}
        className="p-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
      >
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      </button>
    </form>
  );
}
