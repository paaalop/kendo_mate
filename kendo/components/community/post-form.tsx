'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPostSchema } from '@/lib/validations/community';
import { z } from 'zod';
import { createPost, updatePost } from '@/lib/actions/community';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { PostWithAuthor } from '@/lib/types/community';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface PostFormProps {
  initialData?: PostWithAuthor;
}

export function PostForm({ initialData }: PostFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image_url || null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const form = useForm<z.infer<typeof createPostSchema>>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      category: (initialData?.category as "FREE" | "QUESTION" | "EXERCISE") || 'FREE',
      imageUrl: initialData?.image_url || undefined,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      setFileToUpload(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setFileToUpload(null);
    setPreviewUrl(null);
    form.setValue('imageUrl', undefined); // Clear URL if editing
  };

  async function onSubmit(data: z.infer<typeof createPostSchema>) {
    setIsSubmitting(true);
    try {
      let imageUrl = data.imageUrl; // Keep existing URL if not changed

      if (fileToUpload) {
        const supabase = createClient();
        const fileExt = fileToUpload.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('community-images')
          .upload(fileName, fileToUpload);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('community-images')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      } else if (!previewUrl) {
        // If no file uploaded and no preview (removed), clear imageUrl
        imageUrl = undefined;
      }

      const postData = { ...data, imageUrl };

      const result = initialData 
        ? await updatePost(initialData.id, postData)
        : await createPost(postData);

      if (result.success) {
        toast.success(initialData ? '게시글이 수정되었습니다.' : '게시글이 등록되었습니다.');
        router.push('/community');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error(error);
      toast.error('오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-700 block ml-1">카테고리</label>
          <div className="flex flex-wrap gap-2">
            {['FREE', 'QUESTION', 'EXERCISE'].map((cat) => (
              <label key={cat} className={`
                px-5 py-2 rounded-full text-sm font-bold cursor-pointer border transition-all
                ${form.watch('category') === cat 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-100' 
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
              `}>
                <input 
                  type="radio" 
                  value={cat} 
                  {...form.register('category')} 
                  className="hidden"
                />
                {cat === 'FREE' ? '자유' : cat === 'QUESTION' ? '질문' : '운동'}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 block ml-1">제목</label>
          <input 
            {...form.register('title')} 
            placeholder="제목을 입력하세요" 
            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all text-sm"
          />
          {form.formState.errors.title && (
            <p className="text-xs text-red-500 ml-1">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 block ml-1">내용</label>
          <textarea 
            {...form.register('content')} 
            placeholder="내용을 입력하세요" 
            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all text-sm min-h-[300px] resize-none"
          />
          {form.formState.errors.content && (
            <p className="text-xs text-red-500 ml-1">{form.formState.errors.content.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-700 block ml-1">이미지</label>
          {previewUrl ? (
            <div className="relative w-full aspect-video bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group">
              <Image 
                src={previewUrl} 
                alt="Preview" 
                fill 
                className="object-contain"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <button
                    type="button"
                    onClick={removeImage}
                    className="p-3 bg-white/90 text-red-500 rounded-full hover:bg-white shadow-lg transition-transform hover:scale-110"
                  >
                    <X className="w-6 h-6" />
                  </button>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-blue-200 transition-all group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="p-3 bg-gray-50 rounded-full mb-3 group-hover:bg-blue-50 transition-colors">
                  <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                </div>
                <p className="text-sm font-medium text-gray-500 group-hover:text-gray-600">클릭하여 이미지 업로드</p>
                <p className="text-[11px] text-gray-400 mt-1">최대 5MB, JPG/PNG/WebP</p>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button 
          type="button" 
          onClick={() => router.back()}
          className="px-6 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
        >
          취소
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-all shadow-sm hover:shadow-blue-100"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {initialData ? '수정하기' : '등록하기'}
        </button>
      </div>
    </form>
  );
}

