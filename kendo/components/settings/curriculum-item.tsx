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
    <div className="flex items-center justify-between p-3 border rounded-lg bg-white hover:bg-gray-50 transition">
      <div className="flex items-center space-x-3">
        <div className="flex flex-col space-y-1">
          <button 
            disabled={isFirst}
            onClick={() => onReorder(item.id, item.order_index - 1)}
            className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 text-gray-600"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button 
            disabled={isLast}
            onClick={() => onReorder(item.id, item.order_index + 1)}
            className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 text-gray-600"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{item.title}</h3>
          {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button onClick={() => onEdit(item)} className="p-2 text-gray-500 hover:text-blue-600">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(item.id)} className="p-2 text-gray-500 hover:text-red-600">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
