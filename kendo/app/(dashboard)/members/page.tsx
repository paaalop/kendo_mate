import { getMembers } from "./actions";
import { MemberSearch } from "@/components/members/member-search";
import { MemberList } from "@/components/members/member-list";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function MembersPage({ searchParams }: PageProps) {
  const query = (await searchParams).q || "";
  const initialData = await getMembers({ search: query, page: 0 });

  const isOwner = initialData.viewerProfile?.role === 'owner';

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">관원 관리</h1>
          <p className="text-gray-600">전체 {initialData.total}명의 관원이 등록되어 있습니다.</p>
        </div>
      </header>

      <MemberSearch />

      <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-500" /></div>}>
        <MemberList 
          initialMembers={initialData.members} 
          initialHasMore={initialData.hasMore} 
          searchQuery={query}
          isOwner={isOwner}
        />
      </Suspense>
    </div>
  );
}