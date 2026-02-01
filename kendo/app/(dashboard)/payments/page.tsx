import { checkOwnerRole } from "@/lib/utils/auth";
import { getMonthlyPayments } from "./actions";
import { PaymentList } from "@/components/payments/payment-list";
import { MonthPicker } from "@/components/payments/month-picker";
import { InitializeButton } from "@/components/payments/initialize-button";

interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function PaymentsPage(props: PageProps) {
  await checkOwnerRole();
  
  const searchParams = await props.searchParams;
  const month = searchParams.month || new Date().toISOString().slice(0, 7);
  const monthDate = `${month}-01`;

  const payments = await getMonthlyPayments(monthDate);

  // T033: Check if selected month is in the future
  const targetDate = new Date(monthDate);
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const isFutureMonth = targetDate > currentMonth;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">회비 관리</h1>
        <MonthPicker />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center border border-blue-100">
        <div className="text-blue-900">
          <span className="font-bold text-lg">{payments.length}</span> 명의 내역
        </div>
        {!isFutureMonth && (
           <InitializeButton monthDate={monthDate} />
        )}
        {isFutureMonth && (
          <span className="text-xs text-blue-400 font-medium">미래 월은 생성할 수 없습니다.</span>
        )}
      </div>

      <PaymentList payments={payments} />
    </div>
  );
}
