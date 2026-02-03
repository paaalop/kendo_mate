-- Drop existing objects to allow re-run
DROP TRIGGER IF EXISTS update_notices_updated_at ON public.notices;
DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;

DROP TABLE IF EXISTS public.comment_likes;
DROP TABLE IF EXISTS public.post_likes;
DROP TABLE IF EXISTS public.post_reports;
DROP TABLE IF EXISTS public.comments;
DROP TABLE IF EXISTS public.posts;
DROP TABLE IF EXISTS public.notices;

DROP TYPE IF EXISTS public.post_category;
DROP TYPE IF EXISTS public.report_status;

-- Create ENUM for post category
CREATE TYPE public.post_category AS ENUM ('FREE', 'QUESTION', 'EXERCISE');
-- Create ENUM for report status
CREATE TYPE public.report_status AS ENUM ('PENDING', 'RESOLVED');

-- Create update_updated_at_column function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create notices table
CREATE TABLE public.notices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    dojo_id uuid REFERENCES public.dojos(id) ON DELETE CASCADE NOT NULL,
    author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    title text NOT NULL,
    content text NOT NULL,
    is_pinned boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create posts table
CREATE TABLE public.posts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    dojo_id uuid REFERENCES public.dojos(id) ON DELETE CASCADE NOT NULL,
    author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    category public.post_category DEFAULT 'FREE' NOT NULL,
    image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create comments table
CREATE TABLE public.comments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL,
    parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create post_reports table
CREATE TABLE public.post_reports (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    reporter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reason text NOT NULL,
    status public.report_status DEFAULT 'PENDING' NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create post_likes table
CREATE TABLE public.post_likes (
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (post_id, user_id)
);

-- Create comment_likes table
CREATE TABLE public.comment_likes (
    comment_id uuid REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (comment_id, user_id)
);

-- Enable RLS
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Triggers for updated_at
CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON public.notices FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- RLS Policies

-- NOTICES
-- Read: Members of the dojo
CREATE POLICY "Notices are viewable by dojo members" ON public.notices
FOR SELECT USING (
    public.is_dojo_member(dojo_id)
);

-- Write: Owners/Instructors of the dojo
CREATE POLICY "Notices can be managed by owners and instructors" ON public.notices
FOR ALL USING (
    public.is_dojo_staff(dojo_id)
);

-- POSTS
-- Read: Members of the dojo
CREATE POLICY "Posts are viewable by dojo members" ON public.posts
FOR SELECT USING (
    public.is_dojo_member(dojo_id)
);

-- Insert: Members of the dojo
CREATE POLICY "Posts can be created by dojo members" ON public.posts
FOR INSERT WITH CHECK (
    public.is_dojo_member(dojo_id) AND
    author_id = auth.uid()
);

-- Update/Delete: Author or Admin
CREATE POLICY "Posts can be updated by author" ON public.posts
FOR UPDATE USING (
    author_id = auth.uid()
) WITH CHECK (
    author_id = auth.uid()
);

CREATE POLICY "Posts can be deleted by author or dojo admin" ON public.posts
FOR DELETE USING (
    author_id = auth.uid() OR
    public.is_dojo_staff(dojo_id)
);

-- COMMENTS
-- Read: Members of the dojo (via post)
CREATE POLICY "Comments are viewable by dojo members" ON public.comments
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.posts
        WHERE posts.id = comments.post_id
        AND public.is_dojo_member(posts.dojo_id)
    )
);

-- Insert: Members of the dojo (via post)
CREATE POLICY "Comments can be created by dojo members" ON public.comments
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.posts
        WHERE posts.id = comments.post_id
        AND public.is_dojo_member(posts.dojo_id)
    ) AND
    author_id = auth.uid()
);

-- Update/Delete: Author or Admin
CREATE POLICY "Comments can be updated by author" ON public.comments
FOR UPDATE USING (
    author_id = auth.uid()
) WITH CHECK (
    author_id = auth.uid()
);

CREATE POLICY "Comments can be deleted by author or dojo admin" ON public.comments
FOR DELETE USING (
    author_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.posts
        WHERE posts.id = comments.post_id
        AND public.is_dojo_member(posts.dojo_id)
        AND public.is_dojo_staff(posts.dojo_id)
    )
);

-- POST LIKES
-- Select: Members
CREATE POLICY "Post likes are viewable by dojo members" ON public.post_likes
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.posts
        WHERE posts.id = post_likes.post_id
        AND public.is_dojo_member(posts.dojo_id)
    )
);

-- Insert/Delete: Authenticated users (Self)
CREATE POLICY "Users can manage their own post likes" ON public.post_likes
FOR ALL USING (
    user_id = auth.uid()
);

-- COMMENT LIKES
-- Select: Members
CREATE POLICY "Comment likes are viewable by dojo members" ON public.comment_likes
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.comments
        JOIN public.posts ON posts.id = comments.post_id
        WHERE comments.id = comment_likes.comment_id
        AND public.is_dojo_member(posts.dojo_id)
    )
);

-- Insert/Delete: Authenticated users (Self)
CREATE POLICY "Users can manage their own comment likes" ON public.comment_likes
FOR ALL USING (
    user_id = auth.uid()
);

-- POST REPORTS
-- Insert: Authenticated users
CREATE POLICY "Users can create reports" ON public.post_reports
FOR INSERT WITH CHECK (
    auth.uid() = reporter_id
);

-- Select/Update: Admins only
CREATE POLICY "Admins can view and update reports" ON public.post_reports
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.posts
        WHERE posts.id = post_reports.post_id
        AND public.is_dojo_staff(posts.dojo_id)
    )
);