"use client";

import { useState } from "react";
import { CurriculumItem } from "@/lib/types/admin";
import { CurriculumItemCard } from "./curriculum-item";
import { manageCurriculumItem, reorderCurriculumItem } from "@/app/(dashboard)/settings/actions";
import { Loader2, Plus } from "lucide-react";

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
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">커리큘럼 관리</h2>
        <button onClick={handleCreate} className="flex items-center text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">
            <Plus className="w-4 h-4 mr-1" /> 추가
        </button>
      </div>

      <div className="space-y-2">
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
        {items.length === 0 && <p className="text-gray-400 text-center py-4">등록된 커리큘럼이 없습니다.</p>}
      </div>

      {isModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                <h3 className="text-lg font-bold mb-4">{editingItem.id ? '항목 수정' : '항목 추가'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">제목</label>
                        <input 
                            className="w-full border p-2 rounded" 
                            value={editingItem.title} 
                            onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">설명</label>
                        <textarea 
                            className="w-full border p-2 rounded h-20" 
                            value={editingItem.description || ''} 
                            onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                        />
                    </div>
                    <div className="flex space-x-2 mt-6">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-gray-100 rounded hover:bg-gray-200">취소</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex justify-center items-center">
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "저장"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
