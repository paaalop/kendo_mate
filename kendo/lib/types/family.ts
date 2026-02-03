import { Database } from './database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Dojo = Database['public']['Tables']['dojos']['Row'];

export interface GuardianSummary {
  member_id: string;
  name: string;
  dojo_name: string | null;
  last_attendance_date: string | null;
  unpaid_count: number;
  unpaid_amount: number;
  link_status?: 'pending' | 'approved' | 'rejected' | null;
  link_request_type?: 'link' | 'unlink' | null;
}

export type LinkRequestStatus = 'pending' | 'approved' | 'rejected';

export interface LinkRequest {
  id: string;
  guardian_id: string;
  target_dojo_id: string;
  child_name: string;
  child_birthdate: string;
  request_type: 'link' | 'unlink';
  status: LinkRequestStatus;
  created_at: string;
  updated_at: string;
  // Joins
  dojo?: {
    name: string;
  };
}

export interface ShadowProfile extends Profile {
  is_shadow: boolean;
  owner_id: string | null;
  birthdate: string | null;
}

export interface CreateShadowProfileParams {
  name: string;
  birthdate: string;
}