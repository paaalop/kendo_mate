import { PostForm } from '@/components/community/post-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreatePostPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/community" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
           <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">게시글 작성</h1>
      </div>
      <PostForm />
    </div>
  );
}
