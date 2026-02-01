export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <header>
        <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-48"></div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-32"></div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64"></div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80"></div>
    </div>
  );
}
