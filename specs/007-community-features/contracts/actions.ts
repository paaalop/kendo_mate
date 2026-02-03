export type PostCategory = 'FREE' | 'QUESTION' | 'EXERCISE';

export interface Post {
  id: string;
  dojo_id: string;
  author_id: string;
  title: string;
  content: string;
  category: PostCategory;
  image_url?: string;
  created_at: string;
  author: {
    name: string;
    role: string;
  };
  _count: {
    comments: number;
  };
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  parent_id?: string;
  created_at: string;
  author: {
    name: string;
  };
  replies?: Comment[];
}

// Server Actions
export declare function createPost(data: {
  title: string;
  content: string;
  category: PostCategory;
  image_url?: string;
}): Promise<{ success: boolean; error?: string }>;

export declare function deletePost(postId: string): Promise<{ success: boolean; error?: string }>;

export declare function createComment(data: {
  post_id: string;
  content: string;
  parent_id?: string;
}): Promise<{ success: boolean; error?: string }>;

export declare function deleteComment(commentId: string): Promise<{ success: boolean; error?: string }>;

export declare function reportPost(postId: string, reason: string): Promise<{ success: boolean; error?: string }>;

// Admin Actions
export declare function createNotice(data: {
  title: string;
  content: string;
  is_pinned: boolean;
}): Promise<{ success: boolean; error?: string }>;

export declare function deleteNotice(noticeId: string): Promise<{ success: boolean; error?: string }>;
