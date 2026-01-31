import { Database } from './database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type SignupRequest = Database['public']['Tables']['signup_requests']['Row'];
export type RankHistory = Database['public']['Tables']['rank_history']['Row'];

export interface RankHistoryWithProfile extends RankHistory {
  promoted_by_profile: {
    name: string;
  } | null;
}

export type Member = Profile;

export type MemberRole = 'owner' | 'instructor' | 'member' | 'guardian';

export interface AttendanceHistoryItem {
  id: string;
  attended_at: string | null;
  check_type: 'manual' | 'qr' | 'face' | string | null;
}
