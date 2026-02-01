import { checkOwnerRole } from "@/lib/utils/auth";
import { createClient } from "@/utils/supabase/server";
import { getSessionList, getCurriculumList } from "./actions";
import { DojoProfileForm } from "@/components/settings/dojo-profile-form";
import { SessionManager } from "@/components/settings/session-manager";
import { CurriculumList } from "@/components/settings/curriculum-list";

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
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      <h1 className="text-2xl font-bold mb-6">도장 설정</h1>
      
      <DojoProfileForm initialName={dojoName} />
      <SessionManager initialSessions={sessions} />
      <CurriculumList items={curriculumItems} />
    </div>
  );
}
