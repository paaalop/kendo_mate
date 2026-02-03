import { getPendingSignupRequests } from "@/app/(dashboard)/members/actions";
import { SignupRequestCard } from "./signup-request-card";
import { SignupRequest } from "@/lib/types/member";

interface SignupRequestsListProps {
  requests?: SignupRequest[];
}

export async function SignupRequestsList({ requests: providedRequests }: SignupRequestsListProps) {
  // Use provided requests or fetch if not provided
  const requests = providedRequests !== undefined 
    ? providedRequests 
    : await getPendingSignupRequests();

  if (!requests || requests.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">신규 가입 요청</h2>
        <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">
          {requests.length}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map((request) => (
          <SignupRequestCard key={request.id} request={request} />
        ))}
      </div>
    </div>
  );
}