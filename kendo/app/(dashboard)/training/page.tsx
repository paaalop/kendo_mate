import { fetchTrainingData } from "./actions";
import { TrainingContainer } from "@/components/training/training-container";
import { PromotionManager } from "@/components/training/promotion-manager";

export const dynamic = "force-dynamic";

export default async function TrainingPage() {
  const { members, dojoId } = await fetchTrainingData();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* 승급 심사 관리 */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-6 text-white shadow-xl overflow-hidden relative">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-xl font-bold">승급 심사 관리</h2>
            <p className="text-blue-100 text-sm">도장 전체 관원에게 심사 일정 알림을 보냅니다.</p>
          </div>
          <PromotionManager dojoId={dojoId} />
        </div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </section>

      {/* 메인 트레이닝 컨테이너 */}
      <TrainingContainer initialMembers={members} dojoId={dojoId} />
    </div>
  );
}