'use client'

import { useState } from 'react'
import { findMyChildren, createLinkRequest } from '@/app/(dashboard)/family/link/actions'
import type { Database } from '@/lib/types/database.types'

type Dojo = Pick<Database['public']['Tables']['dojos']['Row'], 'id' | 'name'>
type Child = { id: string, name: string, birthdate: string | null }

export function LinkRequestForm({ dojos }: { dojos: Dojo[] }) {
  const [selectedDojoId, setSelectedDojoId] = useState('')
  const [searchResults, setSearchResults] = useState<Child[]>([])
  const [relationship, setRelationship] = useState('부모')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDojoId) return
    
    setLoading(true)
    setMessage('')
    setSearchResults([])
    
    const res = await findMyChildren(selectedDojoId)
    setLoading(false)
    
    if (res.error) {
      setMessage(res.error)
    } else if (res.data) {
      setSearchResults(res.data as Child[])
    }
  }

  const handleRequest = async (childId: string) => {
    setLoading(true)
    const res = await createLinkRequest(childId, relationship)
    setLoading(false)
    
    if (res.error) {
      setMessage(res.error)
    } else {
      setMessage('연결 요청을 보냈습니다. 관장님의 승인을 기다려주세요.')
      setSearchResults(prev => prev.filter(c => c.id !== childId))
    }
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">소속 도장 선택</label>
          <select
            className="w-full border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 transition-all"
            value={selectedDojoId}
            onChange={e => setSelectedDojoId(e.target.value)}
            required
          >
            <option value="">도장을 선택해주세요</option>
            {dojos.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        
        <button
          type="submit"
          disabled={loading || !selectedDojoId}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold disabled:opacity-50 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          {loading ? '검색 중...' : '연락처로 자녀 정보 찾기'}
        </button>
      </form>

      {message && (
        <div className={`p-4 rounded-xl text-center text-sm font-medium ${message.includes('요청') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="font-bold text-gray-900">검색된 관원 정보</h3>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-400 uppercase">관계 설정</label>
            <select
              className="w-full border-gray-200 rounded-xl p-3 bg-gray-50 text-sm font-bold"
              value={relationship}
              onChange={e => setRelationship(e.target.value)}
            >
              <option value="부">부</option>
              <option value="모">모</option>
              <option value="조부모">조부모</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div className="grid gap-3">
            {searchResults.map(child => (
              <div key={child.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <p className="font-bold text-gray-900">{child.name}</p>
                  <p className="text-xs text-gray-500">{child.birthdate || '생년월일 미등록'}</p>
                </div>
                <button
                  onClick={() => handleRequest(child.id)}
                  disabled={loading}
                  className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-black transition-all"
                >
                  연결 요청
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}