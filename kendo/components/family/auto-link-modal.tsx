'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { linkChild } from '@/app/(dashboard)/family/actions'
import type { Database } from '@/lib/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AutoLinkModalProps {
  childrenToLink: Profile[]
}

export function AutoLinkModal({ childrenToLink }: AutoLinkModalProps) {
  const [open, setOpen] = useState(true)
  const [childrenList, setChildrenList] = useState(childrenToLink)
  const [isLoading, setIsLoading] = useState(false)
  const [relationships, setRelationships] = useState<Record<string, string>>({})

  const handleLink = async (profileId: string) => {
    const relation = relationships[profileId] || '부모'
    setIsLoading(true)
    try {
      await linkChild(profileId, relation)
      // Remove linked child from list
      const newList = childrenList.filter(c => c.id !== profileId)
      setChildrenList(newList)
      
      if (newList.length === 0) {
        setOpen(false)
      }
    } catch (err) {
      console.error(err)
      alert('Failed to link.')
    } finally {
      setIsLoading(false)
    }
  }

  if (childrenList.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>자녀 발견</DialogTitle>
          <DialogDescription>
            연락처 정보가 일치하는 학생을 찾았습니다. 자녀가 맞다면 연결해주세요.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {childrenList.map(child => (
            <div key={child.id} className="flex items-center justify-between border p-3 rounded-md">
              <div>
                <p className="font-medium">{child.name}</p>
                <p className="text-sm text-gray-500">{child.birthdate || '생년월일 미입력'}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="text-sm border rounded p-1"
                  value={relationships[child.id] || '부모'}
                  onChange={(e) => setRelationships(prev => ({ ...prev, [child.id]: e.target.value }))}
                >
                  <option value="부">부</option>
                  <option value="모">모</option>
                  <option value="조부모">조부모</option>
                  <option value="기타">기타</option>
                </select>
                <button
                  onClick={() => handleLink(child.id)}
                  disabled={isLoading}
                  className="bg-indigo-600 text-white text-sm px-3 py-1 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  연결
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <DialogFooter>
          <button onClick={() => setOpen(false)} className="text-sm text-gray-500 hover:text-gray-700">
            나중에 하기
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
