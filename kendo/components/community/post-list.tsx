'use client';

import { PostWithAuthor } from '@/lib/types/community';
import { PostCard } from './post-card';
import { useState } from 'react';
import { getPosts } from '@/lib/actions/community';
import { Loader2 } from 'lucide-react';

interface PostListProps {
  initialPosts: PostWithAuthor[];
  dojoId: string;
  total: number;
  currentUserId: string;
  isOwnerOrInstructor: boolean;
  search?: string;
  category?: string;
}

export function PostList({ 
  initialPosts, 
  dojoId, 
  total, 
  currentUserId, 
  isOwnerOrInstructor,
  search,
  category
}: PostListProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length < total);

  // Sync state with props when filters change and parent re-fetches
  // REMOVED: Managed by parent key prop


  const loadMore = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    const nextPage = page + 1;
    
    const result = await getPosts(dojoId, nextPage, { search, category });
    
    if (result.success && result.data) {
      const newPosts = result.data;
      setPosts(prev => [...prev, ...newPosts]);
      setPage(nextPage);
      
      // Check total from server or infer
      const newTotal = result.total || total;
      if (posts.length + newPosts.length >= newTotal) {
        setHasMore(false);
      }
    } else {
       setHasMore(false);
    }
    setIsLoading(false);
  };

  if (posts.length === 0) {
    return (
      <div className="p-8 border rounded-lg bg-gray-50 text-center text-gray-500">
        등록된 게시글이 없습니다. 첫 글을 작성해보세요!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <PostCard 
          key={post.id} 
          post={post} 
          currentUserId={currentUserId}
          isOwnerOrInstructor={isOwnerOrInstructor}
        />
      ))}
      
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button 
            onClick={loadMore} 
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-black disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '더 보기'}
          </button>
        </div>
      )}
    </div>
  );
}
