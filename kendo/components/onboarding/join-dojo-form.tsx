"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { joinDojoSchema } from "@/lib/validations/onboarding";
import * as z from "zod";
import { useState } from "react";
import { submitSignupRequest } from "@/app/onboarding/actions";

type JoinDojoFormValues = z.infer<typeof joinDojoSchema>;

export function JoinDojoForm({ dojoId }: { dojoId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<JoinDojoFormValues>({
    resolver: zodResolver(joinDojoSchema),
    defaultValues: {
      isAdult: true,
    }
  });

  const isAdult = watch("isAdult");

  const onSubmit = async (data: JoinDojoFormValues) => {
    setIsLoading(true);
    setError(null);

    const result = await submitSignupRequest(dojoId, data);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          이름
        </label>
        <input
          {...register("name")}
          className="w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="실명을 입력해주세요"
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
        />
        <p className="mt-1 text-[10px] text-gray-400">하이픈(-) 없이 숫자만 입력해주세요.</p>
        {errors.phone && (
          <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2 p-2">
        <input
          {...register("isAdult")}
          type="checkbox"
          id="isAdult"
          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
        />
        <label htmlFor="isAdult" className="text-sm font-medium text-gray-700">
          성인입니다
        </label>
      </div>

      {!isAdult && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            보호자 연락처 (미성년자 필수)
          </label>
          <input
            {...register("guardianPhone")}
            className="w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="01012345678"
          />
          {errors.guardianPhone && (
            <p className="mt-1 text-xs text-red-500">{errors.guardianPhone.message}</p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 font-bold min-h-[44px]"
      >
        {isLoading ? "처리 중..." : "가입 신청하기"}
      </button>
    </form>
  );
}
