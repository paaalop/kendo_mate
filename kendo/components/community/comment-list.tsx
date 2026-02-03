'use client';

import { CommentWithAuthor } from '@/lib/types/community';
import { CommentForm } from './comment-form';
import { useState, useOptimistic, useTransition } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Heart, Reply, Trash2 } from 'lucide-react';
import { toggleLike, deleteComment, createComment } from '@/lib/actions/community';
import { toast } from 'sonner';

interface CommentListProps {
  comments: CommentWithAuthor[];
  postId: string;
  currentUserId?: string;
  isOwnerOrInstructor?: boolean;
}

function CommentItem({ comment, replies, postId, currentUserId, isOwnerOrInstructor }: { comment: CommentWithAuthor, replies: CommentWithAuthor[], postId: string, currentUserId?: string, isOwnerOrInstructor?: boolean }) {
  const [isReplying, setIsReplying] = useState(false);
  const [isLiked, setIsLiked] = useState(comment.is_liked);
  const [likesCount, setLikesCount] = useState(comment.likes_count);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  const handleLike = async () => {
    if (isLikeLoading) return;
    const previousLiked = isLiked;
    const previousCount = likesCount;
    
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    setIsLikeLoading(true);

    try {
      const result = await toggleLike('comment', comment.id);
      if (!result.success) throw new Error(result.error);
    } catch {
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      toast.error('좋아요 실패');
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      const result = await deleteComment(comment.id);
      if (result.success) {
        toast.success('댓글이 삭제되었습니다.');
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('삭제 실패');
    }
  };

  const isAuthor = currentUserId === comment.author_id;
  const canDelete = isAuthor || isOwnerOrInstructor;

  return (
    <div className="py-4 border-b last:border-0 group">
      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-2">
          <span className="font-semibold text-sm">{comment.author?.name || '익명'}</span>
          <span className="text-xs text-gray-500 self-center">
            {comment.id.startsWith('temp-') ? '방금 전' : formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ko })}
          </span>
        </div>
        {canDelete && !comment.id.startsWith('temp-') && (
           <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 className="w-3 h-3" />
           </button>
        )}
      </div>
      <p className="text-sm text-gray-800 mb-2 whitespace-pre-wrap">{comment.content}</p>
      
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
        <button 
          onClick={handleLike} 
          disabled={comment.id.startsWith('temp-')}
          className={`flex items-center gap-1 hover:text-red-500 ${isLiked ? 'text-red-500' : ''} disabled:opacity-50`}
        >
          <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likesCount}</span>
        </button>
        {/* Reply button only for top-level comments */}
        {!comment.parent_id && (
           <button 
             onClick={() => setIsReplying(!isReplying)} 
             disabled={comment.id.startsWith('temp-')}
             className="flex items-center gap-1 hover:text-black disabled:opacity-50"
           >
             <Reply className="w-3 h-3" />
             <span>답글</span>
           </button>
        )}
      </div>

      {isReplying && (
        <div className="pl-4 mt-2 mb-2 border-l-2 border-gray-100">
          <CommentForm 
             postId={postId} 
             parentId={comment.id} 
             onSuccess={() => setIsReplying(false)} 
             placeholder="답글을 입력하세요..." 
          />
        </div>
      )}

      {replies.length > 0 && (
        <div className="pl-4 mt-2 space-y-4 border-l-2 border-gray-100">
           {replies.map(reply => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                replies={[]} 
                postId={postId} 
                currentUserId={currentUserId}
                isOwnerOrInstructor={isOwnerOrInstructor}
              />
           ))}
        </div>
      )}
    </div>
  );
}

export function CommentList({ comments: initialComments, postId, currentUserId, isOwnerOrInstructor }: CommentListProps) {
  const [_, startTransition] = useTransition();
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    initialComments,
    (state, newComment: CommentWithAuthor) => [...state, newComment]
  );

  const handleAddComment = async (content: string, parentId?: string) => {
    const tempId = `temp-${Date.now()}`;
    const newComment: CommentWithAuthor = {
      id: tempId,
      content,
      post_id: postId,
      parent_id: parentId || null,
      author_id: currentUserId || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: { name: '본인' }, // Placeholder
      likes_count: 0,
      is_liked: false
    };

    startTransition(() => {
      addOptimisticComment(newComment);
    });
    
    try {
      const result = await createComment({ content, postId, parentId });
      if (!result.success) throw new Error(result.error);
    } catch (err) {
      toast.error('댓글 등록 실패');
      console.error(err);
    }
  };

  // Group comments
  const sortedComments = [...optimisticComments].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const topLevelComments = sortedComments.filter(c => !c.parent_id);
  const replies = sortedComments.filter(c => c.parent_id);
  
  const getReplies = (parentId: string) => replies.filter(r => r.parent_id === parentId);

  return (
    <div className="space-y-4">
      {/* Top Level Form */}
      <div className="mb-6">
         <CommentForm postId={postId} onAddOptimistic={handleAddComment} />
      </div>

      <div className="divide-y">
        {topLevelComments.map(comment => (
           <CommentItem 
             key={comment.id} 
             comment={comment} 
             replies={getReplies(comment.id)} 
             postId={postId}
             currentUserId={currentUserId}
             isOwnerOrInstructor={isOwnerOrInstructor}
           />
        ))}
      </div>
    </div>
  );
}
