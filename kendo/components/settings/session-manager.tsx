"use client";

import { useState } from "react";
import { manageSession } from "@/app/(dashboard)/settings/actions";
import { Loader2, Trash2, Plus, Edit2 } from "lucide-react";
import { Session } from "@/lib/types/admin";

interface SessionManagerProps {
  initialSessions: Session[];
}

export function SessionManager({ initialSessions }: SessionManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Partial<Session> | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpenCreate = () => {
    setEditingSession({ name: '', start_time: '19:00', end_time: '20:00' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (session: Session) => {
    setEditingSession(session);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
        await manageSession('delete', { id });
    } catch(e) {
        alert("삭제 실패");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;
    setLoading(true);
    try {
        if (editingSession.id) {
            await manageSession('update', editingSession);
        } else {
            await manageSession('create', editingSession);
        }
        setIsModalOpen(false);
        setEditingSession(null);
    } catch(e) {
        console.error(e);
        alert("저장 실패");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">수련 시간표</h2>
            <button onClick={handleOpenCreate} className="flex items-center text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">
                <Plus className="w-4 h-4 mr-1" /> 추가
            </button>
        </div>

        <div className="space-y-2">
            {initialSessions.map(session => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                    <div>
                        <div className="font-bold">{session.name}</div>
                        <div className="text-gray-500 text-sm">
                            {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={() => handleOpenEdit(session)} className="p-2 text-gray-500 hover:text-blue-600">
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(session.id)} className="p-2 text-gray-500 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
            {initialSessions.length === 0 && <p className="text-gray-400 text-center py-4">등록된 세션이 없습니다.</p>}
        </div>

        {isModalOpen && editingSession && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                    <h3 className="text-lg font-bold mb-4">{editingSession.id ? '세션 수정' : '세션 추가'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">이름</label>
                            <input 
                                className="w-full border p-2 rounded" 
                                value={editingSession.name} 
                                onChange={e => setEditingSession({...editingSession, name: e.target.value})}
                                required
                            />
                        </div>
                        <div className="flex space-x-2">
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">시작</label>
                                <input 
                                    type="time" 
                                    className="w-full border p-2 rounded" 
                                    value={editingSession.start_time?.slice(0,5)} 
                                    onChange={e => setEditingSession({...editingSession, start_time: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">종료</label>
                                <input 
                                    type="time" 
                                    className="w-full border p-2 rounded" 
                                    value={editingSession.end_time?.slice(0,5)} 
                                    onChange={e => setEditingSession({...editingSession, end_time: e.target.value})}
                                    required
                                />
                            </div>
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
