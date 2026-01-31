import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">로그인</h2>
        <p className="text-sm text-gray-600">계정에 접속하여 도장을 관리하세요.</p>
      </div>
      
      <LoginForm />

      <div className="text-center text-sm">
        <span className="text-gray-600">계정이 없으신가요? </span>
        <Link 
          href="/signup" 
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          회원가입
        </Link>
      </div>
    </div>
  );
}
