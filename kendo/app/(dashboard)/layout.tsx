import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { Sidebar } from "@/components/dashboard/sidebar";
import { FamilySwitcher } from "@/components/dashboard/family-switcher";
import { ManagementSubNav } from "@/components/dashboard/management-sub-nav";
import { getActiveProfileContext } from "@/lib/utils/profile";

interface ProfileWithDojo {
  id: string;
  role: string | null;
  dojos: { name: string } | null;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getActiveProfileContext();
  
  if (!context) {
    redirect("/login");
  }

  const { user, allProfiles, activeProfileId, isGuardian } = context;
  const supabase = await createClient();

  // If no profiles at all and not a guardian role, they might still need onboarding
  if (!allProfiles || allProfiles.length === 0) {
     // Check for pending signup requests
     const { data: signupRequests } = await supabase
       .from('signup_requests')
       .select('id, status')
       .eq('user_id', user.id)
       .eq('status', 'pending');

     if (signupRequests && signupRequests.length > 0) {
       redirect("/onboarding/status");
     }
     
     redirect("/onboarding");
  }

  const activeProfile = allProfiles?.find(p => p.id === activeProfileId) as any;
  const isStaff = activeProfile?.role === 'owner' || activeProfile?.role === 'instructor';
  const isOwner = activeProfile?.role === 'owner';
  const isAdult = activeProfile?.is_adult || false;
  
  const dojoName = activeProfile?.dojos?.name || "내 도장";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <Sidebar 
        isStaff={isStaff}
        isOwner={isOwner}
        dojoName={dojoName}
        activeProfileId={activeProfileId}
        allProfiles={allProfiles || []}
        isGuardian={isGuardian}
        isAdult={isAdult}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b p-4 flex items-center space-x-2">
          <MobileNav 
            isStaff={isStaff} 
            isOwner={isOwner} 
            dojoName={dojoName} 
            activeProfileId={activeProfileId} 
            isAdult={isAdult}
            isGuardian={isGuardian}
          />
          <div className="flex-1">
            <FamilySwitcher 
              profiles={allProfiles || []} 
              activeProfileId={activeProfileId || ''} 
              isGuardian={isGuardian} 
              isAdult={isAdult}
            />
          </div>
        </header>
        
        <ManagementSubNav />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}