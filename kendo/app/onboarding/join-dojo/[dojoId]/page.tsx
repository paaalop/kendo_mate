import { JoinDojoForm } from "@/components/onboarding/join-dojo-form";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function JoinDojoDetailPage({
  params,
}: {
  params: { dojoId: string };
}) {
  const { dojoId } = await params;
  const supabase = await createClient();

  const { data: dojo, error } = await supabase
    .from("dojos")
    .select("id, name, owner_id, profiles!inner(name)")
    .eq("id", dojoId)
    .eq("profiles.role", "owner")
    .single();

  if (error || !dojo) {
    notFound();
  }

  const ownerName = (dojo.profiles as any)[0]?.name || "관장 미지정";

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <Link
        href="/onboarding/join-dojo"
        className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        도장 다시 찾기
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{dojo.name}</h1>
        <p className="text-gray-600 mt-1">
          {ownerName} 관장님께 가입 신청을 보냅니다.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <JoinDojoForm dojoId={dojoId} />
      </div>
      
      <p className="mt-6 text-xs text-center text-gray-400">
        가입 신청 후 관장님이 승인하면 서비스 이용이 가능합니다.
      </p>
    </div>
  );
}
