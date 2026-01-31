import { getMemberDetails, getAttendanceHistory } from "../actions";
import { MemberDetailView } from "@/components/members/member-detail-view";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MemberDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  
  try {
    // Parallelize all data fetching
    const [
      { profile, rankHistory },
      { logs, hasMore },
      { data: { user } }
    ] = await Promise.all([
      getMemberDetails(id),
      getAttendanceHistory(id, 0),
      supabase.auth.getUser()
    ]);

    const { data: viewerProfiles } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user?.id || "")
      .is("deleted_at", null);

    const viewerProfile = viewerProfiles?.find(p => ['owner', 'instructor'].includes(p.role || '')) || viewerProfiles?.[0];

    const isStaff = ['owner', 'instructor'].includes(viewerProfile?.role || '');

    return (
      <MemberDetailView 
        member={profile}
        rankHistory={rankHistory}
        attendanceLogs={logs || []}
        hasMoreAttendance={hasMore}
        isStaff={isStaff}
      />
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
}
