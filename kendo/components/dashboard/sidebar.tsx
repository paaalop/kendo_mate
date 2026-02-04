'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ClipboardList, LogOut, Settings, MessageCircle, UserPlus, Building2 } from 'lucide-react'
import { FamilySwitcher } from './family-switcher'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Profile } from '@/lib/types/family'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface SidebarProps {
  isStaff: boolean
  isOwner: boolean
  dojoName: string
  activeProfileId: string | undefined
  allProfiles: Profile[]
  isGuardian: boolean
  isAdult: boolean
}

export function Sidebar({ 
  isStaff, 
  isOwner, 
  dojoName, 
  activeProfileId, 
  allProfiles, 
  isGuardian,
  isAdult
}: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/community', label: '커뮤니티', icon: MessageCircle },
    { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
    ...(isStaff ? [
      { 
        href: '/members', 
        label: '도장 관리', 
        icon: Building2,
        active: ['/members', '/payments', '/admin/members/requests', '/admin/members/upload'].some(path => pathname.startsWith(path))
      },
      { href: '/training', label: '수련 관리', icon: ClipboardList },
    ] : []),
    ...(isAdult || isGuardian ? [
      { href: '/family/link', label: '자녀 연결', icon: UserPlus },
    ] : []),
    ...(isOwner ? [
      { href: '/settings', label: '도장 설정', icon: Settings },
    ] : [
      { href: '/settings/profile', label: '내 정보 설정', icon: Settings },
    ])
  ]

  return (
    <aside className="hidden md:flex w-64 bg-white border-r flex-col">
      <div className="p-6 border-b space-y-4">
        <h1 className="text-xl font-bold text-blue-600 truncate">
          {dojoName}
        </h1>
        <FamilySwitcher 
          profiles={allProfiles} 
          activeProfileId={activeProfileId || ''} 
          isGuardian={isGuardian} 
          isAdult={isAdult}
        />
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.active !== undefined ? item.active : pathname === item.href
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={cn(
                "flex items-center px-4 py-3 rounded-xl transition font-medium group",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              )}
            >
              <item.icon className={cn("w-5 h-5 mr-3", isActive ? "text-white" : "text-gray-400 group-hover:text-blue-600")} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t">
        <form action="/api/auth/signout" method="post">
          <button className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition font-medium">
            <LogOut className="w-5 h-5 mr-3 text-gray-400 group-hover:text-red-600" />
            <span>로그아웃</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
