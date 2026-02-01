import { cn } from "@/lib/utils";

type Status = 'paid' | 'unpaid' | 'pending';

interface StatusBadgeProps {
  status: Status;
  className?: string;
  onClick?: () => void;
}

const statusConfig = {
  paid: { label: '납부완료', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  unpaid: { label: '미납', className: 'bg-red-100 text-red-800 border-red-200' },
  pending: { label: '확인중', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
};

export function StatusBadge({ status, className, onClick }: StatusBadgeProps) {
  const config = statusConfig[status as Status] || statusConfig.unpaid;
  
  return (
    <span 
      className={cn(
        "px-3 py-1 rounded-full text-sm font-semibold border inline-flex items-center justify-center min-w-[80px]",
        config.className,
        onClick && "cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
      onClick={onClick}
    >
      {config.label}
    </span>
  );
}
