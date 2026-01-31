import { DojoSearch } from "@/components/onboarding/dojo-search";
import Link from "next/link";

export default function JoinDojoPage() {
  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">도장 찾기</h1>
        <p className="text-gray-600 mt-2">
          가입하려는 도장 이름을 검색해주세요.
        </p>
      </div>

      <DojoSearch />

      <div className="mt-10 text-center">
        <Link 
          href="/onboarding" 
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          뒤로 가기
        </Link>
      </div>
    </div>
  );
}
