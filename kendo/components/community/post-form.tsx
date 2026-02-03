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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <label className="text-sm font-medium block">카테고리</label>
        <div className="flex gap-2">
          {['FREE', 'QUESTION', 'EXERCISE'].map((cat) => (
            <label key={cat} className={`
              px-4 py-2 rounded-full text-sm font-medium cursor-pointer border transition-colors
              ${form.watch('category') === cat 
                ? 'bg-black text-white border-black' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}
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

      <div className="space-y-2">
        <label className="text-sm font-medium block">이미지 첨부</label>
        {previewUrl ? (
          <div className="relative w-full h-64 bg-gray-100 rounded-md overflow-hidden border">
            <Image 
              src={previewUrl} 
              alt="Preview" 
              fill 
              className="object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">클릭하여 이미지 업로드 (최대 5MB)</p>
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

      <div className="flex justify-end gap-2 pt-4">
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
          className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {initialData ? '수정' : '등록'}
        </button>
      </div>
    </form>
  );
}
