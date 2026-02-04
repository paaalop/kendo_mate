"use client";

import { useState } from "react";
import { Building2, Clock, BookOpen } from "lucide-react";
import { DojoProfileForm } from "./dojo-profile-form";
import { SessionManager } from "./session-manager";
import { CurriculumList } from "./curriculum-list";
import { Session, CurriculumItem } from "@/lib/types/admin";
import { cn } from "@/lib/utils";

interface SettingsTabsProps {
  initialDojoName: string;
  sessions: Session[];
  curriculumItems: CurriculumItem[];
}

type TabType = "profile" | "sessions" | "curriculum";

export function SettingsTabs({ initialDojoName, sessions, curriculumItems }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  const tabs = [
    { id: "profile", label: "도장 프로필", icon: Building2 },
    { id: "sessions", label: "시간표 관리", icon: Clock },
    { id: "curriculum", label: "커리큘럼", icon: BookOpen },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex p-1 bg-gray-100/80 rounded-xl w-fit border border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg",
              activeTab === tab.id
                ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
            )}
          >
            <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-blue-600" : "text-gray-400")} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content with animation placeholder */}
      <div className="transition-all duration-300">
        {activeTab === "profile" && <DojoProfileForm initialName={initialDojoName} />}
        {activeTab === "sessions" && <SessionManager initialSessions={sessions} />}
        {activeTab === "curriculum" && <CurriculumList items={curriculumItems} />}
      </div>
    </div>
  );
}
