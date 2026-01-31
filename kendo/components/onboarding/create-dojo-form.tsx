"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDojoSchema } from "@/lib/validations/onboarding";
import * as z from "zod";
import { useState } from "react";
import { createDojo } from "@/app/onboarding/actions";

type CreateDojoFormValues = z.infer<typeof createDojoSchema>;

export function CreateDojoForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateDojoFormValues>({
    resolver: zodResolver(createDojoSchema),
  });

  const onSubmit = async (data: CreateDojoFormValues) => {
    setIsLoading(true);
    setError(null);

    const result = await createDojo(data);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
    // Success is handled by redirect in Server Action
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          도장 이름
        </label>
        <input
          {...register("name")}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="예: 서울 검도관"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          관장님 성함
        </label>
        <input
          {...register("ownerName")}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="실명을 입력해주세요"
        />
        {errors.ownerName && (
          <p className="mt-1 text-xs text-red-500">{errors.ownerName.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          연락처
        </label>
        <input
          {...register("phone")}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="01012345678"
        />
        <p className="mt-1 text-[10px] text-gray-400">하이픈(-) 없이 숫자만 입력해주세요.</p>
        {errors.phone && (
          <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 min-h-[44px]"
      >
        {isLoading ? "처리 중..." : "도장 개설하기"}
      </button>
    </form>
  );
}
