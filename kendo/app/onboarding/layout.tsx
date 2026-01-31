import React from "react";
import { LogOut } from "lucide-react";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-bold text-blue-600 text-lg">Kendo Manager</span>
          <form action="/api/auth/signout" method="post">
            <button className="flex items-center text-gray-500 hover:text-red-600 transition text-sm font-medium">
              <LogOut className="w-4 h-4 mr-1" />
              로그아웃
            </button>
          </form>
        </div>
      </header>

      <main className="pb-20">
        {children}
      </main>

      {/* Footer / Support info can go here */}
      <footer className="max-w-md mx-auto px-4 py-10 border-t border-gray-50 text-center">
        <p className="text-xs text-gray-400">
          도움이 필요하신가요? <br />
          cs@kendo-manager.com
        </p>
      </footer>
    </div>
  );
}
