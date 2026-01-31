"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Member } from "@/lib/types/member";
import { getMembers } from "@/app/(dashboard)/members/actions";
import { MemberCard } from "./member-card";
import { Loader2 } from "lucide-react";

interface MemberListProps {
  initialMembers: Member[];
  initialHasMore: boolean;
  searchQuery: string;
  isOwner: boolean;
}

export function MemberList({ initialMembers, initialHasMore, searchQuery, isOwner }: MemberListProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  // Reset when search query changes
  useEffect(() => {
    setMembers(initialMembers);
    setHasMore(initialHasMore);
    setPage(0);
  }, [initialMembers, initialHasMore, searchQuery]);

  const lastMemberElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    if (page === 0) return;

    const fetchMore = async () => {
      setLoading(true);
      try {
        const result = await getMembers({ search: searchQuery, page });
        setMembers(prev => [...prev, ...result.members]);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error("Error fetching more members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMore();
  }, [page, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member, index) => {
          if (members.length === index + 1) {
            return (
              <div ref={lastMemberElementRef} key={member.id}>
                <MemberCard member={member} isOwner={isOwner} />
              </div>
            );
          } else {
            return <MemberCard key={member.id} member={member} isOwner={isOwner} />;
          }
        })}
      </div>

      {loading && (
        <div className="flex justify-center p-4">
          <Loader2 className="animate-spin text-blue-500" />
        </div>
      )}

      {!hasMore && members.length > 0 && (
        <p className="text-center text-gray-400 text-sm py-8">
          모든 관원을 불러왔습니다.
        </p>
      )}

      {members.length === 0 && !loading && (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
