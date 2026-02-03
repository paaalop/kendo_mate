import { Database } from './database.types';

export type Notice = Database['public']['Tables']['notices']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type Report = Database['public']['Tables']['post_reports']['Row'];
export type PostLike = Database['public']['Tables']['post_likes']['Row'];

// Extended interfaces for UI
export interface NoticeWithAuthor extends Notice {
  author: {
    name: string;
  } | null;
}

export interface PostWithAuthor extends Post {
  author: {
    name: string;
  } | null;
  likes_count: number;
  comments_count: number;
  is_liked: boolean; // computed field
}

export interface CommentWithAuthor extends Comment {
  author: {
    name: string;
  } | null;
  likes_count: number;
  is_liked: boolean; // computed field
  replies?: CommentWithAuthor[]; // for nested comments
}

export interface ReportWithDetails extends Report {
  reporter: {
    name: string;
  } | null;
  post: {
    id: string;
    title: string;
    content: string;
    author_id: string;
  } | null;
}
