'use client'

import { useState, useTransition } from 'react'
import { ChevronDown, User, ShieldCheck, PlusCircle, Check } from 'lucide-react'
import { setActiveProfile } from '@/lib/actions/family-actions'
import Link from 'next/link'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface Profile {
  id: string
  name: string
  role?: string | null
  is_shadow?: boolean | null
  dojo_id?: string | null
  dojos?: { name: string } | null
}

interface FamilySwitcherProps {
  profiles: Profile[]
  activeProfileId: string
  isGuardian: boolean
}

export function FamilySwitcher({ profiles, activeProfileId, isGuardian }: FamilySwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const currentProfile = activeProfileId === 'guardian_summary' 
    ? { name: '보호자 요약', id: 'guardian_summary' }
    : profiles.find(p => p.id === activeProfileId)

  const handleSwitch = (id: string) => {
    startTransition(async () => {
      await setActiveProfile(id === 'guardian_summary' ? 'guardian' : id)
      setIsOpen(false)
      // Redirect to home to ensure proper layout/permissions are loaded
      window.location.href = '/'
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition min-h-[44px]"
      >
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors",
          activeProfileId !== 'guardian_summary' ? "bg-blue-600 border-blue-400" : "bg-blue-100 border-transparent"
        )}>
          {activeProfileId === 'guardian_summary' ? (
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          ) : (
            <User className={cn("w-4 h-4", activeProfileId !== 'guardian_summary' ? "text-white" : "text-blue-600")} />
          )}
        </div>
        <div className="text-left">
          <p className="text-xs font-bold text-gray-900 leading-none">
            {currentProfile?.name || '프로필 선택'}
          </p>
          {activeProfileId !== 'guardian_summary' && currentProfile && (
            <p className="text-[10px] text-gray-500 mt-0.5">
              {(currentProfile as Profile).dojos?.name || '소속 없음'}
            </p>
          )}
        </div>
        <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-2 space-y-1">
              {isGuardian && (
                <button
                  onClick={() => handleSwitch('guardian_summary')}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl transition text-left",
                    activeProfileId === 'guardian_summary' ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50 text-gray-700"
                  )}
                >
                  <div className="flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-3" />
                    <span className="text-sm font-bold">보호자 요약</span>
                  </div>
                  {activeProfileId === 'guardian_summary' && <Check className="w-4 h-4" />}
                </button>
              )}

              <div className="h-px bg-gray-100 my-1" />
              <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">프로필 목록</p>

              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => handleSwitch(profile.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl transition text-left",
                    activeProfileId === profile.id ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50 text-gray-700"
                  )}
                >
                  <div className="flex items-center min-w-0">
                    <User className="w-4 h-4 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{profile.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">
                        {profile.dojos?.name || (profile.is_shadow ? '미연결 가상 프로필' : '소속 없음')}
                      </p>
                    </div>
                  </div>
                  {activeProfileId === profile.id && <Check className="w-4 h-4 flex-shrink-0" />}
                </button>
              ))}

              <div className="h-px bg-gray-100 my-1" />
              <Link
                href="/family/create"
                onClick={() => setIsOpen(false)}
                className="flex items-center p-3 text-gray-600 hover:bg-gray-50 rounded-xl transition"
              >
                <PlusCircle className="w-4 h-4 mr-3" />
                <span className="text-sm">새 프로필 만들기</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
