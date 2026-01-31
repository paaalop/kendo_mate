"use client";

import { useState, useEffect, useTransition } from "react";
import { searchDojos } from "@/app/onboarding/actions";
import { Search, MapPin, User, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";

export function DojoSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: string; name: string; ownerName: string }[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        startTransition(async () => {
          const data = await searchDojos(query);
          setResults(data);
        });
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
          placeholder="도장 이름을 입력하세요 (최소 2자)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isPending && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        {results.length > 0 ? (
          results.map((dojo) => (
            <Link
              key={dojo.id}
              href={`/onboarding/join-dojo/${dojo.id}`}
              className="flex items-center p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group"
            >
              <div className="bg-gray-100 p-2 rounded-lg mr-4 group-hover:bg-blue-100 transition">
                <MapPin className="text-gray-500 group-hover:text-blue-600 w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{dojo.name}</h3>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <User className="w-3 h-3 mr-1" />
                  <span>{dojo.ownerName} 관장님</span>
                </div>
              </div>
              <ChevronRight className="text-gray-400" />
            </Link>
          ))
        ) : query.length >= 2 && !isPending ? (
          <p className="text-center py-10 text-gray-500">검색 결과가 없습니다.</p>
        ) : query.length > 0 && query.length < 2 ? (
          <p className="text-center py-10 text-gray-400 text-sm">2자 이상 입력해주세요.</p>
        ) : (
          <div className="text-center py-10">
              <p className="text-gray-400 text-sm italic">도장 이름을 검색하여 가입 신청을 하세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
