'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { createNoticeSchema, createPostSchema, createCommentSchema } from '@/lib/validations/community';
import { z } from 'zod';
import { NoticeWithAuthor } from '@/lib/types/community';

async function getUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!profile) throw new Error("Profile not found");
  if (!profile.dojo_id) throw new Error("Dojo ID is required");
  if (!profile.role) throw new Error("Role is required");

  return { 
    user, 
    profile: profile as Omit<typeof profile, 'dojo_id' | 'role'> & { dojo_id: string; role: string } 
  };
}

export async function createNotice(data: z.infer<typeof createNoticeSchema>) {
  try {
    const { profile, user } = await getUserProfile();
    const validated = createNoticeSchema.parse(data);

    // Verify permission (Owner/Instructor) - RLS also enforces this, but good to fail early
    if (!['owner', 'instructor'].includes(profile.role)) {
      throw new Error("Permission denied");
    }

    const supabase = await createClient();
    const { error } = await supabase.from('notices').insert({
      title: validated.title,
      content: validated.content,
      is_pinned: validated.isPinned,
      dojo_id: profile.dojo_id,
      author_id: user.id,
    });

    if (error) throw error;

    revalidatePath('/community');
    revalidatePath('/admin/community/notices');
    return { success: true };
  } catch (error) {
    console.error('Error creating notice:', error);
    return { success: false, error: '공지사항 작성 중 오류가 발생했습니다.' };
  }
}

export async function updateNotice(id: string, data: Partial<z.infer<typeof createNoticeSchema>>) {
  try {
     // Validations are partial here because we might update only pinned status
    const supabase = await createClient();

    // Check auth via RLS implicitly, but we need dojo_id for revalidation if needed
    // or just revalidate generic paths.

    const { error } = await supabase
      .from('notices')
      .update({
        title: data.title,
        content: data.content,
        is_pinned: data.isPinned,
      })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/community');
    revalidatePath('/admin/community/notices');
    return { success: true };
  } catch (error) {
    console.error('Error updating notice:', error);
    return { success: false, error: '공지사항 수정 중 오류가 발생했습니다.' };
  }
}

export async function getNotices(dojoId: string): Promise<{ success: boolean; data?: NoticeWithAuthor[]; error?: string }> {
  try {
    const supabase = await createClient();

    // Fetch notices simply without join
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('dojo_id', dojoId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return { success: true, data: [] };

    // Manual join for author name
    const authorIds = [...new Set(data.map(n => n.author_id).filter(Boolean))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, name')
      .in('user_id', authorIds);

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    const noticesWithAuthor = data.map(notice => ({
      ...notice,
      author: notice.author_id ? { name: profileMap.get(notice.author_id)?.name || '알 수 없음' } : null
    }));

    return { success: true, data: noticesWithAuthor as NoticeWithAuthor[] };

  } catch (error) {
    console.error('Error fetching notices:', error);
    return { success: false, error: '공지사항을 불러오는데 실패했습니다.' };
  }
}

export async function createPost(data: z.infer<typeof createPostSchema>) {
  try {
    const { profile, user } = await getUserProfile();
    const validated = createPostSchema.parse(data);

    const supabase = await createClient();
    const { error } = await supabase.from('posts').insert({
      title: validated.title,
      content: validated.content,
      category: validated.category as "FREE" | "QUESTION" | "EXERCISE",
      image_url: validated.imageUrl || null,
      dojo_id: profile.dojo_id,
      author_id: user.id,
    });

    if (error) throw error;

    revalidatePath('/community');
    return { success: true };
  } catch (error) {
    console.error('Error creating post:', error);
    return { success: false, error: '게시글 작성 중 오류가 발생했습니다.' };
  }
}

export async function updatePost(id: string, data: Partial<z.infer<typeof createPostSchema>>) {
  try {
    const supabase = await createClient();
    const { user } = await getUserProfile(); // Check auth

    // Verify authorship
    const { data: post } = await supabase.from('posts').select('author_id').eq('id', id).single();
    if (!post) throw new Error("Post not found");
    if (post.author_id !== user.id) throw new Error("Unauthorized"); 

    const { error } = await supabase
      .from('posts')
      .update({
        title: data.title,
        content: data.content,
        category: data.category as "FREE" | "QUESTION" | "EXERCISE",
        image_url: data.imageUrl,
      })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/community');
    revalidatePath(`/community/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating post:', error);
    return { success: false, error: '게시글 수정 중 오류가 발생했습니다.' };
  }
}

export async function getPosts(dojoId: string, page: number = 1, options?: { search?: string; category?: string }) {
  try {
    const PAGE_SIZE = 10;
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch posts
    let query = supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .eq('dojo_id', dojoId);

    if (options?.category && options.category !== 'ALL') {
      query = query.eq('category', options.category as "FREE" | "QUESTION" | "EXERCISE");
    }

    if (options?.search) {
      query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Supabase getPosts error:', error);
      throw error;
    }

    if (!data || data.length === 0) return { success: true, data: [], total: 0 };

    const postIds = data.map(p => p.id);
    
    // Fetch Like Counts - Using a more efficient way if possible, or just checking error
    const { data: likeCounts, error: likesError } = await supabase
      .from('post_likes')
      .select('post_id')
      .in('post_id', postIds);
    
    if (likesError) console.error('Error fetching likes count:', likesError);
    
    // Fetch Comment Counts
    const { data: commentCounts, error: commentsError } = await supabase
      .from('comments')
      .select('post_id')
      .in('post_id', postIds);

    if (commentsError) console.error('Error fetching comments count:', commentsError);

    const likesMap = new Map();
    likeCounts?.forEach(l => likesMap.set(l.post_id, (likesMap.get(l.post_id) || 0) + 1));

    const commentsMap = new Map();
    commentCounts?.forEach(c => commentsMap.set(c.post_id, (commentsMap.get(c.post_id) || 0) + 1));

    // Fetch Authors
    const authorIds = [...new Set(data.map(p => p.author_id))];
    let profileMap = new Map();
    if (authorIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', authorIds);

      if (profilesError) console.error('Error fetching profiles:', profilesError);
      profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
    }

    // Check my likes
    const myLikes: Set<string> = new Set();
    if (user && data.length > 0) {
      const { data: likes, error: myLikesError } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      if (myLikesError) console.error('Error fetching my likes:', myLikesError);
      likes?.forEach(l => myLikes.add(l.post_id));
    }

    const postsWithDetails = data.map(post => ({
      ...post,
      author: { name: profileMap.get(post.author_id)?.name || '알 수 없음' },
      likes_count: likesMap.get(post.id) || 0,
      comments_count: commentsMap.get(post.id) || 0,
      is_liked: myLikes.has(post.id)
    }));

    return { success: true, data: postsWithDetails, total: count };

  } catch (error) {
    // If it's a PostgrestError, it might not have standard properties enumerable
    const pgError = error as { message?: string; code?: string; details?: string; hint?: string };
    console.error('Error fetching posts detailed:', {
      message: pgError.message || String(error),
      code: pgError.code,
      details: pgError.details,
      hint: pgError.hint
    });
    return { success: false, error: '게시글을 불러오는데 실패했습니다.' };
  }
}

export async function createComment(data: z.infer<typeof createCommentSchema>) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const validated = createCommentSchema.parse(data);

    const { error } = await supabase.from('comments').insert({
      post_id: validated.postId,
      author_id: user.id,
      content: validated.content,
      parent_id: validated.parentId
    });

    if (error) throw error;

    revalidatePath(`/community/${validated.postId}`);
    return { success: true };
  } catch (error) {
    console.error('Error creating comment:', error);
    return { success: false, error: '댓글 작성 중 오류가 발생했습니다.' };
  }
}

export async function updateComment(id: string, content: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Verify ownership
    const { data: comment } = await supabase.from('comments').select('author_id, post_id').eq('id', id).single();
    if (!comment) throw new Error("Comment not found");
    if (comment.author_id !== user.id) throw new Error("Unauthorized");

    const { error } = await supabase
      .from('comments')
      .update({ content })
      .eq('id', id);

    if (error) throw error;

    revalidatePath(`/community/${comment.post_id}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating comment:', error);
    return { success: false, error: '댓글 수정 중 오류가 발생했습니다.' };
  }
}

export async function getComments(postId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        comment_likes(count)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!data) return { success: true, data: [] };

    // Fetch Authors
    const authorIds = [...new Set(data.map(c => c.author_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, name')
      .in('user_id', authorIds);

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    // Check my likes
    const myLikes: Set<string> = new Set();
    if (user) {
      const { data: likes } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', user.id)
        .in('comment_id', data.map(c => c.id));

      likes?.forEach(l => myLikes.add(l.comment_id));
    }

    const commentsWithDetails = data.map(comment => ({
      ...comment,
      author: { name: profileMap.get(comment.author_id)?.name || '알 수 없음' },
      likes_count: comment.comment_likes?.[0]?.count || 0,
      is_liked: myLikes.has(comment.id)
    }));

    return { success: true, data: commentsWithDetails };
  } catch (error) {
    console.error('Error fetching comments:', error);
    return { success: false, error: '댓글을 불러오는데 실패했습니다.' };
  }
}

export async function toggleLike(type: 'post' | 'comment', id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const table = type === 'post' ? 'post_likes' : 'comment_likes';
    const idColumn = type === 'post' ? 'post_id' : 'comment_id';

    // Check if exists
    const { data: existing } = await supabase
      .from(table)
      .select('*')
      .eq(idColumn, id)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      // Unlike
      const { error } = await supabase.from(table).delete().eq(idColumn, id).eq('user_id', user.id);
      if (error) throw error;
    } else {
      // Like
      // Construct object carefully to match expected types
      const insertData = { [idColumn]: id, user_id: user.id }; 
      const { error } = await supabase.from(table).insert(insertData);
      if (error) throw error;
    }

    revalidatePath('/community');
    revalidatePath(`/community/${id}`);

    return { success: true };
  } catch (error) {
    console.error('Error toggling like:', error);
    return { success: false, error: '좋아요 처리 중 오류가 발생했습니다.' };
  }
}

export async function deletePost(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Fetch Post to check permission and cleanup storage
    const { data: post } = await supabase.from('posts').select('*').eq('id', id).single();
    if (!post) throw new Error("Post not found");

    const { data: profile } = await supabase.from('profiles').select('role, dojo_id').eq('user_id', user.id).single();
    if (!profile) throw new Error("Profile not found");

    // Check permission: Author OR (Admin AND same Dojo)
    const isAdmin = profile.role && ['owner', 'instructor'].includes(profile.role) && profile.dojo_id === post.dojo_id;
    const isAuthor = post.author_id === user.id;

    if (!isAdmin && !isAuthor) {
      throw new Error("Permission denied");
    }

    // Cleanup Storage if image exists
    if (post.image_url) {
      // Extract filename from URL (assumes standard Supabase storage URL format)
      // https://.../storage/v1/object/public/community-images/FILENAME
      const parts = post.image_url.split('/');
      const fileName = parts[parts.length - 1];
      if (fileName) {
          await supabase.storage.from('community-images').remove([fileName]);
      }
    }

    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;

    revalidatePath('/community');
    return { success: true };
  } catch (error) {
    console.error('Error deleting post:', error);
    return { success: false, error: '게시글 삭제 중 오류가 발생했습니다.' };
  }
}

export async function reportPost(data: { postId: string; reason: string }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from('post_reports').insert({
      post_id: data.postId,
      reporter_id: user.id,
      reason: data.reason
    });

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error reporting post:', error);
    return { success: false, error: '신고 접수 중 오류가 발생했습니다.' };
  }
}

export async function getReports() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Verify Admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
    if (!profile || !profile.role || !['owner', 'instructor'].includes(profile.role)) {
       throw new Error("Permission denied");
    }

    const { data, error } = await supabase
      .from('post_reports')
      .select(`
        *,
        post:posts (
           id, title, content, author_id
        )
      `)
      .eq('status', 'PENDING') // Only pending reports
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    if (!data) return { success: true, data: [] };

    // Fetch reporter names manually
    const reporterIds = [...new Set(data.map(r => r.reporter_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, name')
      .in('user_id', reporterIds);
    
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    const reportsWithReporter = data.map(report => ({
      ...report,
      reporter: { name: profileMap.get(report.reporter_id)?.name || '익명' }
    }));
    
    // Cast explicitly to expected return type or keep it flexible but safe
    return { success: true, data: reportsWithReporter };
  } catch (error) {
    console.error('Error fetching reports:', error);
    return { success: false, error: '신고 내역을 불러오는데 실패했습니다.' };
  }
}

export async function deleteComment(id: string) {
    try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: comment } = await supabase.from('comments').select('*, posts(dojo_id)').eq('id', id).single();
    if (!comment) throw new Error("Comment not found");

    const { data: profile } = await supabase.from('profiles').select('role, dojo_id').eq('user_id', user.id).single();
    if (!profile) throw new Error("Profile not found");

    // Supabase type join inference might be tricky, checking logic manually
    // Using unknown cast first to safely access joined property if types are missing
    const postDojoId = (comment as unknown as { posts: { dojo_id: string } }).posts?.dojo_id; 
    
    const isAdmin = profile.role && ['owner', 'instructor'].includes(profile.role) && profile.dojo_id === postDojoId;
    const isAuthor = comment.author_id === user.id;

    if (!isAdmin && !isAuthor) {
      throw new Error("Permission denied");
    }

    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (error) throw error;

    revalidatePath(`/community/${comment.post_id}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting comment:', error);
    return { success: false, error: '댓글 삭제 중 오류가 발생했습니다.' };
  }
}