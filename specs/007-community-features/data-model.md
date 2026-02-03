# Data Model: Community Features

## ER Diagram

```mermaid
erDiagram
    DOJOS ||--o{ NOTICES : has
    DOJOS ||--o{ POSTS : has
    PROFILES ||--o{ NOTICES : writes
    PROFILES ||--o{ POSTS : writes
    PROFILES ||--o{ COMMENTS : writes
    POSTS ||--o{ COMMENTS : has
    POSTS ||--o{ POST_REPORTS : has
    PROFILES ||--o{ POST_REPORTS : reports

    NOTICES {
        uuid id PK
        uuid dojo_id FK
        uuid author_id FK
        string title
        text content
        boolean is_pinned
        timestamp created_at
        timestamp updated_at
    }

    POSTS {
        uuid id PK
        uuid dojo_id FK
        uuid author_id FK
        string title
        text content
        enum category "FREE, QUESTION, EXERCISE"
        string image_url "Optional"
        timestamp created_at
        timestamp updated_at
    }

    COMMENTS {
        uuid id PK
        uuid post_id FK
        uuid author_id FK
        text content
        uuid parent_id FK "Self-reference, max depth 1"
        timestamp created_at
        timestamp updated_at
    }

    POST_REPORTS {
        uuid id PK
        uuid post_id FK
        uuid reporter_id FK
        text reason
        string status "PENDING, RESOLVED"
        timestamp created_at
    }
```

## Tables Definition

### 1. `notices`
Admin-created announcements.
- **RLS**:
  - `SELECT`: `auth.uid() IN (SELECT user_id FROM profiles WHERE dojo_id = notices.dojo_id)`
  - `INSERT/UPDATE/DELETE`: `auth.uid() IN (SELECT user_id FROM profiles WHERE dojo_id = notices.dojo_id AND role IN ('owner', 'instructor'))`

### 2. `posts`
User-created community content.
- **RLS**:
  - `SELECT`: `auth.uid() IN (SELECT user_id FROM profiles WHERE dojo_id = posts.dojo_id)`
  - `INSERT`: `auth.uid() IN (SELECT user_id FROM profiles WHERE dojo_id = posts.dojo_id)`
  - `UPDATE/DELETE`: `author_id = auth.uid()` OR `auth.uid() IN (Admins...)`

### 3. `comments`
- **RLS**:
  - `SELECT`: Same as posts.
  - `INSERT`: Same as posts.
  - `UPDATE/DELETE`: `author_id = auth.uid()` OR `auth.uid() IN (Admins...)`

### 4. `post_reports`
- **RLS**:
  - `INSERT`: Authenticated users.
  - `SELECT/UPDATE`: Admins only.

## Storage
Bucket: `community-images`
- Path: `{dojo_id}/{post_id}/{filename}`
- Policy:
  - Read: Public (or check dojo membership)
  - Write: Authenticated users.
