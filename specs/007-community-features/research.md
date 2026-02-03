# Research: Community Features

**Feature**: `007-community-features`  
**Date**: 2026-02-03

## 1. Database Schema & RLS

### Decision
Use Supabase PostgreSQL with the following tables:
- `notices`: Managed by admins.
- `posts`: User-generated content.
- `comments`: Threaded discussions (max depth 2).
- `post_reports`: Content moderation.

### RLS Strategy
- **Isolation**: All tables must have `dojo_id` and RLS policy checking `app_metadata.dojo_id` or similar mapping.
- **Read**: Public (within dojo) for `notices`, `posts`, `comments`.
- **Write**: 
  - `notices`: Admins only.
  - `posts`: Authenticated users (own rows only for update/delete).
  - `comments`: Authenticated users.
  - `post_reports`: Authenticated users (insert only).

### Alternatives Considered
- **NoSQL (Firebase)**: Rejected due to "Supabase Strict" constitution.
- **Single `content` table**: Rejected. Notices and Posts have different lifecycles and permissions (Notices = Admin, Posts = User). Separating them is cleaner.

## 2. Image Storage

### Decision
Use Supabase Storage bucket `community-images`.
- **Path structure**: `{dojo_id}/{user_id}/{random_uuid}.{ext}`
- **Constraints**: 5MB limit, image mime types only.

### RLS
- **Select**: Public (or authenticated dojo members).
- **Insert**: Authenticated users only.
- **Update/Delete**: Owner only.

## 3. Search Implementation

### Decision
Use PostgreSQL `ilike` with `or` condition for Title and Content.
- Syntax: `supabase.from('posts').select('*').or('title.ilike.%q%,content.ilike.%q%')`

### RLS Note
RLS will automatically filter results to the user's `dojo_id`.

## 4. Comment Hierarchy

### Decision
Adjacency List pattern with `parent_id`.
- **Constraint**: Spec says "2 levels only".
- **Logic**: 
  - Level 1: `parent_id` is NULL.
  - Level 2: `parent_id` points to Level 1 comment.
  - UI Enforcement: Reply button only on Level 1 comments. If replying to Level 2, set `parent_id` to its parent (Level 1) or block. Spec says "Reply to comment (1 level)". Usually this means Reply to Root -> Child. Reply to Child -> Child (same level) or Block.
  - **Refined**: All replies will link to the top-level comment as parent, or strict 1-level nesting.
  - **Spec Check**: "2단계 계층 (댓글에 대한 답글 1단계 허용)".
  - **Implementation**: Frontend checks depth.

