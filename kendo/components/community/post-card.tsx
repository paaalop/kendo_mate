'use client';

import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Heart, MessageSquare, ImageIcon, MoreVertical, AlertTriangle, Trash2 } from 'lucide-react';
import { PostWithAuthor } from '@/lib/types/community';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { toggleLike, deletePost, reportPost } from '@/lib/actions/community';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from 'next/navigation';

interface PostCardProps {
  post: PostWithAuthor;
  currentUserId?: string;
  isOwnerOrInstructor?: boolean;
}

export function PostCard({ post, currentUserId, isOwnerOrInstructor }: PostCardProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (isLikeLoading) return;

    const previousLiked = isLiked;
    const previousCount = likesCount;
    
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    setIsLikeLoading(true);

    try {
      const result = await toggleLike('post', post.id);
      if (!result.success) throw new Error(result.error);
    } catch {
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      toast.error('좋아요 실패');
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const result = await deletePost(post.id);
      if (result.success) {
        toast.success('게시글이 삭제되었습니다.');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('삭제 실패');
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast.error("신고 사유를 입력해주세요.");
      return;
    }

    try {
      const result = await reportPost({ postId: post.id, reason: reportReason });
      if (result.success) {
        toast.success("신고가 접수되었습니다.");
        setIsReportDialogOpen(false);
        setReportReason("");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("신고 실패");
    }
  };

  const isAuthor = currentUserId === post.author_id;
  const canDelete = isAuthor || isOwnerOrInstructor;
  const isEdited = new Date(post.updated_at).getTime() > new Date(post.created_at).getTime() + 60000;

  return (
    <>
      <Link href={`/community/${post.id}`} className="block group">
        <div className="p-4 border rounded-lg bg-white shadow-sm hover:border-gray-300 transition-colors relative">
          
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                post.category === 'FREE' ? 'bg-gray-100 text-gray-700' : 
                post.category === 'QUESTION' ? 'bg-orange-100 text-orange-700' : 
                'bg-green-100 text-green-700'
              }`}>
                {post.category === 'FREE' ? '자유' : post.category === 'QUESTION' ? '질문' : '운동'}
              </span>
              <h3 className="font-semibold text-lg leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors">{post.title}</h3>
              {post.image_url && <ImageIcon className="w-4 h-4 text-gray-400" />}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko })}
              </span>
              
              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 hover:bg-gray-100 rounded-full">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canDelete && (
                      <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        삭제
                      </DropdownMenuItem>
                    )}
                    {!isAuthor && (
                      <DropdownMenuItem onClick={() => setIsReportDialogOpen(true)}>
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        신고
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
             <div className="flex-1">
                <p className="text-sm text-gray-600 line-clamp-2 mb-3 min-h-[1.25rem] whitespace-pre-wrap">{post.content}</p>
             </div>
             {post.image_url && (
                <div className="flex-shrink-0 w-16 h-16 relative rounded-md overflow-hidden bg-gray-100 border">
                   <Image src={post.image_url} alt="Thumbnail" fill className="object-cover" sizes="64px" unoptimized />
                </div>
             )}
          </div>
          
          <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
            <div className="flex items-center gap-4">
              <span>{post.author?.name || '익명'}</span>
              <button 
                onClick={handleLike}
                className={`flex items-center gap-1 hover:text-red-500 transition-colors p-1 -ml-1 ${isLiked ? 'text-red-500' : ''}`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likesCount}</span>
              </button>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{post.comments_count}</span>
              </div>
            </div>
            {isEdited && <span>(수정됨)</span>}
          </div>
        </div>
      </Link>

      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>게시글 신고</DialogTitle>
            <DialogDescription>
              부적절한 게시글을 신고해주세요. 관리자 검토 후 조치됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="신고 사유를 입력하세요..."
              className="w-full p-2 border rounded-md h-24 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => setIsReportDialogOpen(false)}
              className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100"
            >
              취소
            </button>
            <button
              onClick={handleReport}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
            >
              신고하기
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}