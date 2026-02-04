'use client';

import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Heart, MessageSquare, ImageIcon, MoreVertical, AlertTriangle, Trash2, Eye } from 'lucide-react';
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
        <div className="p-5 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md hover:border-blue-100 transition-all relative overflow-hidden">
          
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                post.category === 'FREE' ? 'bg-gray-100 text-gray-600' : 
                post.category === 'QUESTION' ? 'bg-orange-100 text-orange-600' : 
                'bg-green-100 text-green-600'
              }`}>
                {post.category === 'FREE' ? '자유' : post.category === 'QUESTION' ? '질문' : '운동'}
              </span>
              <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{post.title}</h3>
              {post.image_url && <ImageIcon className="w-3.5 h-3.5 text-gray-300" />}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-400 whitespace-nowrap">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko })}
              </span>
              
              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1.5 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
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
          
          <div className="flex gap-4 mb-4">
             <div className="flex-1">
                <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem] whitespace-pre-wrap leading-relaxed">{post.content}</p>
             </div>
             {post.image_url && (
                <div className="flex-shrink-0 w-20 h-20 relative rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                   <Image src={post.image_url} alt="Thumbnail" fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="80px" unoptimized />
                </div>
             )}
          </div>
          
          <div className="flex justify-between items-center text-[12px] text-gray-400 pt-3 border-t border-gray-50">
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-600">{post.author?.name || '익명'}</span>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleLike}
                  className={`flex items-center gap-1 hover:text-red-500 transition-colors ${isLiked ? 'text-red-500 font-medium' : ''}`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likesCount}</span>
                </button>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{post.comments_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{post.view_count || 0}</span>
                </div>
              </div>
            </div>
            {isEdited && <span className="text-[10px] bg-gray-50 px-1.5 py-0.5 rounded italic">(수정됨)</span>}
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