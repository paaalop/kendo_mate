"use client";

import { StatusBadge } from "./status-badge";
import { updatePaymentStatus } from "@/app/(dashboard)/payments/actions";
import { useOptimistic, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Payment {
  id: string;
  user_name: string;
  user_phone: string;
  status: 'paid' | 'unpaid' | 'pending' | string;
  paid_at: string | null;
  amount: number | null;
}

interface PaymentListProps {
  payments: Payment[];
}

export function PaymentList({ payments }: PaymentListProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticPayments, setOptimisticPayments] = useOptimistic(
    payments,
    (state, { id, status }: { id: string, status: string }) => 
      state.map(p => p.id === id ? { ...p, status } : p)
  );

  const handleStatusClick = async (payment: Payment) => {
    const nextStatus = 
      payment.status === 'unpaid' ? 'pending' :
      payment.status === 'pending' ? 'paid' : 'unpaid';

    startTransition(async () => {
      setOptimisticPayments({ id: payment.id, status: nextStatus });
      try {
        await updatePaymentStatus(payment.id, nextStatus as 'paid' | 'unpaid' | 'pending');
        toast.success(`${payment.user_name}님의 상태가 변경되었습니다.`);
      } catch (e) {
        console.error(e);
        toast.error("업데이트에 실패했습니다.");
      }
    });
  };

  if (optimisticPayments.length === 0) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
        <p className="text-gray-500 mb-2">데이터가 없습니다.</p>
        <p className="text-sm text-gray-400">이번 달 내역을 생성하거나 관원이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <div className="divide-y">
        {optimisticPayments.map((payment) => (
          <div key={payment.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
            <div>
              <div className="font-semibold text-gray-900">{payment.user_name}</div>
              <div className="text-sm text-gray-500">{payment.user_phone}</div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block min-w-[80px]">
                <div className="font-medium text-gray-900">{payment.amount ? `${payment.amount.toLocaleString()}원` : '-'}</div>
                {payment.paid_at && <div className="text-xs text-gray-400">{new Date(payment.paid_at).toLocaleDateString()}</div>}
              </div>
              <div className="relative">
                <StatusBadge 
                  status={payment.status as 'paid' | 'unpaid' | 'pending'} 
                  onClick={() => handleStatusClick(payment)} 
                  className="cursor-pointer select-none"
                />
                {isPending && payment.id === optimisticPayments.find(p => p.id === payment.id)?.id && (
                  <div className="absolute -top-1 -right-1">
                    <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}