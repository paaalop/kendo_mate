'use client'

import { useState, useEffect } from 'react'
import { Menu, X, LayoutDashboard, Users, ClipboardList, LogOut, CreditCard, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface MobileNavProps {
  isStaff: boolean
  isOwner: boolean
  dojoName: string
  activeProfileId: string | undefined
}

export function MobileNav({ isStaff, isOwner, dojoName, activeProfileId }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const toggleMenu = () => setIsOpen(!isOpen)

  const navItems = [
    { href: '/', label: '대시보드', icon: LayoutDashboard },
    ...(isStaff ? [
      { href: '/members', label: '관원 관리', icon: Users },
      { href: '/admin/links', label: '연결 요청 관리', icon: ClipboardList },
      { href: '/training', label: '수련 관리', icon: ClipboardList },
    ] : []),
    ...(isOwner ? [
      { href: '/payments', label: '회비 관리', icon: CreditCard },
      { href: '/settings', label: '도장 설정', icon: Settings },
    ] : []),
    ...(!isStaff ? [
        { href: '/payments', label: '회비 관리', icon: CreditCard },
    ] : [])
  ]

  return (
    <>
      <button
        onClick={toggleMenu}
        className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        aria-label="메뉴 열기"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Drawer Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ease-in-out",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={toggleMenu}
      />

      {/* Drawer Content */}
      <div
        className={cn(
          "fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-blue-600 truncate">
              {activeProfileId === 'guardian_summary' ? '보호자 모드' : dojoName}
            </h1>
            <p className="text-xs text-gray-500 mt-1">검도 관리 시스템</p>
          </div>
          <button 
            onClick={toggleMenu} 
            className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center px-4 py-3 rounded-xl transition font-medium",
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

        <div className="p-4 border-t bg-gray-50">
          <form action="/api/auth/signout" method="post">
            <button className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition font-medium">
              <LogOut className="w-5 h-5 mr-3" />
              <span>로그아웃</span>
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
