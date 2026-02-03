import { getNotices, getPosts } from '@/lib/actions/community';
import { NoticeCard } from '@/components/community/notice-card';
import { PostList } from '@/components/community/post-list';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PenSquare, Search } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CommunityPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search : undefined;
  const category = typeof params.category === 'string' ? params.category : 'ALL';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
  if (!profile || !profile.dojo_id) redirect('/');

  const { data: notices } = await getNotices(profile.dojo_id);
  const { data: posts, total } = await getPosts(profile.dojo_id, 1, { search, category });

  return (
    <div className="space-y-8 relative pb-20">
      <h1 className="text-2xl font-bold">커뮤니티</h1>
      
      {/* Notices Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">공지사항</h2>
        {notices && notices.length > 0 ? (
          <div className="grid gap-4">
             {notices.map(notice => (
               <NoticeCard key={notice.id} notice={notice} />
             ))}
          </div>
        ) : (
          <div className="p-8 border rounded-lg bg-gray-50 text-center text-gray-500">
             등록된 공지사항이 없습니다.
          </div>
        )}
      </section>
      
      {/* Posts Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
           <h2 className="text-xl font-semibold">자유게시판</h2>
           <Link 
             href="/community/create" 
             className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
           >
             <PenSquare className="w-4 h-4" />
             글쓰기
           </Link>
        </div>

        {/* Search & Filter Bar */}
        <form action="/community" className="flex flex-col sm:flex-row gap-2">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                name="search"
                defaultValue={search}
                placeholder="제목 또는 내용 검색"
                className="w-full pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
           </div>
           <select 
             name="category"
             defaultValue={category}
             className="px-4 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
           >
              <option value="ALL">전체 카테고리</option>
              <option value="FREE">자유</option>
              <option value="QUESTION">질문</option>
              <option value="EXERCISE">운동</option>
           </select>
           <button type="submit" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium">
              검색
           </button>
        </form>

        <PostList 
          key={`${search || 'all'}-${category}`}
          initialPosts={posts || []} 
          dojoId={profile.dojo_id} 
          total={total || 0} 
          currentUserId={user.id}
          isOwnerOrInstructor={profile.role ? ['owner', 'instructor'].includes(profile.role) : false}
          search={search}
          category={category}
        />
      </section>
    </div>
  );
}
