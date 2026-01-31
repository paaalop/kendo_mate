import { SignupForm } from "@/components/auth/signup-form";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">회원가입</h2>
        <p className="text-sm text-gray-600">새로운 계정을 만들고 시작해보세요.</p>
      </div>
      
      <SignupForm />

      <div className="text-center text-sm">
        <span className="text-gray-600">이미 계정이 있으신가요? </span>
        <Link 
          href="/login" 
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          로그인
        </Link>
      </div>
    </div>
  );
}
