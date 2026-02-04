"use client";

import { useState } from "react";
import { manageSession } from "@/app/(dashboard)/settings/actions";
import { Loader2, Trash2, Plus, Edit2, Clock } from "lucide-react";
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
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">수련 시간표 관리</h2>
              <p className="text-sm text-gray-500 mt-1">도장에서 운영하는 수련 타임 정보를 관리합니다.</p>
            </div>
            <button 
              onClick={handleOpenCreate} 
              className="flex items-center gap-2 text-sm font-semibold bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors"
            >
                <Plus className="w-4 h-4" /> 추가하기
            </button>
        </div>

        <div className="p-6">
          <div className="grid gap-3">
              {initialSessions.map(session => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-2xl transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-blue-600 shadow-sm">
                          <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900">{session.name}</div>
                            <div className="text-gray-500 text-sm flex items-center gap-1.5 mt-0.5">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
                            </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenEdit(session)} 
                            className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="수정"
                          >
                              <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(session.id)} 
                            className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="삭제"
                          >
                              <Trash2 className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
              ))}
              {initialSessions.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl">
                  <Clock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium">등록된 수련 시간이 없습니다.</p>
                </div>
              )}
          </div>
        </div>

        {isModalOpen && editingSession && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md animate-in zoom-in-95 duration-200">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-900">{editingSession.id ? '수련 시간 수정' : '새 수련 시간 추가'}</h3>
                      <p className="text-sm text-gray-500 mt-1">타임 이름과 운영 시간을 입력해주세요.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">타임 이름</label>
                            <input 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                                placeholder="예: 오후 1부, 성인부 등"
                                value={editingSession.name} 
                                onChange={e => setEditingSession({...editingSession, name: e.target.value})}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">시작 시간</label>
                                <input 
                                    type="time" 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                                    value={editingSession.start_time?.slice(0,5)} 
                                    onChange={e => setEditingSession({...editingSession, start_time: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">종료 시간</label>
                                <input 
                                    type="time" 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                                    value={editingSession.end_time?.slice(0,5)} 
                                    onChange={e => setEditingSession({...editingSession, end_time: e.target.value})}
                                    required
                                />
                            </div>
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
