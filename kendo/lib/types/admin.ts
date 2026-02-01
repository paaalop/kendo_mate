import { Database } from './database.types';

export type Payment = Database['public']['Tables']['payments']['Row'];
export type Session = Database['public']['Tables']['sessions']['Row'];
export type CurriculumItem = Database['public']['Tables']['curriculum_items']['Row'];
