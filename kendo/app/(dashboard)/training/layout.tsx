import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function TrainingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .is("deleted_at", null);

  const profile = profiles?.find(p => ["owner", "instructor"].includes(p.role || "")) || profiles?.[0];

  if (!profile || (profile.role !== "owner" && profile.role !== "instructor")) {
    // 권한이 없는 경우 홈으로 리다이렉트하거나 접근 제한 메시지를 표시할 수 있습니다.
    // 여기서는 홈으로 리다이렉트합니다.
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">수련 관리</h1>
          <p className="text-sm text-gray-500">관원들의 출석과 진도를 한눈에 관리하세요.</p>
        </div>
      </header>
      {children}
    </div>
  );
}
