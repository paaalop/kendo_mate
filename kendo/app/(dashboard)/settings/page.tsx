import { checkOwnerRole } from "@/lib/utils/auth";
import { createClient } from "@/utils/supabase/server";
import { getSessionList, getCurriculumList } from "./actions";
import { SettingsTabs } from "@/components/settings/settings-tabs";

export default async function SettingsPage() {
  await checkOwnerRole();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("dojo_id, dojos(name)")
    .eq("user_id", user!.id)
    .single();

  const dojoName = (profile?.dojos as unknown as { name: string })?.name || "";
  const sessions = await getSessionList();
  const curriculumItems = await getCurriculumList();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">도장 관리 설정</h1>
        <p className="text-gray-500 mt-2">도장 정보, 수련 시간표 및 커리큘럼을 관리합니다.</p>
      </header>
      
      <SettingsTabs 
        initialDojoName={dojoName}
        sessions={sessions}
        curriculumItems={curriculumItems}
      />
    </div>
  );
}
