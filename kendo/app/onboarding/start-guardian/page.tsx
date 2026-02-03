"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { guardianProfileSchema } from "@/lib/validations/onboarding";
import * as z from "zod";
import { useState, useTransition } from "react";
import { createGuardianProfile } from "@/app/onboarding/actions";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

type GuardianProfileValues = z.infer<typeof guardianProfileSchema>;

export default function StartGuardianPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuardianProfileValues>({
    resolver: zodResolver(guardianProfileSchema),
  });

  const onSubmit = async (data: GuardianProfileValues) => {
    setError(null);
    startTransition(async () => {
      const result = await createGuardianProfile(data);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <Link
        href="/onboarding"
        className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        뒤로 가기
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">학부모 정보 입력</h1>
        <p className="text-gray-600 mt-2">
          자녀를 관리하기 위해 보호자님의 정보를 입력해주세요.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              보호자 실명
            </label>
            <input
              {...register("name")}
              className="w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="홍길동"
              disabled={isPending}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              연락처
            </label>
            <input
              {...register("phone")}
              className="w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="01012345678"
              disabled={isPending}
            />
            <p className="mt-1 text-[10px] text-gray-400">하이픈(-) 없이 숫자만 입력해주세요.</p>
            {errors.phone && (
              <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 font-bold min-h-[44px]"
          >
            {isPending ? "저장 중..." : "시작하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
