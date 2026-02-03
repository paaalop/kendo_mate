# Quickstart: Testing Community Features

## Prerequisites
1. **User Setup**: 
   - One Admin user (`owner@example.com`)
   - One Member user (`member@example.com`)
   - Both belonging to the same Dojo.
2. **Environment**:
   - Supabase local instance running (`npx supabase start`).
   - Tables created (migrations applied).

## Manual Verification Steps

### 1. Admin Features (Notices)
1. Log in as Admin.
2. Navigate to `Dashboard > Community`.
3. Click "New Notice".
4. Enter Title "Maintenance" and Content "Server check". Check "Pin".
5. Submit.
6. **Verify**: Notice appears at top of list with "Pinned" badge.

### 2. Member Features (Posts)
1. Log in as Member.
2. Navigate to `Community`.
3. **Verify**: You see the "Maintenance" notice.
4. Click "Write Post".
5. Enter Title "Hello", Content "Nice to meet you", Category "Free".
6. (Optional) Upload an image.
7. Submit.
8. **Verify**: Post appears in the list.

### 3. Comments
1. Click on the "Hello" post.
2. Add a comment: "Welcome!".
3. **Verify**: Comment appears immediately.
4. Reply to the comment: "Thanks!".
5. **Verify**: Reply appears indented.

### 4. Database Check
Run in Supabase Studio SQL Editor:
```sql
SELECT * FROM posts;
SELECT * FROM comments;
```
Ensure `dojo_id` is correctly populated.
