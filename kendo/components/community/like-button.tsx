'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toggleLike } from '@/lib/actions/community';
import { toast } from 'sonner';

interface LikeButtonProps {
  postId: string;
  initialIsLiked: boolean;
  initialLikesCount: number;
}

export function LikeButton({ postId, initialIsLiked, initialLikesCount }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (isLoading) return;

    const previousLiked = isLiked;
    const previousCount = likesCount;

    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    setIsLoading(true);

    try {
      const result = await toggleLike('post', postId);
      if (!result.success) throw new Error(result.error);
    } catch {
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      toast.error('좋아요 처리에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors border ${
        isLiked 
          ? 'bg-red-50 border-red-200 text-red-500' 
          : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'
      }`}
    >
      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
      <span className="text-sm font-medium">{likesCount}</span>
    </button>
  );
}
