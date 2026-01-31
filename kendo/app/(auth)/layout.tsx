import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Kendo Manager
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            도장 관리를 더 스마트하게
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
