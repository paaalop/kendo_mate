'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const items = [
  { href: '/members', label: '관원 관리', match: '/members' },
  { href: '/payments', label: '회비 관리', match: '/payments' },
  { href: '/admin/members/requests', label: '연결 요청 관리', match: '/admin/members/requests' },
  { href: '/admin/members/upload', label: '일괄 등록', match: '/admin/members/upload' },
]

export function ManagementSubNav() {
  const pathname = usePathname()

  // Only show this sub-nav if we are on one of the management pages or their sub-paths
  const isManagementPage = items.some(item => pathname.startsWith(item.match))
  
  if (!isManagementPage) return null

  return (
    <div className="bg-white border-b px-4 md:px-8 mb-4">
      <div className="flex space-x-8 overflow-x-auto no-scrollbar">
        {items.map((item) => {
          // Highlight if it's an exact match or a sub-path of the item's match path
          // Special case for /members to not highlight for /members/requests if that's a thing
          // But here paths are distinct enough.
          const isActive = pathname.startsWith(item.match)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
