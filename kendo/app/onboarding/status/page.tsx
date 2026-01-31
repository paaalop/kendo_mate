"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Clock, XCircle } from "lucide-react";
import { cancelSignupRequest } from "@/app/onboarding/actions";
import { useState } from "react";

export default function StatusPage() {
  const supabase = createClient();
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    // 1. 초기 체크: 이미 프로필이 승인되었는지 확인
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .maybeSingle();

      if (profile) {
        router.push("/");
        router.refresh();
      }
    };

    checkStatus();

    // 2. 리얼타임 구독: 프로필 생성을 감지
    const channel = supabase
      .channel("profile_approval")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "profiles",
        },
        (payload) => {
          router.push("/");
          router.refresh();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: "deleted_at=is.null",
        },
        (payload) => {
            router.push("/");
            router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  const handleCancel = async () => {
      if (confirm("정말로 가입 신청을 취소하시겠습니까?")) {
          setIsCancelling(true);
          const result = await cancelSignupRequest();
          if (result?.error) {
              alert(result.error);
              setIsCancelling(false);
          }
      }
  };

  return (
    <div className="max-w-md mx-auto py-20 px-4 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
        <Clock className="w-10 h-10 text-orange-600 animate-pulse" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900">가입 승인 대기 중</h1>
      <p className="text-gray-600 mt-4 leading-relaxed">
        도장 관장님께 가입 신청이 전달되었습니다.<br />
        승인이 완료되면 자동으로 대시보드로 이동합니다.
      </p>

      <div className="mt-12 space-y-4">
        <div className="flex items-center justify-center text-sm text-gray-400">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <span>관장님의 승인을 실시간으로 확인하고 있습니다...</span>
        </div>

        <button
          onClick={handleCancel}
          disabled={isCancelling}
          className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition disabled:opacity-50"
        >
          <XCircle className="w-4 h-4 mr-2" />
          {isCancelling ? "취소 중..." : "신청 취소하기"}
        </button>
      </div>
    </div>
  );
}
