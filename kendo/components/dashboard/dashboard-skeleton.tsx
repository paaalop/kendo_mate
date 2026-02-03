export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <header className="space-y-2">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="h-4 w-64 bg-gray-100 rounded-lg" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-24 bg-gray-100 rounded-3xl" />
        <div className="h-24 bg-gray-100 rounded-3xl" />
      </div>

      <div className="h-64 bg-gray-100 rounded-3xl" />
      
      <div className="space-y-4">
        <div className="h-32 bg-gray-50 rounded-3xl" />
        <div className="h-32 bg-gray-50 rounded-3xl" />
      </div>
    </div>
  )
}
