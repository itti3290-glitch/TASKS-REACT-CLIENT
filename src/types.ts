export type TaskCategory = 'doctor' | 'care' | 'visit' | 'shopping' | 'other';

export type Role = 'admin' | 'volunteer';

export type Task = {
  id: number;
  code: string;
  title: string;
  category: TaskCategory;
  starts_at: string;
  duration_minutes: number | null;
  volunteers_needed: number;
  location: string | null;
  description: string;
  patient_id: number;
  patient_name: string;
  patient_code: string;
  signed_up_count: number;
  is_mine: boolean;
  volunteer_names: string[];
  replacement_requested: boolean;
};

export type User = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: Role;
  monthly_quota: number;
  points: number;
};

export type Patient = {
  id: number;
  full_name: string;
  address: string;
  contact_phone: string;
  notes: string | null;
  patient_code: string;
  join_code?: string;
  volunteers?: { id: number; full_name: string }[];
};

export const categoryLabels: Record<TaskCategory, string> = {
  doctor: 'תור לרופא',
  care: 'השכבה ומקלחת',
  visit: 'ביקור התעניינות',
  shopping: 'קניות תרופות ומצרכים',
  other: 'אחר',
};
export type ReplacementRequest = {
  request_id: number;
  requester_name: string;
  task: Task;
};
