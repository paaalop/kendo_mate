'use client'

import { useState, useEffect, useTransition } from 'react'
import { searchDojos } from '@/app/onboarding/actions'
import { Search, MapPin, User, ChevronRight, Loader2 } from 'lucide-react'
import { createLinkRequest } from '@/lib/actions/family-actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface LinkDojoSearchProps {
  profileId: string
  profileName: string
  profileBirthdate: string
}

export function LinkDojoSearch({ profileId, profileName, profileBirthdate }: LinkDojoSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ id: string; name: string; ownerName: string }[]>([])
  const [isSearching, startSearchTransition] = useTransition()
  const [isLinking, startLinkTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        startSearchTransition(async () => {
          const data = await searchDojos(query)
          setResults(data)
        })
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleLink = (dojoId: string, dojoName: string) => {
    if (confirm(`${profileName}님을 ${dojoName}에 연결 요청하시겠습니까?`)) {
      startLinkTransition(async () => {
        const formData = new FormData()
        formData.append('shadowProfileId', profileId)
        formData.append('targetDojoId', dojoId)
        formData.append('childName', profileName)
        formData.append('childBirthdate', profileBirthdate)

        const result = await createLinkRequest(null, formData)

        if (result?.error) {
          toast.error(result.error)
        } else {
          toast.success('연결 요청이 전송되었습니다.')
          router.push('/')
        }
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
          placeholder="연결할 도장 이름을 입력하세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLinking}
        />
        {(isSearching || isLinking) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        {results.length > 0 ? (
          results.map((dojo) => (
            <button
              key={dojo.id}
              onClick={() => handleLink(dojo.id, dojo.name)}
              disabled={isLinking}
              className="w-full flex items-center p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group text-left"
            >
              <div className="bg-gray-100 p-2 rounded-lg mr-4 group-hover:bg-blue-100 transition">
                <MapPin className="text-gray-500 group-hover:text-blue-600 w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{dojo.name}</h3>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <User className="w-3 h-3 mr-1" />
                  <span>{dojo.ownerName} 관장님</span>
                </div>
              </div>
              <ChevronRight className="text-gray-400" />
            </button>
          ))
        ) : query.length >= 2 && !isSearching ? (
          <p className="text-center py-10 text-gray-500">검색 결과가 없습니다.</p>
        ) : query.length > 0 && query.length < 2 ? (
          <p className="text-center py-10 text-gray-400 text-sm">2자 이상 입력해주세요.</p>
        ) : (
          <div className="text-center py-10">
              <p className="text-gray-400 text-sm italic">도장 이름을 검색하여 연결 요청을 보내세요.</p>
          </div>
        )}
      </div>
    </div>
  )
}
