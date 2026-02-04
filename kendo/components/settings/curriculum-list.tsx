"use client";

import { useState } from "react";
import { CurriculumItem } from "@/lib/types/admin";
import { CurriculumItemCard } from "./curriculum-item";
import { manageCurriculumItem, reorderCurriculumItem } from "@/app/(dashboard)/settings/actions";
import { Loader2, Plus, BookOpen } from "lucide-react";

interface CurriculumListProps {
  items: CurriculumItem[];
}

export function CurriculumList({ items }: CurriculumListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<CurriculumItem> | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    setEditingItem({ title: '', description: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (item: CurriculumItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    try {
      await manageCurriculumItem('delete', { id });
    } catch (e) {
      alert("삭제 실패");
    }
  };

  const handleReorder = async (id: string, newIndex: number) => {
    try {
      await reorderCurriculumItem(id, newIndex);
    } catch (e) {
      alert("순서 변경 실패");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setLoading(true);
    try {
      if (editingItem.id) {
        await manageCurriculumItem('update', editingItem);
      } else {
        await manageCurriculumItem('create', editingItem);
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (e) {
      console.error(e);
      alert("저장 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">커리큘럼 관리</h2>
          <p className="text-sm text-gray-500 mt-1">심사 항목 및 수련 커리큘럼을 관리합니다.</p>
        </div>
        <button 
          onClick={handleCreate} 
          className="flex items-center gap-2 text-sm font-semibold bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors"
        >
            <Plus className="w-4 h-4" /> 추가하기
        </button>
      </div>

      <div className="p-6">
        <div className="grid gap-3">
          {items.map(item => (
            <CurriculumItemCard 
              key={item.id} 
              item={item} 
              totalCount={items.length} 
              onEdit={handleEdit} 
              onDelete={handleDelete}
              onReorder={handleReorder}
            />
          ))}
          {items.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl">
              <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">등록된 커리큘럼 항목이 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md animate-in zoom-in-95 duration-200">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{editingItem.id ? '항목 수정' : '새 항목 추가'}</h3>
                  <p className="text-sm text-gray-500 mt-1">항목 제목과 설명을 입력해주세요.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">제목</label>
                        <input 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                            placeholder="예: 기본 머리치기, 연격 등"
                            value={editingItem.title} 
                            onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">설명 (선택)</label>
                        <textarea 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all h-28 resize-none" 
                            placeholder="항목에 대한 상세 설명을 입력하세요."
                            value={editingItem.description || ''} 
                            onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                        />
                    </div>
                    <div className="flex gap-3 mt-8">
                        <button 
                          type="button" 
                          onClick={() => setIsModalOpen(false)} 
                          className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                        >
                          취소
                        </button>
                        <button 
                          type="submit" 
                          disabled={loading} 
                          className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all flex justify-center items-center"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "저장하기"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
