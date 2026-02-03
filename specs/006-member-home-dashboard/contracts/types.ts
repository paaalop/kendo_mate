export type LinkRequestStatus = 'pending' | 'approved' | 'rejected';

export interface LinkRequest {
  id: string;
  guardian_id: string;
  target_dojo_id: string;
  child_name: string;
  child_birthdate: string; // YYYY-MM-DD
  status: LinkRequestStatus;
  created_at: string;
  updated_at: string;
}

export interface GuardianSummaryItem {
  member_id: string;
  name: string;
  dojo_name: string;
  last_attendance: string | null;
  unpaid_count: number;
}

export interface ShadowMember {
  id: string;
  name: string;
  dojo_id: string;
  owner_id: string;
  is_shadow: true;
  // ... other member fields
}
