# 프로젝트 요구사항 정의서 (PRD) - 검도장 관리 서비스 (MVP) Final

## 1. 프로젝트 개요 및 목표

**목표:** 검도장 관장님의 수련 관리 업무를 자동화하고, 관원(및 학부모)에게 성장 데이터를 시각화해주는 모바일 중심의 웹 서비스(PWA) 개발.
**핵심 가치:**

1. "출석과 진도 관리를 1초 만에" (관장님/사범님)
2. "학부모에게는 안심과 성취감을" (학부모/관원)
3. "도장 내 소통을 활발하게" (커뮤니티)
**타겟 유저:**
4. **관장(Owner):** 도장 운영, 회계, 전체 관리, 커뮤니티 관리.
5. **사범(Instructor):** 수련 지도, 출석 체크, 심사, 커뮤니티 관리 (운영/회계 권한 없음).
6. **관원(Member):** 본인 진도 확인, 출석 조회, 커뮤니티 이용.
**개발 단계:** 이번 주말 내 시연 가능한 MVP(Minimum Viable Product) 완성.

---

## 2. 데이터베이스 스키마 (Supabase SQL)

```sql
-- UUID 확장
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- [1] 도장 (Tenants)
CREATE TABLE dojos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    owner_id UUID NOT NULL, -- 관장님 계정 ID (auth.users)
    trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '14 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- [2] 회원 프로필 (Users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id), -- 계정 ID (Nullable: 미가입 자녀도 등록 가능)
    dojo_id UUID REFERENCES dojos(id),
    
    -- 역할 구분: 관장(owner), 사범(instructor), 관원(member)
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'instructor', 'member')),
    
    name TEXT NOT NULL,
    phone TEXT, -- 정제된 본인 전화번호 (하이픈 제외, 필수 검색 키)
    
    -- 검도 특화 데이터
    rank_level INTEGER DEFAULT 0, -- 정렬용 점수 (9급=1, ... 초단=10)
    rank_name TEXT DEFAULT '무급', -- 표시용 이름
    default_session_time VARCHAR(10), -- 주 수련 시간 (예: '18:00')
    
    -- 가족 연동
    is_adult BOOLEAN DEFAULT FALSE,
    guardian_name TEXT,
    guardian_phone TEXT, -- 정제된 보호자 전화번호 (가족 연결 Key)
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 성능 향상을 위한 인덱스 (전화번호 검색이 핵심)
CREATE INDEX idx_profiles_phone ON profiles(phone);
CREATE INDEX idx_profiles_guardian_phone ON profiles(guardian_phone);

-- [3] 가입 요청 대기열 (Onboarding)
CREATE TABLE signup_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dojo_id UUID REFERENCES dojos(id),
    user_id UUID REFERENCES auth.users(id),
    
    name TEXT NOT NULL,
    phone TEXT,
    guardian_phone TEXT,
    is_adult BOOLEAN DEFAULT FALSE,
    
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- [4] 커리큘럼 템플릿 (Curriculum)
CREATE TABLE curriculum_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dojo_id UUID REFERENCES dojos(id),
    
    title TEXT NOT NULL, -- 예: '3동작 머리치기'
    category TEXT, 
    order_index INTEGER NOT NULL, -- 커리큘럼 순서
    required_rank_level INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- [5] 개인별 진도 (Progress)
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    item_id UUID REFERENCES curriculum_items(id) NOT NULL,
    
    status TEXT DEFAULT 'completed', -- 현재는 완료된 것만 기록
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    
    UNIQUE(user_id, item_id)
);

-- [6] 출석 기록 (Attendance)
CREATE TABLE attendance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dojo_id UUID REFERENCES dojos(id),
    user_id UUID REFERENCES profiles(id),
    
    attended_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    check_type TEXT DEFAULT 'manual', -- 'manual'(관장님체크)
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- [7] 회비 납부 기록 (Payments)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dojo_id UUID REFERENCES dojos(id),
    user_id UUID REFERENCES profiles(id),
    
    target_month VARCHAR(7) NOT NULL, -- 예: '2024-02'
    amount INTEGER DEFAULT 150000, 
    payment_date TIMESTAMP WITH TIME ZONE,
    
    -- 상태: 미납(unpaid), 확인요청(pending), 납부완료(paid)
    status TEXT DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'pending', 'paid')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, target_month)
);

-- [8] 공지사항 (Notices)
CREATE TABLE notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dojo_id UUID REFERENCES dojos(id),
    author_id UUID REFERENCES profiles(id), -- 작성자 (관장 or 사범)
    
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- [9] 커뮤니티 게시글 (Posts)
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dojo_id UUID REFERENCES dojos(id),
    author_id UUID REFERENCES profiles(id), -- 작성자 (관원, 사범, 관장 모두 가능)
    
    category TEXT DEFAULT 'free', -- 'free'(자유), 'qna'(질문), 'cert'(운동인증)
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT, -- 사진 업로드 (선택 사항)
    
    view_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- [10] 댓글 (Comments)
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE, -- 글 삭제되면 댓글도 삭제
    author_id UUID REFERENCES profiles(id),
    
    content TEXT NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS 활성화 및 정책 (MVP용 전체 허용)
ALTER TABLE dojos ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Access" ON dojos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON signup_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON curriculum_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON user_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON attendance_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON notices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON comments FOR ALL USING (true) WITH CHECK (true);

```

---

## 3. 핵심 기능 상세 명세 (Logic & Edge Cases)

### A. 역할별 권한 매트릭스 (Role & Permissions)

**1. 관장 (Owner)**

* 모든 권한 보유. (회비 생성, 사범 임명, 도장 설정 등)
* 커뮤니티 관리: 모든 게시글 삭제 가능.

**2. 사범 (Instructor)**

* 가능: 출석 체크, 진도 심사(통과 처리), 공지사항 작성, 관원 목록 조회, 커뮤니티 관리(게시글 삭제).
* **불가능: 회비 관련 데이터 접근(Payments 테이블 조회 불가), 도장 정보 수정, 사범 임명.**
* UI 처리: 사범 계정 로그인 시 하단 탭은 동일하되, [설정] 탭 내 '회비 관리', '도장 정보' 메뉴는 숨김(Hidden) 처리.

**3. 관원 (Member)**

* 본인 및 자녀 데이터 조회만 가능.
* 커뮤니티: 글쓰기, 댓글 달기 가능 (삭제는 본인 글만).

### B. 사범님 등록 프로세스 (Instructor Onboarding)

* 별도의 사범 가입창을 만들지 않음 (MVP 공수 절감).
* **Flow:**
1. 사범님이 일반 '관원'으로 가입 신청.
2. 관장님이 승인.
3. 관장님이 [회원 관리] > [관원 상세]에서 **역할(Role)을 '사범(Instructor)'으로 변경** 저장.



### C. 출석 체크 로직 (Attendance)

* **방식:** 관리자(관장/사범)가 앱 내에서 수동 체크.
* **UI:** [수련 관리] 탭 리스트에 관원 카드마다 [출석] 버튼 존재.
* **Logic:**
* 버튼 클릭 시 `attendance_logs`에 `INSERT`.
* 버튼은 '출석 완료' 상태로 비활성화됨 (당일 중복 방지).



### D. 다자녀 연결 및 조회 (Family Linking)

* **Key:** `guardian_phone` (보호자 전화번호).
* **Logic:**
* 로그인한 유저가 `is_adult=true`인 경우, `profiles` 테이블에서 본인의 `phone` 번호를 가져옴.
* `profiles` 테이블에서 `guardian_phone`이 본인의 전화번호와 일치하는 모든 유저(자녀)를 조회 (`Select * from profiles where guardian_phone = :my_phone`).


* **UI:** 메인 화면 상단에 자녀 프로필 사진/이름을 가로 스크롤로 배치. 선택 시 해당 자녀의 진도/출석 데이터로 뷰 갱신.

### F. 승급 심사 로직 (Rank Promotion & Grading)

* **심사 방식:** 기술 습득률에 따른 자동 승급이 아닌, 도장별 정기 일정(예: 매월 말)에 맞춰 일괄 진행.
* **심사 알림:** 지도자(관장/사범)가 심사 대상자(또는 전체)에게 승급 심사 알림을 전송할 수 있어야 함.
* **설정:** 도장마다 심사 주기가 다르므로, 관리자 화면에서 심사 월을 선택하거나 설정할 수 있는 기능 제공.
* **승급 처리:** 심사 후 관리자가 수동으로 관원의 `rank_name` 및 `rank_level`을 업데이트.

---

## 4. 화면 구성 및 UI 흐름 (User Flow)

### [공통] 시작 화면
... (생략) ...

### [관리자 앱 (Admin App)] - 관장/사범 공용

**탭 1: 수련 관리 (홈)**

* 동적 시간표 탭 (17:00, 18:00...).
* 관원 리스트 카드: 이름, 현재급수, 현재기술.
* **Action:** [출석] 버튼, [기술 통과] 버튼.
* **심사 관리:** 상단 또는 별도 메뉴에서 [승급 심사 알림 보내기] 기능. 심사 대상 월(Month) 선택 기능 포함.


**탭 2: 회원 관리**

* 가입 대기 목록 (승인/반려).
* 전체 관원 목록 (검색, 상세 조회, **역할 변경 기능**).

**탭 3: 커뮤니티 (New)**

* 전체 게시글 리스트 조회.
* **Action:** 부적절한 게시글 [삭제] (Moderation).

**탭 4: 설정**

* 내 정보 수정.
* **[관장 전용]** 회비 관리 (미납자 조회, 입금 확인).
* **[관장 전용]** 도장 정보 및 커리큘럼 수정.
* 공지사항 관리 (관장/사범 모두 가능).

### [관원 앱 (User App)] - 관원/학부모

**탭 1: 내 진도 (홈)**

* (부모 계정일 경우) 상단 자녀 선택 바.
* 출석 현황 (이번 달 출석 일수).
* 진도율 그래프 & 현재 배우는 기술.

**탭 2: 커뮤니티 (New)**

* **상단 탭:** [공지사항] / [자유게시판]
* **자유게시판:**
* 관원 글 리스트 (최신순).
* **[글쓰기] FAB:** 글 작성 모달 (제목, 내용, 사진).
* **상세 보기:** 본문 + 댓글 작성/조회.



**탭 3: 더보기**

* 내 정보 / 보호자 정보 수정.
* 회비 납부 내역 (미납 시 🔴 배지).
* 도장 정보.