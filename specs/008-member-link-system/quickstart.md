# Quickstart: Member Link System

## 1. Setup

### Migrations
Run the migrations to update the database schema.
```bash
npx supabase migration up
```
*Note: This will apply `profiles` changes and create `profile_guardians`, `link_requests`.*

### Install Dependencies
Ensure `xlsx` is installed.
```bash
npm install xlsx
```

## 2. Testing Flow

### A. Admin Upload (Pre-create)
1.  Login as **Dojo Owner**.
2.  Navigate to `/admin/members/upload`.
3.  Download the "Sample Excel File".
4.  Fill in a row:
    *   Name: `홍길동`
    *   BirthDate: `2015-01-01`
    *   GuardianPhone: `010-1234-5678` (Use a real phone number you can test with, or a dummy one).
5.  Upload the file.
6.  Verify toast message: "1 profiles created."

### B. Auto-Discovery
1.  Login as **Parent** (or create a new account) with the phone number `010-1234-5678`.
2.  Navigate to `/dashboard` (or refresh).
3.  Verify the "Found Child" modal appears: "홍길동 학생이 발견되었습니다."
4.  Click "Link" (연결하기).
5.  Verify the profile appears in your dashboard.

### C. Manual Link
1.  Login as a **different Parent**.
2.  Navigate to `/family/link`.
3.  Search for:
    *   Name: `홍길동`
    *   Dojo: [Select Dojo]
    *   BirthDate: `2015-01-01`
4.  Verify the result is found.
5.  Click "Request Link".
6.  Login as **Dojo Owner** again.
7.  Navigate to `/admin/members/requests`.
8.  Approve the request.
9.  Login as the **Parent** and verify the profile is linked.
