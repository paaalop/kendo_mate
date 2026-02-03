'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, ClipboardList, CreditCard, Settings, MessageCircle } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface BottomNavProps {
  isStaff: boolean
  isOwner: boolean
}

export function BottomNav({ isStaff, isOwner }: BottomNavProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: '홈', icon: LayoutDashboard },
    { href: '/community', label: '커뮤니티', icon: MessageCircle },
    ...(isStaff ? [
      { href: '/members', label: '관원', icon: Users },
      { href: '/training', label: '수련', icon: ClipboardList },
    ] : []),
    ...(isOwner ? [
      { href: '/payments', label: '회비', icon: CreditCard },
      { href: '/settings', label: '설정', icon: Settings },
    ] : []),
    ...(!isStaff && !isOwner ? [
      { href: '/payments', label: '회비', icon: CreditCard },
    ] : [])
  ].slice(0, 5) // Limit to 5 items

  return (
    <nav className="md:hidden bg-white border-t flex justify-around p-2 pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link 
            key={item.href}
            href={item.href} 
            className={cn(
              "flex flex-col items-center p-2 transition-colors",
              isActive ? "text-blue-600" : "text-gray-500"
            )}
          >
            <item.icon className={cn("w-6 h-6", isActive ? "stroke-[2.5px]" : "stroke-2")} />
            <span className={cn("text-[10px] mt-1 font-medium", isActive ? "text-blue-600" : "text-gray-500")}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
