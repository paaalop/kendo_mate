import { getNotices, getPosts } from '@/lib/actions/community';
import { NoticeCard } from '@/components/community/notice-card';
import { PostList } from '@/components/community/post-list';
import { createClient } from '@/utils/supabase/server';
import { getActiveProfileContext } from '@/lib/utils/profile';
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
  const context = await getActiveProfileContext();
  if (!context) redirect('/login');

  const { user, activeProfileId, allProfiles } = context;
  const activeProfile = allProfiles.find(p => p.id === activeProfileId);
  
  // If in summary mode, use the first available dojo_id from any profile
  const dojoId = activeProfile?.dojo_id || allProfiles.find(p => p.dojo_id)?.dojo_id;
  
  if (!dojoId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <p className="text-gray-500">소속된 도장이 없어 커뮤니티를 이용할 수 없습니다.</p>
        <Link href="/" className="text-blue-600 hover:underline">홈으로 돌아가기</Link>
      </div>
    );
  }

  const { data: notices } = await getNotices(dojoId);
  const { data: posts, total } = await getPosts(dojoId, 1, { search, category });

  return (
    <div className="max-w-5xl mx-auto space-y-10 relative pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">커뮤니티</h1>
      </div>
      
      {/* Notices Section */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-xl font-bold text-gray-900">공지사항</h2>
          <div className="h-px flex-1 bg-gray-100 ml-2" />
        </div>
        {notices && notices.length > 0 ? (
          <div className="grid gap-4">
             {notices.map(notice => (
               <NoticeCard key={notice.id} notice={notice} />
             ))}
          </div>
        ) : (
          <div className="p-10 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50 text-center text-gray-400">
             등록된 공지사항이 없습니다.
          </div>
        )}
      </section>
      
      {/* Posts Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">자유게시판</h2>
           </div>
           
           <div className="flex items-center gap-3 w-full md:w-auto flex-1 md:max-w-2xl">
              {/* Search & Filter Bar - Simplified and combined with Write button */}
              <form action="/community" className="flex flex-1 items-center bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden focus-within:border-blue-200 transition-colors">
                 <div className="relative flex-1 flex items-center">
                    <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                    <input 
                      name="search"
                      defaultValue={search}
                      placeholder="검색"
                      className="w-full pl-9 pr-4 py-2.5 text-sm focus:outline-none bg-transparent placeholder:text-gray-400"
                    />
                 </div>
                 <div className="h-4 w-px bg-gray-100" />
                 <select 
                   name="category"
                   defaultValue={category}
                   className="pl-3 pr-8 py-2.5 text-sm bg-transparent text-gray-500 focus:outline-none appearance-none cursor-pointer font-medium"
                 >
                    <option value="ALL">전체</option>
                    <option value="FREE">자유</option>
                    <option value="QUESTION">질문</option>
                    <option value="EXERCISE">운동</option>
                 </select>
                 <button type="submit" className="hidden">검색</button>
              </form>

              <Link 
                href="/community/create" 
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-sm hover:shadow-blue-100"
              >
                <PenSquare className="w-4 h-4" />
                <span className="hidden sm:inline">글쓰기</span>
              </Link>
           </div>
        </div>

        <PostList 
          key={`${search || 'all'}-${category}`}
          initialPosts={posts || []} 
          dojoId={dojoId} 
          total={total || 0} 
          currentUserId={user.id}
          isOwnerOrInstructor={activeProfile?.role ? ['owner', 'instructor'].includes(activeProfile.role) : false}
          search={search}
          category={category}
        />
      </section>
    </div>
  );
}
