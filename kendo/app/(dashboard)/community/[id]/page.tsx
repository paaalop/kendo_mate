import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Heart, MessageSquare, MoreHorizontal, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getComments } from '@/lib/actions/community';
import { CommentList } from '@/components/community/comment-list';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch Post with Author, Likes count
  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      *,
      post_likes(count),
      comments(count)
    `)
    .eq('id', id)
    .single();

  if (!post || error) notFound();

  // Fetch Author profile
  const { data: authorProfile } = await supabase.from('profiles').select('name, role, dojo_id').eq('user_id', post.author_id).single();
  const authorName = authorProfile?.name || '알 수 없음';
  
  // Current user role
  const { data: userProfile } = await supabase.from('profiles').select('role, dojo_id').eq('user_id', user.id).single();
  const isOwnerOrInstructor = !!(userProfile && userProfile.role && ['owner', 'instructor'].includes(userProfile.role) && userProfile.dojo_id === post.dojo_id);

  // Check if liked
  const { data: like } = await supabase.from('post_likes').select('post_id').eq('post_id', id).eq('user_id', user.id).single();
  const isLiked = !!like;

  const likesCount = post.post_likes?.[0]?.count || 0;
  const commentsCount = post.comments?.[0]?.count || 0;
  const isAuthor = post.author_id === user.id;

  // Fetch Comments
  const { data: comments } = await getComments(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/community" className="p-2 hover:bg-gray-100 rounded-full">
           <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">글 상세</h1>
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
             <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              post.category === 'FREE' ? 'bg-gray-100 text-gray-700' : 
              post.category === 'QUESTION' ? 'bg-orange-100 text-orange-700' : 
              'bg-green-100 text-green-700'
            }`}>
               {post.category === 'FREE' ? '자유' : post.category === 'QUESTION' ? '질문' : '운동'}
            </span>
            <div className="flex flex-col">
               <h2 className="text-xl font-bold">{post.title}</h2>
               <div className="text-xs text-gray-500 flex gap-2">
                 <span>{authorName}</span>
                 <span>•</span>
                 <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko })}</span>
               </div>
            </div>
          </div>
          {isAuthor && (
             <Link href={`/community/${id}/edit`} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                <MoreHorizontal className="w-5 h-5" />
             </Link>
          )}
        </div>

        <div className="prose max-w-none mb-6 text-gray-800 whitespace-pre-wrap">
           {post.content}
        </div>

        {post.image_url && (
          <div className="mb-6 rounded-lg overflow-hidden border bg-gray-50">
             <Image 
               src={post.image_url} 
               alt="Post image" 
               width={800}
               height={600}
               className="max-w-full h-auto mx-auto object-contain"
               unoptimized
             />
          </div>
        )}

        <div className="flex items-center gap-4 py-4 border-t border-b text-gray-500 text-sm">
           <div className="flex items-center gap-1">
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{likesCount}</span>
           </div>
           <div className="flex items-center gap-1">
              <MessageSquare className="w-5 h-5" />
              <span>{commentsCount}</span>
           </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
         <h3 className="font-semibold mb-4">댓글 {comments?.length || 0}개</h3>
         <CommentList 
            comments={comments || []} 
            postId={id} 
            currentUserId={user.id} 
            isOwnerOrInstructor={isOwnerOrInstructor}
         />
      </div>
    </div>
  );
}