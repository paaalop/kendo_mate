"use client";

import { CurriculumItem } from "@/lib/types/admin";
import { ArrowUp, ArrowDown, Trash2, Edit2 } from "lucide-react";

interface CurriculumItemProps {
  item: CurriculumItem;
  totalCount: number;
  onEdit: (item: CurriculumItem) => void;
  onDelete: (id: string) => void;
  onReorder: (id: string, newIndex: number) => void;
}

export function CurriculumItemCard({ item, totalCount, onEdit, onDelete, onReorder }: CurriculumItemProps) {
  // item.order_index is 1-based (usually) based on my logic (count + 1).
  const isFirst = item.order_index === 1;
  const isLast = item.order_index === totalCount;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-2xl transition-all group">
      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
          <button 
            disabled={isFirst}
            onClick={() => onReorder(item.id, item.order_index - 1)}
            className="p-1 hover:bg-blue-50 hover:text-blue-600 rounded-lg disabled:opacity-20 text-gray-400 transition-all"
            title="위로 이동"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button 
            disabled={isLast}
            onClick={() => onReorder(item.id, item.order_index + 1)}
            className="p-1 hover:bg-blue-50 hover:text-blue-600 rounded-lg disabled:opacity-20 text-gray-400 transition-all"
            title="아래로 이동"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 leading-tight">{item.title}</h3>
          {item.description && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{item.description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => onEdit(item)} 
          className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          title="수정"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onDelete(item.id)} 
          className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          title="삭제"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
