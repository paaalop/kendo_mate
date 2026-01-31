import { CreateDojoForm } from "@/components/onboarding/create-dojo-form";
import Link from "next/link";

export default function CreateDojoPage() {
  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">새로운 도장 개설</h1>
        <p className="text-gray-600 mt-2">
          도장 정보를 입력하여 관리 시스템을 시작하세요.
        </p>
      </div>

      <CreateDojoForm />

      <div className="mt-6 text-center">
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
