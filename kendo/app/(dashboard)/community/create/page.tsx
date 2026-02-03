import { PostForm } from '@/components/community/post-form';

export default function CreatePostPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">게시글 작성</h1>
      <PostForm />
    </div>
  );
}
