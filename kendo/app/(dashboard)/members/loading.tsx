import { Loader2 } from "lucide-react";

export default function MembersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </header>

      <div className="h-12 bg-gray-200 rounded-xl w-full"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl border border-gray-200"></div>
        ))}
      </div>
      
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    </div>
  );
}
