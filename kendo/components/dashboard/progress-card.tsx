'use client'

import { Trophy, Target } from 'lucide-react'

interface CurriculumItem {
  id: string
  title: string
  category: string | null
  order_index: number
  required_rank_level: number | null
}

interface ProgressCardProps {
  currentItem: CurriculumItem | null
  progressRate: number
}

export function ProgressCard({ currentItem, progressRate }: ProgressCardProps) {
  if (!currentItem) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">축하합니다!</h3>
        <p className="text-gray-500 mt-2">모든 커리큘럼을 완료했습니다.</p>
        
        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-gray-400 uppercase">전체 진도율</span>
            <span className="text-green-600">100%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 w-full" />
          </div>
        </div>
      </div>
    )
  }

  const categoryMap: Record<string, string> = {
    'basic': '기본기',
    'technique': '기술',
    'sparring': '대련'
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">수련 목표</p>
            <h3 className="text-lg font-bold text-gray-900">현재 연습 중인 기술</h3>
          </div>
        </div>
        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
          {categoryMap[currentItem.category || ''] || '수련'}
        </span>
      </div>

      <div className="p-4 bg-gray-50 rounded-2xl mb-6">
        <p className="text-xs text-gray-500 mb-1"># {currentItem.order_index}</p>
        <h4 className="text-xl font-bold text-gray-900">{currentItem.title}</h4>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-gray-400 uppercase">진도율</span>
          <span className="text-blue-600">{progressRate}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-1000" 
            style={{ width: `${progressRate}%` }} 
          />
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-2 italic">
          지도진이 수련 완료를 체크하면 다음 단계로 넘어갑니다.
        </p>
      </div>
    </div>
  )
}
