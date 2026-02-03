import { PostForm } from '@/components/community/post-form';
import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (!post) notFound();

  // Check auth
  if (post.author_id !== user.id) {
    // Check if admin? Owner can edit/delete generally?
    // Spec says Owner can Delete. Edit usually Author only.
    // T026 says "Implement deletePost (Owner/Instructor overrides)".
    // Edit page implies author only for now.
    redirect('/'); 
  }
  
  // Cast to PostWithAuthor
  const postData = { ...post, author: null, likes_count: 0, comments_count: 0, is_liked: false };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">게시글 수정</h1>
      <PostForm initialData={postData} />
    </div>
  );
}
